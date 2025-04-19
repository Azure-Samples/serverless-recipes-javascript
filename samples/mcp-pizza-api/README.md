<!--
---
page_type: sample
languages:
  - azdeveloper
  - javascript
  - typescript
  - nodejs
  - bicep
products:
  - azure
urlFragment: mcp-pizza-api-javascript
name: Azure Functions Pizza API & MCP server
description: Demonstrates how to create a MCP (Model Context Protocol) tool server using Azure Functions, exposing a pizza ordering API as tools.
---
-->

<!-- prettier-ignore -->
<!-- Learn samples onboarding: https://review.learn.microsoft.com/en-us/help/contribute/samples/process/onboarding?branch=main -->

<div align="center">

<img src="./docs/images/icon.png" alt="" align="center" height="64" />

# Azure Functions Pizza API & MCP server

[![Open project in GitHub Codespaces](https://img.shields.io/badge/Codespaces-Open-blue?style=flat-square&logo=github)](https://codespaces.new/Azure-Samples/serverless-recipes-javascript?hide_repo_select=true&ref=main&quickstart=true)
![Node version](https://img.shields.io/badge/Node.js->=20-3c873a?style=flat-square)
![Deployment time](https://img.shields.io/badge/Time%20to%20deploy-10min-teal?style=flat-square)
<!-- [![Watch video on YouTube](https://img.shields.io/badge/YouTube-Watch-d95652.svg?style=flat-square&logo=youtube)](TODO) -->

[Overview](#overview) • [Run the sample](#run-the-sample) • [Key concepts](#key-concepts) • [Troubleshooting](#troubleshooting) • [Next steps](#next-steps)

</div>

## Overview

This sample demonstrates how to build a feature-rich pizza ordering API using [Azure Functions](https://learn.microsoft.com/azure/azure-functions/functions-overview?pivots=programming-language-javascript), with Model Context Protocol (MCP) tool integration.

<!-- - [📺 YouTube](TODO) - This sample explained in video
- [📚 Azure Blog](TODO) - Related blog post -->

![Application architecture](./docs/images/architecture.drawio.png)

This application is composed of several components:

- A serverless API implemented in [Azure Functions](https://learn.microsoft.com/azure/azure-functions/functions-overview?pivots=programming-language-javascript), written in TypeScript.
- A local in-memory data layer for pizza menus, toppings, and orders, used during development.
- An [MCP](https://mcp.microsoft.com/) server exposing pizza business logic and API endpoints as tools.
- OpenAPI documentation for easy exploration of the REST endpoints.

### API Endpoints

The Pizza API provides the following endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/pizzas | Returns a list of all pizzas |
| GET | /api/pizzas/{id} | Retrieves a specific pizza by its ID |
| GET | /api/toppings | Returns a list of all toppings (can be filtered by category with ?category=X) |
| GET | /api/toppings/{id} | Retrieves a specific topping by its ID |
| GET | /api/toppings/categories | Returns a list of all topping categories |
| GET | /api/orders | Returns a list of all orders in the system |
| POST | /api/orders | Places a new order with pizzas (requires userId) |
| GET | /api/orders/{orderId} | Retrieves an order by its ID |
| DELETE | /api/orders/{orderId} | Cancels an order if it has not yet been started (status must be 'pending') |
| GET | /api/images/{filepath} | Retrieves image files (e.g., /api/images/pizzas/pizza-1.jpg) |

You can view the complete API documentation by opening the [Swagger Editor](https://editor.swagger.io/?url=https://raw.githubusercontent.com/microsoft/open-hack-build-25/blob/pizza-api/src/pizza-api/openapi.yaml) or the [OpenAPI YAML file](openapi.yaml).

### MCP tools

The Pizza MCP server provides the following tools, exposing the Pizza API endpoints:

| Tool Name | Description |
|-----------|-------------|
| get_pizzas | Get a list of all pizzas in the menu |
| get_pizza_by_id | Get a specific pizza by its ID |
| get_toppings | Get a list of all toppings in the menu |
| get_topping_by_id | Get a specific topping by its ID |
| get_topping_categories | Get a list of all topping categories |
| get_orders | Get a list of all orders in the system |
| get_order_by_id | Get a specific order by its ID |
| place_order | Place a new order with pizzas (requires userId) |
| delete_order_by_id | Cancel an order if it has not yet been started (status must be 'pending') |
| get_image | Retrieve the full URL of an image file |

#### Test with MCP inspector

First, you need to start the Pizza API and Pizza MCP server locally.

1. In a terminal window, start MCP Inspector:
    ```bash
    npx -y @modelcontextprotocol/inspector
    ```
2. Ctrl+click to load the MCP Inspector web app from the URL displayed by the app (e.g. http://127.0.0.1:6274)
3. In the MCP Inspector, set the transport type to **SSE** and 
3. Put `http://localhost:7072/runtime/webhooks/mcp/sse` in the URL field and click on the **Connect** button.
4. In the **Tools** tab, select **List Tools**. Click on a tool and select **Run Tool**.

## Run the sample

### Prerequisites

- [Node.js LTS](https://nodejs.org/en/download/)
- [Azure Developer CLI](https://aka.ms/azure-dev/install)
- [Git](https://git-scm.com/downloads)
- Azure account. If you're new to Azure, [get an Azure account for free](https://azure.microsoft.com/free) to get free Azure credits to get started. If you're a student, you can also get free credits with [Azure for Students](https://aka.ms/azureforstudents).
- Azure account permissions:
  - Your Azure account must have `Microsoft.Authorization/roleAssignments/write` permissions, such as [Role Based Access Control Administrator](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#role-based-access-control-administrator-preview), [User Access Administrator](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#user-access-administrator), or [Owner](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#owner). If you don't have subscription-level permissions, you must be granted [RBAC](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#role-based-access-control-administrator-preview) for an existing resource group and [deploy to that existing group](docs/deploy_existing.md#resource-group).
  - Your Azure account also needs `Microsoft.Resources/deployments/write` permissions on the subscription level.

### Cost estimation

Pricing varies per region and usage, so it isn't possible to predict exact costs for your usage.
However, you can use the [Azure pricing calculator](TODO) for the resources below to get an estimate.

- Azure Functions: Flex Consumption plan, Free for the first 250K executions. Pricing per execution and memory used. [Pricing](https://azure.microsoft.com/pricing/details/functions/)
- Azure Blob Storage: Standard tier with LRS. Pricing per GB stored and data transfer. [Pricing](https://azure.microsoft.com/pricing/details/storage/blobs/)
- TODO ...

⚠️ To avoid unnecessary costs, remember to take down your app if it's no longer in use,
either by deleting the resource group in the Portal or running `azd down --purge`.

### Setup development environment

You can run this project directly in your browser by using GitHub Codespaces, which will open a web-based VS Code.

1. [**Fork**](https://github.com/Azure-Samples/serverless-recipes-javascript/fork) the project to create your own copy of this repository.
2. On your forked repository, select the **Code** button, then the **Codespaces** tab, and clink on the button **Create codespace on main**.
   ![Screenshot showing how to create a new codespace](../../docs/images/codespaces.png?raw=true)
3. Wait for the Codespace to be created, it should take a few minutes.

If you prefer to run the project locally, follow [these instructions](../../README.md#use-your-local-environment).

### Deploy Azure resources

Open a terminal in the project root and follow these steps to deploy the Azure resources needed:

```bash
# Open the sample directory
cd samples/mcp-pizza-api

# Install dependencies
npm install

# Deploy the sample to Azure
azd auth login
azd up
```

You will be prompted to select a base location for the resources. If you're unsure of which location to choose, select `eastus2`.
The deployment process will take a few minutes.

### Test the application locally

You can use the following command to run the application locally:

```bash
npm start
```

This command will start the Azure Functions application locally. The pizza API will be available at `http://localhost:7071/api/`.
You can now test the application by running:

```bash
curl http://localhost:7071/api/pizzas
```

Try other endpoints, such as posting a new order or listing toppings.

Alternatively, you can also open the file `api.http` in VS Code and click on **Send Request** to try the endpoints.

#### Using Swagger/OpenAPI

You can open the [Swagger Editor](https://editor.swagger.io/?url=https://raw.githubusercontent.com/microsoft/serverless-recipes-js/blob/samples/mcp-pizza-api/openapi.yaml) and test the endpoints interactively.

#### Using the MCP Inspector

Once the application is running, you can test the MCP tools using the MCP Inspector. The Function app is exposing the MCP server over SSE (Server-Sent Events) at the following URL: `http://localhost:7071/runtime/webhooks/mcp/sse`.


- Follow the "Test with MCP inspector" steps above to run tool-based interactions over SSE.

### Clean up

To clean up all the Azure resources created by this sample:

1. Run `azd down --purge`
2. When asked if you are sure you want to continue, enter `y`

The resource group and all the resources will be deleted.

## Key concepts

- **Azure Functions**: Serverless APIs with HTTP triggers for REST endpoints.
- **TypeScript and Node.js**: Type-safe application and API logic.
- **Model Context Protocol (MCP)**: Expose backend operations as tools that can be orchestrated by AI or other agents.
- **OpenAPI/Swagger**: For API discoverability and client generation.
- **Local Data Storage**: This sample uses in-memory data for pizzas, toppings, and orders; in production, swap to durable storage.

## Troubleshooting

If you have any issue when running or deploying this sample, please check the [troubleshooting guide](../../docs/troubleshooting.md). If you can't find a solution to your problem, please [open an issue](https://github.com/Azure-Samples/serverless-recipes-javascript/issues).

## Next steps

Here are some resources to learn more about the technologies used in this sample:

- [Azure Functions documentation](https://learn.microsoft.com/azure/azure-functions/)
- https://github.com/Azure-Samples/remote-mcp-functions-typescript
- [Model Context Protocol](https://github.com/microsoft/mcp)
- [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/)
- TODO ...
