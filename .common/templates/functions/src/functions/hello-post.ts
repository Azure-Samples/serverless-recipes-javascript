import { app, type HttpRequest, type InvocationContext } from '@azure/functions';

type HelloHttpRequest = {
  name?: string;
};

app.http('hello', {
  methods: ['POST'],
  authLevel: 'anonymous',
  async handler(request: HttpRequest, _context: InvocationContext) {
    const { name } = (await request.json()) as HelloHttpRequest;
    return {
      jsonBody: `Hello, ${name ?? 'world'}!`,
    };
  },
});
