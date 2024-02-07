package games

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

type GamesServiceResponseBody struct {
	Authenticated	bool `json:"authenticated"`
	UUID	 		string `json:"uuid"`
}

func Handler(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// if it is a successful authentication, then you get a user, otherwise you get an error
	user, err := util.Authenticate(request, context)

	body := GamesServiceResponseBody{
		Authenticated: false,
	}

	if err == nil {
		body.Authenticated = true
		body.UUID = user.SteamUUID
	}

	responseBody, _ := json.Marshal(body)

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(responseBody),
	}, nil
}