package lobbies

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/scott-dang/Steam-SyncUp/pkg/model"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

type LobbiesServiceResponseBody struct {
	Text string `json:"text"`
}

func Handler(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	switch request.Resource {
	case "/CreateLobby":
		return handleCreateLobby(context, request)

	case "/GetLobbies":
		return handleGetLobbies(context, request)

	case "/JoinLobby":
		return handleJoinLobby(context, request)

	case "/LeaveLobby":
		return handleLeaveLobby(context, request)

	case "/KickLobbyUser":
		return HandleKickLobbyUser(context, request)

	default:
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusNotFound,
		}, nil
	}
}

type CreateLobbyRequest struct {
	Lobby model.Lobby `json:"lobby"`
}

/*
Request Params
"game": string - the Steam Appid of the game to create a lobby for
"name": string - the name of the lobby
"maxusers": int - the maximum number of users that can join the lobby

If the creation is a success, the response will be a 200 OK
If the request is unauthorized, the response will be a 401 Unauthorized
If the user already owns a lobby, the response will be a 400 Bad Request
If the max number of users is < 2 or > 10, the response will be a 400 Bad Request
*/
func handleCreateLobby(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// authenticate the request
	user, err := util.Authenticate(request, context)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	// validate correct request params
	game := request.QueryStringParameters["game"]
	name := request.QueryStringParameters["name"]
	maxusersStr := request.QueryStringParameters["maxusers"]

	if game == "" || name == "" || maxusersStr == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"missing required parameters\" }",
		}, nil
	}

	maxusers, err := strconv.Atoi(maxusersStr)

	if err != nil || maxusers < 2 || maxusers > 10 {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"bad num of users\" }",
		}, nil
	}

	// Make sure user is not in a lobby already
	if user.LobbyLeader != "" || user.LobbyGame != "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"user is already in a lobby\" }",
		}, nil
	}

	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	// Make sure user is not already in a lobby
	if user.LobbyGame != "" || user.LobbyLeader != "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"user is already in a lobby\" }",
		}, nil
	}

	userDynamoDBAttribute := util.PublicUserToDynamoDBAttribute(util.UserToPublicUser(user))
	lobbyUsersMapping := map[string]types.AttributeValue{user.SteamUUID: userDynamoDBAttribute}

	// create the new lobby in dynamodb
	lobbyInput := &dynamodb.PutItemInput{
		TableName: aws.String("Lobbies"),
		Item: map[string]types.AttributeValue{
			"leader":     &types.AttributeValueMemberS{Value: user.SteamUUID},
			"appid":      &types.AttributeValueMemberN{Value: game},
			"lobbyname":  &types.AttributeValueMemberS{Value: name},
			"lobbyusers": &types.AttributeValueMemberM{Value: lobbyUsersMapping},
			"maxusers":   &types.AttributeValueMemberN{Value: maxusersStr},
			"messages":   &types.AttributeValueMemberL{},
		},
	}

	_, err = client.PutItem(context, lobbyInput)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	// update user in dynamodb to hold new lobby
	userInput := &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"SteamUUID": &types.AttributeValueMemberS{Value: user.SteamUUID},
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":lobbygame":   &types.AttributeValueMemberS{Value: game},
			":lobbyleader": &types.AttributeValueMemberS{Value: user.SteamUUID},
		},
		UpdateExpression: aws.String("SET LobbyGame = :lobbygame, LobbyLeader = :lobbyleader"),
	}

	_, err = client.UpdateItem(context, userInput)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}

/*
Request params
"game": number - the Steam Appid of the game to get lobbies for

If the request is successful, the response will be a 200 OK with a list of lobbies
*/
func handleGetLobbies(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	_, err := util.Authenticate(request, context)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	// validate correct request params

	game := request.QueryStringParameters["game"]

	if game == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"missing required parameters\" }",
		}, nil
	}

	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	// get the lobbies from DynamoDB

	response, err := client.Query(context, &dynamodb.QueryInput{
		TableName:              aws.String("Lobbies"),
		KeyConditionExpression: aws.String("appid = :a"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":a": &types.AttributeValueMemberN{Value: game},
		},
		ProjectionExpression: aws.String("appid, leader, lobbyname, lobbyusers, maxusers, messages"),
	})

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "{ \"error\": \"" + err.Error() + "\" }",
		}, nil
	}

	var lobbies []model.Lobby
	err = attributevalue.UnmarshalListOfMaps(response.Items, &lobbies)

	if err != nil {
		fmt.Println(err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	responseBody, err := json.Marshal(lobbies)

	if err != nil {
		fmt.Println(err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(responseBody),
	}, nil
}

/*
Request params
"game": number - the Steam Appid of the lobby's game
"leader": string - the Steam UUID of the lobby's leader

If the request is successful, the response will be a 200 OK
If the user is not authenticated, the response will be a 401 Unauthorized
If the request is missing parameters, the response will be a 400 Bad Request
If the lobby is full, the response will be a 403 Forbidden
*/
func handleJoinLobby(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	user, err := util.Authenticate(request, context)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	// validate correct request params

	game := request.QueryStringParameters["game"]
	leader := request.QueryStringParameters["leader"]

	if game == "" || leader == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"missing required parameters\" }",
		}, nil
	}

	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	// Make sure user is not in a lobby already
	if user.LobbyLeader != "" || user.LobbyGame != "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"user is already in a lobby\" }",
		}, nil
	}

	// confirm that there is space in the lobby
	response, err := client.GetItem(context, &dynamodb.GetItemInput{
		TableName: aws.String("Lobbies"),
		Key: map[string]types.AttributeValue{
			"appid":  &types.AttributeValueMemberN{Value: game},
			"leader": &types.AttributeValueMemberS{Value: leader},
		},
	})

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "{ \"error\": \"" + err.Error() + "\" }",
		}, nil
	}

	var lobbyObj model.Lobby
	err = attributevalue.UnmarshalMap(response.Item, &lobbyObj)

	if err != nil {
		fmt.Println("Retrieved lobby object has an incorrect format: ", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	if len(lobbyObj.LobbyUsers) >= lobbyObj.MaxUsers {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusForbidden,
			Body:       "{ \"error\": \"lobby is full\" }",
		}, nil
	}

	userDynamoDBAttribute := util.PublicUserToDynamoDBAttribute(util.UserToPublicUser(user))

	// add the user to the lobby
	lobbyInput := &dynamodb.UpdateItemInput{
		TableName: aws.String("Lobbies"),
		Key: map[string]types.AttributeValue{
			"appid":  &types.AttributeValueMemberN{Value: game},
			"leader": &types.AttributeValueMemberS{Value: leader},
		},
		ExpressionAttributeNames: map[string]string{
			"#SteamUUID": user.SteamUUID,
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":user": userDynamoDBAttribute,
		},
		UpdateExpression: aws.String("SET lobbyusers.#SteamUUID = :user"),
	}

	_, err = client.UpdateItem(context, lobbyInput)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}

