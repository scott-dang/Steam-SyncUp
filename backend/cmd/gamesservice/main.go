package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/scott-dang/Steam-SyncUp/internal/games"
)

func main() {
	lambda.Start(games.Handler)
}
