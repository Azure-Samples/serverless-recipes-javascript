import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { DataService } from '../models/data-service';

app.http('menu-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'menu',
  handler: async (_request: HttpRequest, _context: InvocationContext) => {
    const dataService = DataService.getInstance();
    const menuItems = dataService.getMenuItems();

    return {
      jsonBody: menuItems,
      status: 200
    };
  }
});