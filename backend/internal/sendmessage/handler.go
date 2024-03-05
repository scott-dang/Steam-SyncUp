package sendmessage

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
	"github.com/scott-dang/Steam-SyncUp/pkg/model"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

var getUser = util.GetUser

func Handler(context context.Context, request events.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {
	parsedBody := util.SendMessageServiceRequestBody{}
	err := json.Unmarshal([]byte(request.Body), &parsedBody)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"Unable to parse request body\" }",
		}, nil
	}


	if parsedBody.Personaname == "" || parsedBody.SUID == "" || parsedBody.Text == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusNotFound,
			Body:       "{ \"error\": \"Missing field for message send\" }",
		}, nil
	}

	connectionId := request.RequestContext.ConnectionID

	connectionsInput := &dynamodb.GetItemInput{
		TableName: aws.String("Connections"),
		Key: map[string]types.AttributeValue{
			"connectionId": &types.AttributeValueMemberS{Value: connectionId},
		},
	}

	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "{ \"error\": \"unable to load AWS config\" }",
		}, nil
	}

	result, err := client.GetItem(context, connectionsInput)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"Error retrieving connection item: " + err.Error() + "\" }",
		}, nil
	}

	appid := result.Item["appid"]
	leader := result.Item["leader"]

  if appid == nil {
    return events.APIGatewayProxyResponse{
      StatusCode: http.StatusInternalServerError,
      Body: "{ \"error\": \"No appid found for connection\" }",
    }, nil
  }

  if leader == nil {
    return events.APIGatewayProxyResponse{
      StatusCode: http.StatusInternalServerError,
      Body: "{ \"error\": \"No leader found for connection\" }",
    }, nil
  }

  lobbiesInput := &dynamodb.GetItemInput{
    TableName: aws.String("Lobbies"),
    Key: map[string]types.AttributeValue{
      "leader": leader,
      "appid": appid,
    },
  }

  result, err = client.GetItem(context, lobbiesInput)

  if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"Error retrieving connections: " + err.Error() + "\" }",
		}, nil
	}

  connections := result.Item["connectionIds"].(*types.AttributeValueMemberL).Value

  if connections == nil {
    return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": No connections found\" }",
		}, nil
  }

  user, err := getUser(parsedBody.SUID, context)

  if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"Error retrieving user: " + err.Error() + "\" }",
		}, nil
	}

  avatarFull := user.AvatarFull

  if avatarFull == "" {
    return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": No user found\" }",
		}, nil
  }

  message := model.Message{
    Personaname: parsedBody.Personaname,
    Suid: parsedBody.SUID,
    Text: parsedBody.Text,
    Timestamp: strconv.FormatInt(time.Now().Unix(), 10),
    AvatarFull: avatarFull,
  }

  updateMessagesInput := &dynamodb.UpdateItemInput{
    TableName: aws.String("Lobbies"),
    Key: map[string]types.AttributeValue{
      "leader": leader,
      "appid": appid,
    },
    UpdateExpression: aws.String("SET messages = list_append(if_not_exists(messages, :empty_list), :new_object)"),
    ExpressionAttributeValues: map[string]types.AttributeValue{
      ":new_object": &types.AttributeValueMemberM{
        Value: map[string]types.AttributeValue{
          "text": &types.AttributeValueMemberS{Value: message.Text},
          "suid": &types.AttributeValueMemberS{Value: message.Suid},
          "timestamp": &types.AttributeValueMemberS{Value: message.Timestamp},
          "personaname": &types.AttributeValueMemberS{Value: message.Personaname},
          "avatarfull": &types.AttributeValueMemberS{Value: message.AvatarFull},
        },
      },
      ":empty_list": &types.AttributeValueMemberL{
        Value: []types.AttributeValue{},
      },
    },
    ReturnValues: types.ReturnValueUpdatedNew,
  }

  _, err = client.UpdateItem(context, updateMessagesInput)

  if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: "{ \"error\": \"Error saving message: " + err.Error() + "\" }",
		}, nil
	}

  session, err := session.NewSession()

  if err != nil {
    return events.APIGatewayProxyResponse{
      StatusCode: http.StatusInternalServerError,
      Body: "{ \"error\": \"Error creating new session: " + err.Error() + "\" }",
    }, nil
  }

  callbackAPI := apigatewaymanagementapi.New(session, &aws.Config{
    Endpoint: aws.String(request.RequestContext.DomainName + "/" + request.RequestContext.Stage),
  })

  messageJson, err := json.Marshal(message)

  if err != nil {
    return events.APIGatewayProxyResponse{
      StatusCode: http.StatusInternalServerError,
      Body: "{ \"error\": \"Error marshalling message: " + err.Error() + "\" }",
    }, nil
  }

  for _, lobbyUserConnectionId := range connections {
    lobbyUserConnectionIdString := lobbyUserConnectionId.(*types.AttributeValueMemberS).Value
    if lobbyUserConnectionIdString != connectionId {
      _, err = callbackAPI.PostToConnection(&apigatewaymanagementapi.PostToConnectionInput{
        ConnectionId: &lobbyUserConnectionIdString,
        Data: []byte(messageJson),
      })

      if err != nil {
        return events.APIGatewayProxyResponse{
          StatusCode: http.StatusInternalServerError,
          Body: "{ \"error\": \"Error sending message: " + err.Error() + "\" }",
        }, nil
      }
    }
  }

  return events.APIGatewayProxyResponse{
    StatusCode: http.StatusOK,
  }, nil
}



