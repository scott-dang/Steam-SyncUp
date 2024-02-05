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
	Authenticated bool `json:"authenticated"`
}

func Handler(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	
	split := strings.Split(request.Headers["Authorization"], "Bearer ")

	if len(split) != 2 {
		return events.APIGatewayProxyResponse{StatusCode: http.StatusUnprocessableEntity}, nil
	}
	
	token := split[1]

	body := GamesServiceResponseBody{
		Authenticated: true,
	}

	_, err := util.GetUserFromToken(token, context)

	if err != nil {
		body.Authenticated = false
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