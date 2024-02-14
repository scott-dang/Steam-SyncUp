package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/scott-dang/Steam-SyncUp/internal/chatconnect"
)

func main() {
	lambda.Start(chatconnect.Handler)
}
