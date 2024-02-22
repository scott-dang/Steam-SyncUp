package users

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

var getUser = util.GetUser
var authenticate = util.Authenticate

// should have queryStringParameter "uuid"--the user we are looking up
func Handler(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// if it is a successful authentication, then you get a user, otherwise you get an error
	user, err := authenticate(request, context)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	uuid := request.QueryStringParameters["uuid"]

	if uuid != "" {
		// if a different user as provided, get their information
		user, err = getUser(uuid, context)

		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusNotFound,
				Body:       "{ \"error\": \"user not found\" }",
			}, nil
		}
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
