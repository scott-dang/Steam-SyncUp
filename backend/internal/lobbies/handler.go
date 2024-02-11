package lobbies

import (
	"context"
	"encoding/json"
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

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	// validate correct request params
	game := request.QueryStringParameters["game"]
	name := request.QueryStringParameters["name"]
	maxusersStr := request.QueryStringParameters["maxusers"]

	if (game == "" || name == "" || maxusersStr == "") {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body: "{ \"error\": \"missing required parameters\" }",
		}, nil
	}

	maxusers, err := strconv.Atoi(maxusersStr)

	if (err != nil || maxusers < 2 || maxusers > 10) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body: "{ \"error\": \"bad num of users\" }",
		}, nil
	}

	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	// ensure that the user is not already in a lobby
	found, _ := client.GetItem(context, &dynamodb.GetItemInput{
		TableName: aws.String("Lobbies"),
		Key: map[string]types.AttributeValue{
			"appid": &types.AttributeValueMemberN{Value: game},
			"leader": &types.AttributeValueMemberS{Value: user.SteamUUID},
		},
	})


	if (len(found.Item) > 0) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body: "{ \"error\": \"user already owns a lobby\" }",
		}, nil
	
	}

	// create the new lobby in dynamodb
	input := &dynamodb.PutItemInput{
		TableName: aws.String("Lobbies"),
		Item: map[string]types.AttributeValue{
			"leader": &types.AttributeValueMemberS{Value: user.SteamUUID},
			"appid": &types.AttributeValueMemberN{Value: game},
			"lobbyname": &types.AttributeValueMemberS{Value: name},
			"lobbyusers": &types.AttributeValueMemberSS{
				Value: []string{user.SteamUUID},
			},
			"maxusers": &types.AttributeValueMemberN{Value: maxusersStr},
			"messages": &types.AttributeValueMemberL{},
		},
	}

	_, err = client.PutItem(context, input)

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"" + err.Error() + "\" }",
		}, nil
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

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	// validate correct request params

	game := request.QueryStringParameters["game"]

	if (game == "") {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body: "{ \"error\": \"missing required parameters\" }",
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
		TableName: aws.String("Lobbies"),
		KeyConditionExpression: aws.String("appid = :a"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":a": &types.AttributeValueMemberN{Value: game},
		},
		ProjectionExpression: aws.String("leader, lobbyname, lobbyusers, maxusers"),
	})

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"" + err.Error() + "\" }",
		}, nil
	}

	var lobbies []model.Lobby
	err = attributevalue.UnmarshalListOfMaps(response.Items, &lobbies)

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	responseBody, err := json.Marshal(lobbies)

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body: string(responseBody),
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

	if (err != nil) {
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
			Body: "{ \"error\": \"missing required parameters\" }",
		}, nil
	}

	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	// confirm that there is space in the lobby
	response, err := client.GetItem(context, &dynamodb.GetItemInput{
		TableName: aws.String("Lobbies"),
		Key: map[string]types.AttributeValue{
			"appid": &types.AttributeValueMemberN{Value: game},
			"leader": &types.AttributeValueMemberS{Value: leader},
		},
	})

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"" + err.Error() + "\" }",
		}, nil
	}

	var lobbyObj model.Lobby
	err = attributevalue.UnmarshalMap(response.Item, &lobbyObj)

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	if (len(lobbyObj.LobbyUsers) >= lobbyObj.MaxUsers) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusForbidden,
			Body: "{ \"error\": \"lobby is full\" }",
		}, nil
	}

	// add the user to the lobby
	input := &dynamodb.UpdateItemInput{
		TableName: aws.String("Lobbies"),
		Key: map[string]types.AttributeValue{
			"appid": &types.AttributeValueMemberN{Value: game},
			"leader": &types.AttributeValueMemberS{Value: leader},
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":l": &types.AttributeValueMemberSS{
				Value: []string{user.SteamUUID},
			},
		},
		UpdateExpression: aws.String("ADD lobbyusers :l"),
	}

	_, err = client.UpdateItem(context, input)

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"" + err.Error() + "\" }",
		}, nil
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

	if (err != nil) {
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
			Body: "{ \"error\": \"missing required parameters\" }",
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
				"appid": &types.AttributeValueMemberN{Value: game},
				"leader": &types.AttributeValueMemberS{Value: leader},
			},
		})

		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
				Body: "{ \"error\": \"" + err.Error() + "\" }",
			}, nil
		}
		
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusOK,
		}, nil
	}

	// remove the user from the lobby
	input := &dynamodb.UpdateItemInput{
		TableName: aws.String("Lobbies"),
		Key: map[string]types.AttributeValue{
			"appid": &types.AttributeValueMemberN{Value: game},
			"leader": &types.AttributeValueMemberS{Value: leader},
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":l": &types.AttributeValueMemberSS{
				Value: []string{user.SteamUUID},
			},
		},
		UpdateExpression: aws.String("DELETE lobbyusers :l"),
	}

	_, err = client.UpdateItem(context, input)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"" + err.Error() + "\" }",
		}, nil
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

	if (err != nil) {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	// validate correct request params
	userToKick := request.QueryStringParameters["user"]
	game := request.QueryStringParameters["game"]

	if game == "" || userToKick == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body: "{ \"error\": \"missing required parameters\" }",
		}, nil
	}

	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}

	// remove the user from the lobby
	input := &dynamodb.UpdateItemInput{
		TableName: aws.String("Lobbies"),
		Key: map[string]types.AttributeValue{
			"appid": &types.AttributeValueMemberN{Value: game},
			"leader": &types.AttributeValueMemberS{Value: user.SteamUUID},
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":l": &types.AttributeValueMemberSS{
				Value: []string{userToKick},
			},
		},
		UpdateExpression: aws.String("DELETE lobbyusers :l"),
	}

	_, err = client.UpdateItem(context, input)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"" + err.Error() + "\" }",
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}