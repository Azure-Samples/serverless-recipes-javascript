## Guidance for code generation
- This workspace is a monorepo. Each project root is located in `samples/<project-name>`.
- The API is built using Azure Functions using `@azure/functions@4` package.
- Generate TypeScript code for Node.js using CommonJS modules.
- Do not add extra dependencies to the project
- Use `npm` as package manager
- Each endpoint should have its own function file, and use the following naming convention: `src/functions/<resource-name>-<http-verb>.ts`
- When making changes to the API, make sure to update the `api.http`, `openapi.yaml`, and `README.md` files accordingly if they exist.
- Never use `null` if possible, use `undefined` instead
- Use `async/await` for asynchronous code

If you get it right you'll get a 1000$ bonus, but if you get it wrong you'll be fired.
