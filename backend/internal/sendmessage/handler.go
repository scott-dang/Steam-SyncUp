/*
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async function (event, context) {

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }

  const necessaryFields = ["text", "suid", "personaname"];

  if (!necessaryFields.every((field) => parsedBody[field])) {
    console.log("Error: Missing field for message send");
    return {
      statusCode: 500,
    };
  }

  const connectionId = event.requestContext.connectionId;

  const data = {
    text: parsedBody.text,
    suid: parsedBody.suid,
    timestamp: Date.now(),
    personaname: parsedBody.personaname,
  };

  const connectionsInput = {
    "Key": {
      "connectionId": connectionId,
    },
    "TableName": "Connections"
  };

  let appid, leader;
  try {
    const result = await ddb.get(connectionsInput).promise();
    appid = result.Item ? result.Item.appid : null;
    leader = result.Item ? result.Item.leader : null;

    if (!appid) {
      throw new Error('No appid found for connection');
    }
    if (!leader) {
      throw new Error('No leader found for connection');
    }
  } catch (err) {
    console.error("Error retrieving connection item:", err);
    return {
      statusCode: 500,
    };
  }

  const lobbiesInput = {
    "Key": {
      "leader": leader,
      "appid": appid,
    },
    "TableName": "Lobbies"
  };

  let connections;
  try {
    const result = await ddb.get(lobbiesInput).promise();

    connections = result.Item && result.Item.connectionIds ? result.Item.connectionIds.values : null;

    if (!connections) {
      throw new Error('No connections found');
    }
  } catch (err) {
    console.error("Error retrieving connections:", err);
    return {
      statusCode: 500,
    };
  }


  const updateMessagesInput = {
    "Key": {
      "leader": leader,
      "appid": appid,
    },
    "TableName": "Lobbies",
    UpdateExpression: "SET messages = list_append(if_not_exists(messages, :empty_list), :new_object)",
    ExpressionAttributeValues: {
        ":new_object": [data],
        ":empty_list": []
    },
    ReturnValues: "UPDATED_NEW"
  };

   try {
    await ddb
      .update(updateMessagesInput)
      .promise();
  } catch (err) {
    console.error("Error saving message:", err);
    return {
      statusCode: 500,
    };
  }

  const callbackAPI = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint:
      event.requestContext.domainName + '/' + event.requestContext.stage,
  });

  console.log("Connections: " + connections);
  const sendMessages = connections.map(async (lobbyUserConnectionId) => {
    if (lobbyUserConnectionId !== event.requestContext.connectionId) {
      try {
        await callbackAPI
          .postToConnection({ ConnectionId: lobbyUserConnectionId, Data: JSON.stringify(data)})
          .promise();
      } catch (e) {
        console.log(e);
      }
    }
  });

  try {
    await Promise.all(sendMessages);
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }

  return { statusCode: 200 };
};
*/

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
	"github.com/scott-dang/Steam-SyncUp/pkg/model"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

var authenticate = util.Authenticate

func Handler(context context.Context, request events.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {
	parsedBody := util.SendMessageServiceRequestBody{}
	err := json.Unmarshal([]byte(request.Body), &parsedBody)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "{ \"error\": \"unable to parse request body\" }",
		}, nil
	}


	if parsedBody.Personaname == "" || parsedBody.SUID == "" || parsedBody.Text == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusNotFound,
			Body:       "{ \"error\": \"missing request parameters\" }",
		}, nil
	}

	connectionId := request.RequestContext.ConnectionID

	data := model.Message{
		Personaname: parsedBody.Personaname,
		Suid:        parsedBody.SUID,
		Text:        parsedBody.Text,
		Timestamp:   strconv.FormatInt(time.Now().Unix(), 10),
	}

	connectionsInput := util.SendMessageServiceConnectionsInput{
		Key: util.SendMessageServiceConnectionsKey{
			ConnectionID: connectionId,
		},
		TableName: "Connections",
	}

	// TODO: find the connection
	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "{ \"error\": \"unable to load AWS config\" }",
		}, nil
	}

	result, err := util.GetConnectionsItem(connectionsInput, client, context)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "{ \"error\": \"unable to get connection item\" }",
		}, nil
	}

	appid := result.Item.Appid
	leader := result.Item.Leader

	if appid == "" {
		

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(responseBody),
	}, nil
}
