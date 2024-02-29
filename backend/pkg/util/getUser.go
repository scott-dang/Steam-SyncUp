package util

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/scott-dang/Steam-SyncUp/pkg/model"
)

type UserGetter func(string, context.Context) (model.User, error)
type UsersGetter func([]string, context.Context, UserGetter) (map[string]model.User, error)

func GetUser(uuid string, context context.Context) (model.User, error) {
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

func GetUsers(uuids []string, context context.Context, getUserFunc UserGetter) (map[string]model.User, error) {

	users := map[string]model.User{}

	// Gets all the profile infos of the provided uuids
	for _, uuid := range uuids {

		user, err := getUserFunc(uuid, context)

		// Terminate operation even if 1 user id is not valid
		if err != nil {
			fmt.Println("Error processing provided SteamUUIDs")
			return map[string]model.User{}, err
		}

		// Map uuid: string to their respective profile info
		users[user.SteamUUID] = user
	}

	return users, nil
}

// Convert a User to a DynamoDB AttributeValue map
func PublicUserToDynamoDBAttribute(user model.PublicUser) types.AttributeValue {
	return &types.AttributeValueMemberM{
		Value: map[string]types.AttributeValue{
			"SteamUUID":   &types.AttributeValueMemberS{Value: user.SteamUUID},
			"AvatarFull":  &types.AttributeValueMemberS{Value: user.AvatarFull},
			"PersonaName": &types.AttributeValueMemberS{Value: user.PersonaName},
		},
	}
}

func UserToPublicUser(user model.User) model.PublicUser {
	return model.PublicUser{
		PersonaName: user.PersonaName,
		SteamUUID:   user.SteamUUID,
		AvatarFull:  user.AvatarFull,
	}
}
