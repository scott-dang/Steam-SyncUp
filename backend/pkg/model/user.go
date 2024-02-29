package model

type User struct {
	SteamUUID   string
	CreatedDate string
	JWTToken    string
	LobbyGame   string `json:"lobbygame"`
	LobbyLeader string `json:"lobbyleader"`

	PersonaName string `json:"personaname"`
	AvatarFull  string `json:"avatarfull"`
}

type PublicUser struct {
	SteamUUID   string
	PersonaName string `json:"personaname"`
	AvatarFull  string `json:"avatarfull"`
}
