package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/scott-dang/Steam-SyncUp/internal/users"
)

func main() {
	lambda.Start(users.Handler)
}
