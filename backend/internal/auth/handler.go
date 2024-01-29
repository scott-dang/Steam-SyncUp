package auth

import (
	"github.com/aws/aws-lambda-go/events"
	"io"
	"log"
	"net/http"
	"net/url"
)

func Handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

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

	bs := string(body)

	// Logs to CloudWatch for debugging
	log.Println("SteamVerifyURL: " + steamVerifyURL + "\n\nBody String: " + bs)

	// Return the redirect response
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusFound,
		Body:       bs,
	}, nil
}
