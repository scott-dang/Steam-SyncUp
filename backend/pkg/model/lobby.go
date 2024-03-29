package model

type Lobby struct {
	Leader     string                `json:"leader"`
	Appid      int                   `json:"appid"`
	LobbyName  string                `json:"lobbyname"`
	LobbyUsers map[string]PublicUser `json:"lobbyusers"`
	MaxUsers   int                   `json:"maxusers"`
	Messages   []Message             `json:"messages"`
}

type Message struct {
	Personaname string `json:"personaname"`
	Suid        string `json:"suid"`
	Text        string `json:"text"`
	Timestamp   string `json:"timestamp"`
	AvatarFull  string `json:"avatarfull"`
}
