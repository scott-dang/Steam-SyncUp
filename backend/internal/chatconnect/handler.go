package chatconnect

import (
  "context"
  "net/http"
  "os"

  "github.com/aws/aws-lambda-go/events"
  "github.com/aws/aws-sdk-go-v2/config"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
  "github.com/scott-dang/Steam-SyncUp/pkg/util"
)

type GamesServiceResponseBody struct {
  Authenticated bool `json:"authenticated"`
  UUID        string `json:"uuid"`
}

func Handler(context context.Context, request events.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {

  _, err := util.Authenticate_Websocket(request, context)

  if err != nil {
    return events.APIGatewayProxyResponse{StatusCode: http.StatusUnauthorized}, err
  }

  connectionId := request.RequestContext.ConnectionID

  cfg, err := config.LoadDefaultConfig(context)
  if err != nil {
    return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, err
  }

  svc := dynamodb.NewFromConfig(cfg)

  // TODO: Make this support multiple lobbies and not just 1
  tableName := os.Getenv("table")

  _, err = svc.PutItem(context, &dynamodb.PutItemInput{
    Item: map[string]types.AttributeValue{
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
