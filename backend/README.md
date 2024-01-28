
# Backend Overview

## Structure

- **/cmd**: Contains the main applications for the project. Each subdirectory under `cmd` is an entry point for a different component or Lambda function.

- **/internal**: This directory is for code that's specific to this project. Code in `internal` cannot be imported by other Go code outside of this project. Handlers and most of our logic will go here under their own subdirectory for their service.

- **/pkg**: This is where we place library code that can be reused across projects or by other projects. It's a good place for domain logic that could be potentially isolated.

- **/pkg/model**: Data structures and domain models used throughout the application.

- **go.mod** and **go.sum**: Go module files for handling project dependencies.

## Testing
- Unit tests will be created in parallel in the same directory with the code they are testing on. For example, if unit testing `handlerA.go`, we can create a test file suffixed with _test like so, `handlerA_test.go`  before running `go test`.
- Integration tests can be created in its own directory as its responsibility is across multiple directories / files.

## Additional Notes

- It's important to keep this structure consistent to ensure readability and maintainability of the code.
- Each Lambda function in the project will be housed under `/cmd` with its own directory, allowing for clear separation and modularity. This will streamline the process when we build and deploy our functions to Lambda.

---
