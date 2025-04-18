import path from 'node:path';
import { ToppingCategory } from './topping';
import { Pizza } from './pizza';
import { Topping } from './topping';
import { Order, OrderStatus } from './order';
import { Container, CosmosClient, Database } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import pizzasData from '../data/pizzas.json';
import toppingsData from '../data/toppings.json';
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

// Database service for our pizza API using Azure Cosmos DB
export class DbService {
  private static instance: DbService;
  private client: CosmosClient | undefined = undefined;
  private database: Database | undefined = undefined;
  private pizzasContainer: Container | undefined = undefined;
  private toppingsContainer: Container | undefined = undefined;
  private ordersContainer: Container | undefined = undefined;

  // Fallback to local data if Cosmos DB is not available
  private localPizzas: Pizza[] = [];
  private localToppings: Topping[] = [];
  private localOrders: Order[] = [];
  private isCosmosDbInitialized = false;

  public static async getInstance(): Promise<DbService> {
    if (!DbService.instance) {
      DbService.instance = new DbService();
      await DbService.instance.initializeCosmosDb();
      DbService.instance.initializeLocalData();
    }
    return DbService.instance;
  }

  // Initialize Cosmos DB client and containers
  protected async initializeCosmosDb(): Promise<void> {
    try {
      const endpoint = process.env.AZURE_COSMOSDB_NOSQL_ENDPOINT;

      if (!endpoint) {
        console.warn('Cosmos DB endpoint not found in environment variables. Using local data.');
        return;
      }

      // Use DefaultAzureCredential for managed identity
      const credential = new DefaultAzureCredential();

      this.client = new CosmosClient({
        endpoint,
        aadCredentials: credential
      });

      // Get or create database
      const databaseId = 'pizzaDB';
      const { database } = await this.client.databases.createIfNotExists({
        id: databaseId
      });
      this.database = database;

      // Get or create containers
      const { container: pizzasContainer } = await this.database.containers.createIfNotExists({
        id: 'pizzas',
        partitionKey: { paths: ['/id'] }
      });
      this.pizzasContainer = pizzasContainer;

      const { container: toppingsContainer } = await this.database.containers.createIfNotExists({
        id: 'toppings',
        partitionKey: { paths: ['/id'] }
      });
      this.toppingsContainer = toppingsContainer;

      const { container: ordersContainer } = await this.database.containers.createIfNotExists({
        id: 'orders',
        partitionKey: { paths: ['/id'] }
      });
      this.ordersContainer = ordersContainer;

      this.isCosmosDbInitialized = true;

      // Seed initial data if containers are empty
      await this.seedInitialDataIfEmpty();

      console.log('Successfully connected to Cosmos DB');
    } catch (error) {
      console.error('Failed to initialize Cosmos DB:', error);
      console.warn('Falling back to local data storage');
    }
  }

