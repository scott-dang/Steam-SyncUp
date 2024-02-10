package games

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/scott-dang/Steam-SyncUp/pkg/util"
)

type GamesServiceResponseBody struct {
	Authenticated	bool `json:"authenticated"`
	UUID	 		string `json:"uuid"`
	ListOfGames struct {
		GameCount int `json:"game_count"`
		Games     []struct {
			Appid                    int    `json:"appid"`
			Name                     string `json:"name"`
			ImgIconURL               string `json:"img_icon_url"`
		} `json:"games"`
	} `json:"list_of_games"`
}

type SteamGetOwnedGamesBody struct {
	Response struct {
		GameCount int `json:"game_count"`
		Games     []struct {
			Appid                    int    `json:"appid"`
			Name                     string `json:"name"`
			ImgIconURL               string `json:"img_icon_url"`
		} `json:"games"`
	} `json:"response"`
}

func Handler(context context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// if it is a successful authentication, then you get a user, otherwise you get an error
	user, err := util.Authenticate(request, context)

	body := GamesServiceResponseBody{
		Authenticated: false,
	}

	if err == nil {
		body.Authenticated = true
		body.UUID = user.SteamUUID

    steamGetOwnedGamesAPI := "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?"
    steamAPIKey := os.Getenv("STEAM_API_KEY")

    queryParams := url.Values{
      "key": {steamAPIKey},
      "steamid": {user.SteamUUID},
      "include_appinfo": {"true"},
      "include_played_free_games": {"true"},
    }

    steamGetOwnedGamesAPIURL := steamGetOwnedGamesAPI + queryParams.Encode()

    resp, err := http.Get(steamGetOwnedGamesAPIURL)
    if err != nil {
      return events.APIGatewayProxyResponse{
        StatusCode: http.StatusInternalServerError,
      }, nil
    }

    getOwnedGamesBodyJson, err := io.ReadAll(resp.Body)
    if err != nil {
      return events.APIGatewayProxyResponse{
        StatusCode: http.StatusInternalServerError,
      }, nil
    }

    getOwnedGamesBody := SteamGetOwnedGamesBody{}

    err = json.Unmarshal(getOwnedGamesBodyJson, &getOwnedGamesBody)

    if err != nil {
      return events.APIGatewayProxyResponse{
        StatusCode: http.StatusInternalServerError,
      }, nil
    }

    body.ListOfGames = getOwnedGamesBody.Response
	}

	responseBody, _ := json.Marshal(body)

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(responseBody),
	}, nil
}
