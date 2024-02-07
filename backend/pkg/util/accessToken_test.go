package util

import (
	"context"
	"testing"
	"time"

	"github.com/scott-dang/Steam-SyncUp/pkg/model"
	"github.com/stretchr/testify/assert"
)

// ensure that tokens with the same UUID are unique when created at different times
func TestCreateUserTokenUniqueTime(t *testing.T) {
	oldAddTokenToUser := addTokenToUser
	addTokenToUser = func(uuid string, tokenString string, context context.Context) error {
		return nil
	}

	token1, _ := CreateUserToken("test", nil)
	time.Sleep(time.Second) // wait 1 second so that the issued at time is different
	token2, _ := CreateUserToken("test", nil)

	addTokenToUser = oldAddTokenToUser

	assert.NotEqual(t, token1, token2, "should not be equal")
}

// ensure that tokens with different UUIDs are unique
func TestCreateUserTokenUniqueUUID(t *testing.T) {
	oldAddTokenToUser := addTokenToUser
	addTokenToUser = func(uuid string, tokenString string, context context.Context) error {
		return nil
	}

	token1, _ := CreateUserToken("test1", nil)
	token2, _ := CreateUserToken("test2", nil)

	addTokenToUser = oldAddTokenToUser

	assert.NotEqual(t, token1, token2, "should not be equal")
}

// ensure that we can get the user from a JWT token
func TestGetUserFromToken(t *testing.T) {
	oldAddTokenToUser := addTokenToUser
	addTokenToUser = func(uuid string, tokenString string, context context.Context) error {
		return nil
	}

	uuidValue := "This is my test UUID"

	tokenString, _ := CreateUserToken(uuidValue, nil)

	oldGetUser := getUser
	getUser = func(uuid string, context context.Context) (model.User, error) {
		// if we can get the correct UUID, then we know we can get the correct user from DynamoDB
		assert.Equal(t, uuidValue, uuid, "should be equal")
		return model.User{}, nil
	}
	oldValidToken := validToken
	validToken = func(found string, expected string) bool {
		return true
	}

	GetUserFromToken(tokenString, nil)

	getUser = oldGetUser
	validToken = oldValidToken
	addTokenToUser = oldAddTokenToUser
}