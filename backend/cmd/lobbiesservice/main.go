package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/scott-dang/Steam-SyncUp/internal/lobbies"
)

func main() {
	lambda.Start(lobbies.Handler)
}
