package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/scott-dang/Steam-SyncUp/internal/games"
)

// The AuthService verifies OpenID information and returns whether the login is valid
// TODO: Have it generate a token for login persistence
func main() {
	lambda.Start(games.Handler)
}
