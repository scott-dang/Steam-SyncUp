package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/scott-dang/Steam-SyncUp/internal/auth"
)

// The AuthService verifies OpenID information and returns whether the login is valid
func main() {
	lambda.Start(auth.Handler)
}
