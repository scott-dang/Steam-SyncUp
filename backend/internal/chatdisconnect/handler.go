package chatdisconnect

import (
	"context"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func Handler(context context.Context, request events.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {

	connectionId := request.RequestContext.ConnectionID

	cfg, err := config.LoadDefaultConfig(context)
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
	}

	svc := dynamodb.NewFromConfig(cfg)

	// TODO: Make this support multiple lobbies and not just 1
	tableName := os.Getenv("table")

	_, err = svc.DeleteItem(context, &dynamodb.DeleteItemInput{
		Key: map[string]types.AttributeValue{
			"connectionId": &types.AttributeValueMemberS{Value: connectionId},
		},
		TableName: &tableName,
	})

	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}
