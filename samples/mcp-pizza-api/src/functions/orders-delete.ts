import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { DbService } from '../data/db-service';

app.http('orders-delete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'orders/{id}',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    try {
      const id = request.params?.id;

      if (!id) {
        return {
          status: 400,
          jsonBody: { error: 'Order ID is required' }
        };
      }

      const dbService = DbService.getInstance();
      const cancelledOrder = dbService.cancelOrder(id);

      if (!cancelledOrder) {
        return {
          status: 404,
          jsonBody: { error: 'Order not found or cannot be cancelled' }
        };
      }

      return {
        status: 200,
        jsonBody: cancelledOrder
      };
    } catch (error) {
      context.error('Error cancelling order:', error);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});
