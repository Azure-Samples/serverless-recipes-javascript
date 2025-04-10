import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { DbService } from '../data/db-service';

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
