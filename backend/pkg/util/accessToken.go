package util

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/golang-jwt/jwt/v5"
	"github.com/scott-dang/Steam-SyncUp/pkg/model"
)

type UserClaims struct {
	UUID string
	jwt.RegisteredClaims
}

var addTokenToUser = func(uuid string, tokenString string, context context.Context) error {
	config, err := config.LoadDefaultConfig(context)

	if err != nil {
		return err
	}

	client := dynamodb.NewFromConfig(config)

	input := &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"SteamUUID": &types.AttributeValueMemberS{Value: uuid},
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":t": &types.AttributeValueMemberS{Value: tokenString},
		},
		UpdateExpression: aws.String("SET Token = :t"),
	}

	_, err = client.UpdateItem(context, input)

	return err
}

func CreateUserToken(uuid string, context context.Context) (string, error) {
	claims := UserClaims{
		uuid,
		jwt.RegisteredClaims{
			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte("mySecret"))
	if err != nil {
		return "", err
	}

	addTokenToUser(uuid, tokenString, context)

	return tokenString, nil
}

var getUser = func(uuid string, context context.Context) (model.User, error) {
	config, err := config.LoadDefaultConfig(context)
	client := dynamodb.NewFromConfig(config)

	if err != nil {
		return model.User{}, err
	}

	input := &dynamodb.GetItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"SteamUUID": &types.AttributeValueMemberS{Value: uuid},
		},
	}

	response, err := client.GetItem(context, input)

	if err != nil {
		return model.User{}, err
	}

	var user model.User
	err = attributevalue.UnmarshalMap(response.Item, &user)

	return user, err
}

var validToken = func(found string, expected string) bool {
	return found == expected
}

func GetUserFromToken(tokenString string, context context.Context) (model.User, error) {
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("mySecret"), nil
	})
	if err != nil {
		return model.User{}, err
	} else if claims, ok := token.Claims.(*UserClaims); ok {
		uuid := claims.UUID
		print("This is the uuid" + claims.UUID)
		user, err := getUser(uuid, context)
		if err != nil {
			return model.User{}, err
		}

		if !validToken(tokenString, user.Token) {
			return model.User{}, fmt.Errorf("invalid token")
		}

		return user, nil
	} else {
		return model.User{}, fmt.Errorf("invalid token")
	}
}