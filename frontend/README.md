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

### Other

Do not install typescript-estree/typescript-eslint, it is incompatible with this version of TypeScript.
