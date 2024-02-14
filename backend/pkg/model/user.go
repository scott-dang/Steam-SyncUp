package model

type User struct {
	SteamUUID   string
	CreatedDate string
	JWTToken    string
	LobbyGame   string `json:"lobbygame"`
	LobbyLeader string `json:"lobbyleader"`

	PersonName string `json:"personaname"`
	AvatarFull string `json:"avatarfull"`
}
