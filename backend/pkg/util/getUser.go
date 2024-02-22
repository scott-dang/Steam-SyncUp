package util

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/scott-dang/Steam-SyncUp/pkg/model"
)

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