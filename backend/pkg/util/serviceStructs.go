package util

import "github.com/scott-dang/Steam-SyncUp/pkg/model"

type ChatConnectServiceRequestBody struct {
  JWTToken string `json:"jwttoken"`
}

type GamesServiceResponseBody struct {
	Authenticated	bool `json:"authenticated"`
	UUID	 		string `json:"uuid"`
	ListOfGames struct {
		GameCount int `json:"game_count"`
		Games     []model.Game `json:"games"`
	} `json:"list_of_games"`
}

type SteamGetOwnedGamesBody struct {
	Response struct {
		GameCount int `json:"game_count"`
		Games     []model.Game `json:"games"`
	} `json:"response"`
}

