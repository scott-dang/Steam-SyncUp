#!/bin/bash

set -e

cd ./frontend

# Install, Lint, Build and Test
echo -e "\n--------------------------"
echo "Starting workflow on Frontend"
echo -e "--------------------------\n"

# Install
echo -e "Installing packages\n"
npm i

# Linting
echo -e "Linting (not implemented yet: TODO)\n"

# Building
echo -e "Building\n"
npm run build

# Testing
echo -e "Running tests with coverage\n"
npm run test:coverage

echo "--------------------------"
echo "Finished workflow on Frontend"
echo "--------------------------"

# Navigate back to the project root
cd ..
