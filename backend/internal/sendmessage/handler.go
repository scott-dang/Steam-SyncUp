package sendmessage

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/events"
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

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(responseBody),
	}, nil
}
