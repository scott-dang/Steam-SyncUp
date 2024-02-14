package users

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

func Handler(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// if it is a successful authentication, then you get a user, otherwise you get an error
	user, err := util.Authenticate(request, context)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	body := util.UsersServiceProfileInfoResponseBody{
		AvatarFull: user.AvatarFull,
		PersonaName: user.PersonName,
	}

	responseBody, _ := json.Marshal(body)

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(responseBody),
	}, nil
}
