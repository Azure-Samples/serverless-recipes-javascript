import { app, HttpRequest, InvocationContext } from "@azure/functions";

app.http('hello', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    const { name } = request.body;
    return {
      jsonBody: `Hello, ${name || 'world'}!`
    };
  }
});
