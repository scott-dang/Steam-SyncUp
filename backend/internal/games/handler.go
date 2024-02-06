package games

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

type GamesServiceResponseBody struct {
	Authenticated string `json:"authenticated"`
}

func Handler(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	
	split := strings.Split(request.Headers["Authorization"], "Bearer ")

	if len(split) != 2 {
		return events.APIGatewayProxyResponse{StatusCode: http.StatusUnprocessableEntity}, nil
	}
	
	token := split[1]

	body := GamesServiceResponseBody{
		Authenticated: "Yes",
	}

	user, err := util.GetUserFromToken(token, context)

	if err != nil {
		body.Authenticated = "No user from token"
	}

	if user.Token != token {
		body.Authenticated = "No, mismatched token"
	}

	responseBody, err := json.Marshal(body)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(responseBody),
	}, nil
}