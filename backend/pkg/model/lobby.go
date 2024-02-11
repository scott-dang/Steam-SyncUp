package model

type Lobby struct {
	Leader     string    `json:"leader"`
	Appid      int       `json:"appid"`
	LobbyName  string    `json:"lobbyname"`
	LobbyUsers []string  `json:"lobbyusers"`
	MaxUsers   int       `json:"maxusers"`
	Messages   []Message `json:"messages"`
}

type Message struct {
	User      string `json:"user"`
	Text      string `json:"text"`
	Timestamp string `json:"timestamp"`
}