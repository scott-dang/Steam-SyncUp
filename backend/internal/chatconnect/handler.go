package chatconnect

import (
	"context"
	"fmt"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

func Handler(context context.Context, request events.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {

	_, err := util.Authenticate_Websocket(request, context)

	if err != nil {
		fmt.Println("User failed to login")
		return events.APIGatewayProxyResponse{StatusCode: http.StatusUnauthorized}, err
	}

	connectionId := request.RequestContext.ConnectionID

	cfg, err := config.LoadDefaultConfig(context)
	if err != nil {
		fmt.Println("Error loading config")
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
	}

	svc := dynamodb.NewFromConfig(cfg)

	leader, ok := request.QueryStringParameters["leader"]

	if !ok {
		return events.APIGatewayProxyResponse{StatusCode: http.StatusBadRequest}, err
	}

	appid, ok := request.QueryStringParameters["appid"]
	if !ok {
		return events.APIGatewayProxyResponse{StatusCode: http.StatusBadRequest}, err
	}

  _, err = svc.PutItem(context, &dynamodb.PutItemInput{
		TableName: aws.String("Connections"),
		Item:      map[string]types.AttributeValue{
      "connectionId": &types.AttributeValueMemberS{Value: connectionId},
      "leader": &types.AttributeValueMemberS{Value: leader},
      "appid": &types.AttributeValueMemberN{Value: appid},
    },
	})

  if err != nil {
		fmt.Println("Error putting connectionId in ddb")
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
  }

	_, err = svc.UpdateItem(context, &dynamodb.UpdateItemInput{
		TableName: aws.String("Lobbies"),
		Key: map[string]types.AttributeValue{
			"appid":  &types.AttributeValueMemberN{Value: appid},
			"leader": &types.AttributeValueMemberS{Value: leader},
		},
		ConditionExpression: aws.String("attribute_exists(appid) AND attribute_exists(leader)"),
		UpdateExpression:    aws.String("ADD connectionIds :newId"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":newId": &types.AttributeValueMemberSS{Value: []string{connectionId}},
		},
	})

	if err != nil {
		fmt.Println("Error updating connectionId in ddb")
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
	}

	fmt.Println("Successful connection established for connectionId: " + connectionId)
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}
