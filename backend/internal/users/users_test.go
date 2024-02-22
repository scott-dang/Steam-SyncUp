package users

import (
	"context"
	"strings"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/scott-dang/Steam-SyncUp/pkg/model"
	"github.com/stretchr/testify/assert"
)

// test that we can get data from the authenticated user
func TestAuthUser(t *testing.T) {
	authenticate = func(request events.APIGatewayProxyRequest, context context.Context) (model.User, error) {
		return model.User{
			SteamUUID:		"123",
			AvatarFull:		"http://example.com/avatar.jpg",
			PersonName:		"Mario",
		}, nil
	}

	getUser = func(uuid string, context context.Context) (model.User, error) {
		return model.User{
			SteamUUID:		"456",
			AvatarFull:		"http://example.com/avatar.jpg",
			PersonName:		"Luigi",
		}, nil
	}

	request := events.APIGatewayProxyRequest{}

	response, err := Handler(context.Background(), request)

	assert.Nil(t, err)
	assert.Equal(t, true, strings.Contains(response.Body, "Mario"))
}

// test that we can get data from a different user if defined
func TestDifferentUser(t *testing.T) {
	authenticate = func(request events.APIGatewayProxyRequest, context context.Context) (model.User, error) {
		return model.User{
			SteamUUID:		"123",
			AvatarFull:		"http://example.com/avatar.jpg",
			PersonName:		"Mario",
		}, nil
	}

	getUser = func(uuid string, context context.Context) (model.User, error) {
		return model.User{
			SteamUUID:		"456",
			AvatarFull:		"http://example.com/avatar.jpg",
			PersonName:		"Luigi",
		}, nil
	}

	request := events.APIGatewayProxyRequest{
		QueryStringParameters: map[string]string{
			"uuid": "123",
		},
	}

	response, err := Handler(context.Background(), request)

	assert.Nil(t, err)
	assert.Equal(t, true, strings.Contains(response.Body, "Luigi"))
}

