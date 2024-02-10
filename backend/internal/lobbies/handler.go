package lobbies

import (
	"context"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
)

func Handler(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}