package chatdisconnect

import (
	"context"
	"fmt"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func Handler(context context.Context, request events.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {

	connectionId := request.RequestContext.ConnectionID
	connectionsTableName := "Connections"
  lobbiesTableName := "Lobbies"

	cfg, err := config.LoadDefaultConfig(context)
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
	}

	svc := dynamodb.NewFromConfig(cfg)

  item, err := svc.GetItem(context, &dynamodb.GetItemInput{
		Key: map[string]types.AttributeValue{
			"connectionId": &types.AttributeValueMemberS{Value: connectionId},
		},
		TableName: aws.String(connectionsTableName),
	})

	if err != nil || item.Item == nil {
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
	}

  appid, ok := item.Item["appid"]
  if !ok {
    fmt.Println("Missing appid")
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
  }

  leader, ok := item.Item["leader"]
  if !ok {
    fmt.Println("Missing leader")
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
  }

  _, err = svc.UpdateItem(context, &dynamodb.UpdateItemInput{
    TableName: aws.String(lobbiesTableName),
    Key: map[string]types.AttributeValue{
			"appid":  appid,
			"leader": leader,
    },
		ConditionExpression: aws.String("attribute_exists(appid) AND attribute_exists(leader)"),
		UpdateExpression:    aws.String("DELETE connectionIds :newId"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":newId": &types.AttributeValueMemberSS{Value: []string{connectionId}},
		},
  })

  if err != nil {
    fmt.Println("Error deleting from lobby connectionIds")
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
  }

  _, err = svc.DeleteItem(context, &dynamodb.DeleteItemInput{
		TableName: aws.String(connectionsTableName),
		Key: map[string]types.AttributeValue{
			"connectionId": &types.AttributeValueMemberS{Value: connectionId},
		},
	})

  if err != nil {
    fmt.Println("Error deleting from connections table")
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
  }

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}
