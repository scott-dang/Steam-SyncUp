package model

type Game struct {
	Appid      int    `json:"appid"`
	Name       string `json:"name"`
	ImgIconURL string `json:"img_icon_url"`
}