/*
Request params
"game": number - the Steam Appid of the lobby's game
"leader": string - the Steam UUID of the lobby's leader

If the request is successful, the response will be a 200 OK
If the user is not authenticated, the response will be a 401 Unauthorized
If the request is missing parameters, the response will be a 400 Bad Request
*/
func handleLeaveLobby(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	user, err := util.Authenticate(request, context)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	// validate correct request params

	game := request.QueryStringParameters["game"]
	leader := request.QueryStringParameters["leader"]

	if game == "" || leader == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"missing required parameters\" }",
		}, nil
	}

	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	// delete the lobby if the owner is leaving

	if user.SteamUUID == leader {
		_, err = client.DeleteItem(context, &dynamodb.DeleteItemInput{
			TableName: aws.String("Lobbies"),
			Key: map[string]types.AttributeValue{
				"appid":  &types.AttributeValueMemberN{Value: game},
				"leader": &types.AttributeValueMemberS{Value: leader},
			},
		})

		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
				Body:       "{ \"error\": \"" + err.Error() + "\" }",
			}, nil
		}
	} else {

		// remove the user from the lobby
		lobbyInput := &dynamodb.UpdateItemInput{
			TableName: aws.String("Lobbies"),
			Key: map[string]types.AttributeValue{
				"appid":  &types.AttributeValueMemberN{Value: game},
				"leader": &types.AttributeValueMemberS{Value: leader},
			},
			ExpressionAttributeNames: map[string]string{
				"#SteamUUID": user.SteamUUID,
			},
			UpdateExpression: aws.String("REMOVE lobbyusers.#SteamUUID"),
		}

		_, err = client.UpdateItem(context, lobbyInput)

		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
			}, err
		}
	}

	// remove the lobby from the user profile
	userInput := &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"SteamUUID": &types.AttributeValueMemberS{Value: user.SteamUUID},
		},
		UpdateExpression: aws.String("REMOVE LobbyGame, LobbyLeader"),
	}

	_, err = client.UpdateItem(context, userInput)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}

/*
Request params
"game": number - the Steam Appid of the lobby's game
"user": string - the Steam UUID of the user to kick

If the request is successful, the response will be a 200 OK
If the user is not authenticated, the response will be a 401 Unauthorized
If the request is missing parameters, the response will be a 400 Bad Request
*/
func HandleKickLobbyUser(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	user, err := util.Authenticate(request, context)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	// validate correct request params
	userToKickUUID := request.QueryStringParameters["user"]
	game := request.QueryStringParameters["game"]

	if game == "" || userToKickUUID == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"missing required parameters\" }",
		}, nil
	}

	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	userToKick, err := util.GetUser(userToKickUUID, context)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	userInput := &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"SteamUUID": &types.AttributeValueMemberS{Value: userToKick.SteamUUID},
		},
		UpdateExpression: aws.String("REMOVE LobbyGame, LobbyLeader"),
	}

	_, err = client.UpdateItem(context, userInput)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	// remove the user from the lobby
	lobbyInput := &dynamodb.UpdateItemInput{
		TableName: aws.String("Lobbies"),
		Key: map[string]types.AttributeValue{
			"appid":  &types.AttributeValueMemberN{Value: game},
			"leader": &types.AttributeValueMemberS{Value: user.SteamUUID},
		},
		ExpressionAttributeNames: map[string]string{
			"#SteamUUID": userToKick.SteamUUID,
		},
		UpdateExpression: aws.String("REMOVE lobbyusers.#SteamUUID"),
	}

	_, err = client.UpdateItem(context, lobbyInput)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}
