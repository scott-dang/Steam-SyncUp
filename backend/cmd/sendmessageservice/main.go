package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/scott-dang/Steam-SyncUp/internal/sendmessage"
)

func main() {
	lambda.Start(sendmessage.Handler)
}
