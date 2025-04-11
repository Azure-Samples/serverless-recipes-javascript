import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { DbService } from '../data/db-service';

// Get all orders endpoint
app.http('orders-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'orders',
  handler: async (_request: HttpRequest, _context: InvocationContext) => {
    const dbService = DbService.getInstance();
    const orders = dbService.getOrders();

    return {
      jsonBody: orders,
      status: 200
    };
  }
});

// Get single order by ID endpoint
app.http('orders-get-by-id', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'orders/{orderId}',
  handler: async (request: HttpRequest, _context: InvocationContext) => {
    const orderId = request.params.orderId;

    if (!orderId) {
      return {
        jsonBody: { error: 'Order ID is required' },
        status: 400
      };
    }

    const dbService = DbService.getInstance();
    const order = dbService.getOrder(orderId);

    if (!order) {
      return {
        jsonBody: { error: 'Order not found' },
        status: 404
      };
    }

    return {
      jsonBody: order,
      status: 200
    };
  }
});
