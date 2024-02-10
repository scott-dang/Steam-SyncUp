package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/scott-dang/Steam-SyncUp/pkg/model"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

type AuthServiceResponseBody struct {
	IsValid bool `json:"is_valid"`
	JWTToken string `json:"jwttoken"`
}

// extractID extracts the Steam UUID from a Steam OpenID URL
func extractID(url string) (string, error) {
	// Simplified regular expression to match a series of digits at the end of the URL
	re := regexp.MustCompile(`\d+$`)

	id := re.FindString(url)
	if id == "" {
		return "", fmt.Errorf("no numeric ID found in URL")
	}

	// Check if the ID is exactly 17 digits long
	if len(id) != 17 {
		return "", fmt.Errorf("extracted ID is not 17 digits long")
	}

	return id, nil
}

func Handler(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	// Steam's OpenID login endpoint
	steamLoginURL := "https://steamcommunity.com/openid/login?"

	// Construct the OpenID URL with necessary parameters
	paramsMap := request.QueryStringParameters
	paramsMap["openid.mode"] = "check_authentication"

	params := make(url.Values)

	for k, v := range paramsMap {
		params.Add(k, v)
	}

	// The URL we can utilize to verify that the user is authenticated
	steamVerifyURL := steamLoginURL + params.Encode()

	resp, err := http.Get(steamVerifyURL)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	// body contains "is_valid" which indicates whether it is a successful login or not
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	// Extract Steam UUID
	id, err := extractID(paramsMap["openid.claimed_id"])
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	bs := string(body)

	is_valid := strings.Contains(bs, "true")
	token := ""

	// Logs to CloudWatch for debugging
	log.Println("SteamVerifyURL: " + steamVerifyURL + "\nIs user validated? " + strconv.FormatBool(is_valid))

	// Create user in DynamoDB iff valid and they don't exist yet
	if is_valid {

		// Load the config
		config, err := config.LoadDefaultConfig(context)
		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
			}, err
		}

		// Create a DynamoDB client
		client := dynamodb.NewFromConfig(config)

		userAcc := model.User{
			SteamUUID:   id,
			CreatedDate: time.Now().UTC().String(),
		}

		attrMap, err := attributevalue.MarshalMap(userAcc)
		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
			}, err
		}

		input := &dynamodb.PutItemInput{
			Item:                attrMap,
			TableName:           aws.String("Users"),
			ConditionExpression: aws.String("attribute_not_exists(SteamUUID)"),
		}

		// No-op if user already exists in the Users table
		_, err = client.PutItem(context, input)
		var itemAlreadyExistsErr *types.ConditionalCheckFailedException
		if err != nil && !errors.As(err, &itemAlreadyExistsErr) {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
			}, err
		}

		token, err = util.CreateUserToken(id, context)
		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
			}, err
		}
	}

	responseBody, err := json.Marshal(AuthServiceResponseBody{
		IsValid: is_valid,
		JWTToken: token,
	})

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	// Returns to the client a JSON string of AuthServiceResponseBody
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(responseBody),
	}, nil
}
