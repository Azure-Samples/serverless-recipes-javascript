# Serverless Recipes for JavaScript/TypeScript

A collection of ready-to-use serverless code samples and recipes for building applications with TypeScript, Azure Functions, and Azure services.

## Overview

- **Purpose**: Provide practical, standalone code examples demonstrating serverless development patterns on Azure
- **Audience**: Developers building serverless applications with TypeScript and Azure
- **Architecture**: Serverless-first approach using Azure Functions with various Azure services (OpenAI, Cosmos DB, Blob Storage)
- **Project structure**: Monorepo with multiple independent samples in the `samples/` directory, each deployable as a standalone project

## Key Technologies and Frameworks

- **Runtime**: Node.js (>=20), TypeScript 5.x
- **Serverless compute**: Azure Functions (v4) with HTTP triggers
- **AI/ML**: Azure OpenAI Service, OpenAI extensions for Azure Functions
- **Database**: Azure Cosmos DB for NoSQL
- **Storage**: Azure Blob Storage
- **Protocols**: Model Context Protocol (MCP) for AI tool integration
- **API documentation**: OpenAPI/Swagger specifications
- **Infrastructure**: Azure Developer CLI (azd), Bicep templates
- **Build tools**: Vite 6.x, Azure Functions Core Tools v4
- **Development**: GitHub Codespaces, VS Code Dev Containers

## Constraints and Requirements

- **Node.js version**: Minimum v20 LTS required for all samples
- **Azure account**: Required with specific permissions:
  - `Microsoft.Authorization/roleAssignments/write` (RBAC Administrator, User Access Administrator, or Owner role)
  - `Microsoft.Resources/deployments/write` at subscription level
- **Regional availability**: Some samples require Azure OpenAI enabled regions
- **Quotas**: Azure OpenAI models have regional quotas and capacity limits
- **Cost management**: All samples use consumption-based pricing; remember to clean up resources with `azd down --purge`

## Development Workflow

### Setup and Installation
```bash
# Clone the repository
git clone <your-fork-url>

# Navigate to a specific sample
cd samples/<sample-name>

# Install dependencies
npm install
```

### Local Development
```bash
# Start local development server
npm start

# Run linting
npm run lint

# Build the project
npm run build

# Test API endpoints (if available)
# Open api.http file in VS Code and use "Send Request"
```

### Deployment
```bash
# Login to Azure
azd auth login

# Deploy to Azure
azd up

# Clean up resources
azd down --purge
```

### Testing
- Use `api.http` files for HTTP endpoint testing in VS Code
- OpenAPI/Swagger specifications available for API exploration
- MCP Inspector for testing Model Context Protocol tools at `http://localhost:7071/runtime/webhooks/mcp/sse`

## Coding Guidelines

- **Language**: TypeScript with strict type checking enabled
- **Code style**: XO linter with Prettier formatting (2 spaces, semicolons, single quotes, 120 char line width)
- **File structure**: Functions in `src/functions/`, shared code in `src/`, infrastructure in `infra/`
- **Configuration**: Environment variables in `local.settings.json` for local development
- **Error handling**: Proper HTTP status codes and error messages in API responses
- **Security**: Use Azure managed identity for resource access, no hardcoded secrets

## Security Considerations

- **Authentication**: Azure managed identity for inter-service communication
- **Secrets management**: Use Azure Key Vault or App Settings, never commit secrets to code
- **API security**: Implement proper input validation and sanitization
- **CORS**: Configure appropriate CORS policies for web clients
- **Resource access**: Use principle of least privilege for Azure role assignments

## Pull Request Guidelines

- **Build status**: All CI/CD checks must pass (build, lint, test across Node.js v20)
- **Sample structure**: Each sample must be self-contained with its own `README.md`, `package.json`, and deployment configuration
- **Documentation**: Update main README.md samples list if adding new samples
- **Testing**: Ensure `npm start` works locally and `azd up` deploys successfully
- **Cleanup**: Verify `azd down --purge` removes all resources

## Debugging and Troubleshooting

### Common Issues
- **Quota exceeded**: Deploy to different regions or request quota increases for Azure OpenAI
- **Resource conflicts**: Use `azd down --purge` to fully clean up soft-deleted resources (48-hour retention)
- **Cold start delays**: First requests may take several seconds due to serverless scale-to-zero
- **Regional availability**: Check [Azure OpenAI model availability matrix](https://aka.ms/oai/models) for supported regions

### Local Development
- **Functions runtime**: Ensure Azure Functions Core Tools v4 is installed
- **Environment variables**: Copy and configure `local.settings.json` from template
- **Port conflicts**: Default local port is 7071 for Azure Functions

### Performance Considerations
- **Serverless cold starts**: Consider Azure Functions Premium plan for production workloads requiring consistent performance
- **Memory optimization**: Configure appropriate memory allocation for Functions
- **Connection pooling**: Implement proper database connection management for Azure Cosmos DB