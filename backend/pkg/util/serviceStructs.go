package util

import "github.com/scott-dang/Steam-SyncUp/pkg/model"

type ChatConnectServiceRequestBody struct {
	JWTToken string `json:"jwttoken"`
}

type GamesServiceResponseBody struct {
	Authenticated bool   `json:"authenticated"`
	UUID          string `json:"uuid"`
	ListOfGames   struct {
		GameCount int          `json:"game_count"`
		Games     []model.Game `json:"games"`
	} `json:"list_of_games"`
}

type SteamGetOwnedGamesBody struct {
	Response struct {
		GameCount int          `json:"game_count"`
		Games     []model.Game `json:"games"`
	} `json:"response"`
}

type SteamGetPlayerSummariesBody struct {
	Response struct {
		Players []struct {
			AvatarFull  string `json:"avatarfull"`
			PersonaName string `json:"personaname"`
		} `json:"players"`
	} `json:"response"`
}

type UsersServiceProfileInfoResponseBody struct {
	AvatarFull  string `json:"avatarfull"`
	PersonaName string `json:"personaname"`
	LobbyGame   string `json:"lobbygame"`
	LobbyLeader string `json:"lobbyleader"`
}

type SendMessageServiceRequestBody struct {
	Text        string `json:"text"`
	SUID        string `json:"suid"`
	Personaname string `json:"personaname"`
}

type SendMessageServiceConnectionsInput struct {
	Key       ConnectionsKey `json:"key"`
	TableName string         `json:"tableName"`
}

type SendMessageServiceConnectionsKey struct {
	ConnectionID string `json:"connectionId"`
}