  // Seed initial data if containers are empty
  private async seedInitialDataIfEmpty(): Promise<void> {
    if (!this.isCosmosDbInitialized) return;

    try {
      // Check if Pizzas container is empty
      const pizzaIterator = this.pizzasContainer!.items.query('SELECT VALUE COUNT(1) FROM c');
      const pizzaCount = (await pizzaIterator.fetchAll()).resources[0];

      if (pizzaCount === 0) {
        console.log('Seeding pizzas data to Cosmos DB...');
        const pizzas = pizzasData as Pizza[];
        for (const pizza of pizzas) {
          await this.pizzasContainer!.items.create(pizza);
        }
      }

      // Check if Toppings container is empty
      const toppingIterator = this.toppingsContainer!.items.query('SELECT VALUE COUNT(1) FROM c');
      const toppingCount = (await toppingIterator.fetchAll()).resources[0];

      if (toppingCount === 0) {
        console.log('Seeding toppings data to Cosmos DB...');
        const toppings = toppingsData as Topping[];
        for (const topping of toppings) {
          await this.toppingsContainer!.items.create(topping);
        }
      }
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }

  // Pizza methods
  public async getPizzas(): Promise<Pizza[]> {
    if (this.isCosmosDbInitialized) {
      try {
        const querySpec = {
          query: 'SELECT * FROM c'
        };
        const { resources } = await this.pizzasContainer!.items.query(querySpec).fetchAll();
        return resources as Pizza[];
      } catch (error) {
        console.error('Error fetching pizzas from Cosmos DB:', error);
        return [...this.localPizzas];
      }
    }
    return [...this.localPizzas];
  }

  public async getPizza(id: string): Promise<Pizza | undefined> {
    if (this.isCosmosDbInitialized) {
      try {
        const { resource } = await this.pizzasContainer!.item(id, id).read();
        return resource as Pizza;
      } catch (error) {
        console.error(`Error fetching pizza ${id} from Cosmos DB:`, error);
        return this.localPizzas.find(pizza => pizza.id === id);
      }
    }
    return this.localPizzas.find(pizza => pizza.id === id);
  }

  // Topping methods
  public async getToppings(): Promise<Topping[]> {
    if (this.isCosmosDbInitialized) {
      try {
        const querySpec = {
          query: 'SELECT * FROM c'
        };
        const { resources } = await this.toppingsContainer!.items.query(querySpec).fetchAll();
        return resources as Topping[];
      } catch (error) {
        console.error('Error fetching toppings from Cosmos DB:', error);
        return [...this.localToppings];
      }
    }
    return [...this.localToppings];
  }

  public async getToppingsByCategory(category: ToppingCategory): Promise<Topping[]> {
    if (this.isCosmosDbInitialized) {
      try {
        const querySpec = {
          query: 'SELECT * FROM c WHERE c.toppingCategory = @category',
          parameters: [
            {
              name: '@category',
              value: category
            }
          ]
        };
        const { resources } = await this.toppingsContainer!.items.query(querySpec).fetchAll();
        return resources as Topping[];
      } catch (error) {
        console.error(`Error fetching toppings by category ${category} from Cosmos DB:`, error);
        return this.localToppings.filter(topping => topping.category === category);
      }
    }
    return this.localToppings.filter(topping => topping.category === category);
  }

  public async getTopping(id: string): Promise<Topping | undefined> {
    if (this.isCosmosDbInitialized) {
      try {
        const { resource } = await this.toppingsContainer!.item(id, id).read();
        return resource as Topping;
      } catch (error) {
        console.error(`Error fetching topping ${id} from Cosmos DB:`, error);
        return this.localToppings.find(topping => topping.id === id);
      }
    }
    return this.localToppings.find(topping => topping.id === id);
  }

  // Orders methods
  public async getOrders(): Promise<Order[]> {
    if (this.isCosmosDbInitialized) {
      try {
        const querySpec = {
          query: 'SELECT * FROM c'
        };
        const { resources } = await this.ordersContainer!.items.query(querySpec).fetchAll();
        return resources as Order[];
      } catch (error) {
        console.error('Error fetching orders from Cosmos DB:', error);
        return [...this.localOrders];
      }
    }
    return [...this.localOrders];
  }

  public async getOrder(id: string): Promise<Order | undefined> {
    if (this.isCosmosDbInitialized) {
      try {
        const { resource } = await this.ordersContainer!.item(id, id).read();
        return resource as Order;
      } catch (error) {
        console.error(`Error fetching order ${id} from Cosmos DB:`, error);
        return this.localOrders.find(order => order.id === id);
      }
    }
    return this.localOrders.find(order => order.id === id);
  }

  public async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const id = Date.now().toString(); // Simple ID generation
    const newOrder: Order = {
      ...order,
      id
    };

    if (this.isCosmosDbInitialized) {
      try {
        const { resource } = await this.ordersContainer!.items.create(newOrder);
        return resource as Order;
      } catch (error) {
        console.error('Error creating order in Cosmos DB:', error);
        this.localOrders.push(newOrder);
        return newOrder;
      }
    }

    this.localOrders.push(newOrder);
    return newOrder;
  }

  public async cancelOrder(id: string): Promise<Order | undefined> {
    if (this.isCosmosDbInitialized) {
      try {
        // First read the order to check its status
        const { resource: existingOrder } = await this.ordersContainer!.item(id, id).read();

        if (!existingOrder || existingOrder.status !== OrderStatus.Pending) {
          return undefined;
        }

        // Update the order status
        const updatedOrder = { ...existingOrder, status: OrderStatus.Cancelled };
        const { resource } = await this.ordersContainer!.item(id, id).replace(updatedOrder);
        return resource as Order;
      } catch (error) {
        console.error(`Error cancelling order ${id} in Cosmos DB:`, error);

        // Fall back to local data
        const orderIndex = this.localOrders.findIndex(order => order.id === id);
        if (orderIndex === -1) {
          return undefined;
        }

        const order = this.localOrders[orderIndex];
        if (order.status !== OrderStatus.Pending) {
          return undefined;
        }

        const updatedOrder = { ...order, status: OrderStatus.Cancelled };
        this.localOrders[orderIndex] = updatedOrder;
        return updatedOrder;
      }
    }

    // Handle with local data
    const orderIndex = this.localOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return undefined;
    }

    const order = this.localOrders[orderIndex];
    if (order.status !== OrderStatus.Pending) {
      return undefined;
    }

    const updatedOrder = { ...order, status: OrderStatus.Cancelled };
    this.localOrders[orderIndex] = updatedOrder;
    return updatedOrder;
  }

  // Initialize local mock data from JSON files
  protected initializeLocalData(): void {
    // Load pizzas
    this.localPizzas = pizzasData as Pizza[];

    // Load toppings
    this.localToppings = toppingsData as Topping[];
  }
}
