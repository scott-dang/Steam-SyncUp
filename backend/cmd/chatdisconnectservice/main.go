package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/scott-dang/Steam-SyncUp/internal/chatdisconnect"
)

func main() {
	lambda.Start(chatdisconnect.Handler)
}
