#!/bin/bash

set -e

cd ./backend

echo -e "\nTidying up module and packages..."
go mod tidy

# Lint, Build and Test each Lambda function
for dir in cmd/*; do
    if [ -d "$dir" ] && [ -f "$dir/main.go" ]; then
        lambda_name=$(basename "$dir")
        echo -e "\n--------------------------"
        echo "Starting workflow on Lambda: $lambda_name"
        echo -e "--------------------------\n"

        # Linting
        echo -e "Linting $dir\n"
        gofmt -l "$dir"

        # Building
        echo -e "Building $dir"
        GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o "./bin/$lambda_name/bootstrap" "$dir/main.go"
        zip -j "./bin/$lambda_name/main.zip" "./bin/$lambda_name/bootstrap"

        # Construct test directory name (remove 'service' from the lambda name)
        test_dir_name=$(echo "$lambda_name" | sed 's/service//')
        test_dir="tests/$test_dir_name"

        # Check if test directory exists
        if [ -d "$test_dir" ]; then
            # Testing
            echo -e "\nTesting $test_dir\n"
            go test "$test_dir/..."
        else
            echo -e "\nNo test directory found for $lambda_name in path \"$test_dir\", skipping tests\n"
        fi

        echo "--------------------------"
        echo "Finished workflow on Lambda: $lambda_name"
        echo "--------------------------"
    fi
done

# Generate the coverage profile by rerunning the tests again
# This run, it also includes any utilities, etc.
go test --coverprofile="./bin/coverage.out" "./..."

# Navigate back to the project root
cd ..
