## Frontend development guide

### General

Every page is connected through App.tsx using react-router-dom.

New pages are inside the ./src/pages/ directory.

Smaller components are inside the ./src/components directory.

Right now, colors and sizes are static Tailwind, but hopefully we can implement responsive practices.

### Commands

Run `npm install typescript` if TypeScript is not in npm.

Run `npm run build` to build the project.

Run `npm run start` to demo the project in localhost:3000.

Run `npm test` to run testing.

### Testing

Testing files are within the ./src/\_\_tests\_\_ directory.

Tests should be named with the convention "<filename>.test.ts". 

Each test file should contain test cases that refer to one singular component on the frontend. 

A test case should be as minimal as possible and should have a clear and concise name detailing what 
it is testing. 

For our frontend test cases, we use assertions to test rendering of components. 

For additional details and specifics for writing tests for each "common" case, refer to Jest docs here: [text](https://jestjs.io/). 

To create a new test, create a file for the component you want to test if it does not exist already. Add test cases by calling the test() function for each new test case.

### Other

Do not install typescript-estree/typescript-eslint, it is incompatible with this version of TypeScript.
