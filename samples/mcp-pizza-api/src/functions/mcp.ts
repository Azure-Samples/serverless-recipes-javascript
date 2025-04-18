import path from "node:path";
import { app, InvocationContext } from "@azure/functions";
import { z } from "zod";
import dotenv from "dotenv";

// Env file is located in the root of the repository
dotenv.config({ path: path.join(__dirname, "../../.env") });

const pizzaApiUrl = process.env.PIZZA_API_URL || "http://localhost:7071";

createMcpTool({
  toolName: "get_pizzas",
  description: "Get a list of all pizzas in the menu",
  handler: async (context) => {
    return fetchPizzaApi(context, "/api/pizzas");
  },
});

createMcpTool({
  toolName: "get_pizza_by_id",
  description: "Get a specific pizza by its ID",
  toolProperties: z.object({
    id: z.string().describe("ID of the pizza to retrieve"),
  }),
  handler: async (context, args) => {
    return fetchPizzaApi(context, `/api/pizzas/${args.id}`);
  },
});

createMcpTool({
  toolName: "get_toppings",
  description: "Get a list of all toppings in the menu",
  toolProperties: z.object({
    category: z
      .string()
      .describe("Category of toppings to filter by (can be empty)"),
  }),
  handler: async (context, args) => {
    return fetchPizzaApi(
      context,
      `/api/toppings?category=${args.category ?? ""}`
    );
  },
});

createMcpTool({
  toolName: "get_topping_by_id",
  description: "Get a specific topping by its ID",
  toolProperties: z.object({
    id: z.string().describe("ID of the topping to retrieve"),
  }),
  handler: async (context, args) => {
    return fetchPizzaApi(context, `/api/toppings/${args.id}`);
  },
});

createMcpTool({
  toolName: "get_topping_categories",
  description: "Get a list of all topping categories",
  handler: async (context, _args) => {
    return fetchPizzaApi(context, "/api/toppings/categories");
  },
});

createMcpTool({
  toolName: "get_orders",
  description: "Get a list of all orders in the system",
  handler: async (context, _args) => {
    return fetchPizzaApi(context, "/api/orders");
  },
});

createMcpTool({
  toolName: "get_order_by_id",
  description: "Get a specific order by its ID",
  toolProperties: z.object({
    id: z.string().describe("ID of the order to retrieve"),
  }),
  handler: async (context, args) => {
    return fetchPizzaApi(context, `/api/orders/${args.id}`);
  },
});

createMcpTool({
  toolName: "place_order",
  description: "Place a new order with pizzas (requires userId)",
  toolProperties: z.object({
    userId: z.string().describe("ID of the user placing the order"),
    items: z.array(z.object({
          pizzaId: z.string().describe("ID of the pizza"),
          quantity: z.number().min(1).describe("Quantity of the pizza"),
          extraToppingIds: z.array(z.string()).describe("List of extra topping IDs"),
        })
      )
      .nonempty()
      .describe("List of items in the order"),
  }),
  handler: async (context, args) => {
    // Currently, sub items are passed as a JSON string and not parsed
    // so we need to parse it here
    const rawItems = args.items as any;
    const items = JSON.parse(rawItems);

    return fetchPizzaApi(context, "/api/orders", {
      method: "POST",
      body: JSON.stringify({ ...args, items }),
    });
  },
});

createMcpTool({
  toolName: "delete_order_by_id",
  description:
    'Cancel an order if it has not yet been started (status must be "pending")',
  toolProperties: z.object({
    id: z.string().describe("ID of the order to cancel"),
  }),
  handler: async (context, args) => {
    return fetchPizzaApi(context, `/api/orders/${args.id}`, {
      method: "DELETE",
    });
  },
});

createMcpTool({
  toolName: "get_image",
  description: "Retrieve the full URL of an image file",
  toolProperties: z.object({
    filepath: z.string().describe("Path to the image file"),
  }),
  handler: async (context, args) => {
    const imageUrl = new URL(
      `/api/images/${args.filepath}`,
      pizzaApiUrl
    ).toString();
    context.log("Image URL:", imageUrl);
    return imageUrl;
  },
});

app.setup({
  enableHttpStream: true,
});

// Helper that wraps MCP tool creation
// It handles arguments typing, error handling and response formatting
function createMcpTool<T>(options: {
  toolName: string;
  description: string;
  toolProperties?: z.ZodType<T>;
  handler: (context: InvocationContext, args: T) => Promise<string>;
}) {
  app.mcpTool(options.toolName, {
    toolName: options.toolName,
    description: options.description,
    toolProperties: options.toolProperties,
    handler: async (
      toolArguments: any,
      context: InvocationContext
    ): Promise<string> => {
      try {
        context.log("Executing MCP tool:", toolArguments.name);
        if (options.toolProperties) {
          const args = context.triggerMetadata?.mcptoolargs as z.infer<
            typeof options.toolProperties
          >;
          if (!args) {
            context.error("No arguments provided");
            throw new Error("No arguments provided");
          }
          context.log("Tool arguments:", args);
          return await options.handler(context, args);
        } else {
          return await options.handler(context, undefined as any);
        }
      } catch (error: any) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        context.error("Error executing MCP tool:", errorMessage);
        // throw error; // This isn't transformed into an MCP error currently
        return `Error: ${errorMessage}`;
      }
    },
  });
}

// Wraps standard fetch to include the base URL and handle errors
async function fetchPizzaApi(
  context: InvocationContext,
  url: string,
  options: RequestInit = {}
): Promise<string> {
  const fullUrl = new URL(url, pizzaApiUrl).toString();
  context.log(`Fetching ${fullUrl}`);
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching ${fullUrl}: ${response.statusText}`);
    }
    return response.json();
  } catch (error: any) {
    context.error(`Error fetching ${fullUrl}:`, error);
    throw error;
  }
}
