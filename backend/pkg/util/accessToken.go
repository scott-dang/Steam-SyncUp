package util

import (
	"github.com/golang-jwt/jwt/v5"
)

type UserClaims struct {
	SteamUUID	string
}

func createToken(uuid string) (string, error) {
	// Create a new token object, specifying signing method and the claims
	// you would like it to contain.
	token := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{
		"sT": "bar",
		"nbf": 1568719380,
	})

	// Sign and get the complete encoded token as a string using the secret
	tokenString, err := token.SignedString([]byte("secret"))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}