import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { DbService } from '../db-service';

app.http('orders-delete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'orders/{id}',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    context.log('Processing order cancellation request...');
    context.log('Request params:', request.params);

    try {
      const id = request.params?.id;

      if (!id) {
        return {
          status: 400,
          jsonBody: { error: 'Order ID is required' }
        };
      }

      const dataService = await DbService.getInstance();
      const cancelledOrder = await dataService.cancelOrder(id);

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
