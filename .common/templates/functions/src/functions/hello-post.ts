import { app, HttpRequest, InvocationContext } from "@azure/functions";

interface HelloHttpRequest {
  name?: string;
}

app.http("hello", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request: HttpRequest, context: InvocationContext) => {
    const { name } = (await request.json()) as HelloHttpRequest;
    return {
      jsonBody: `Hello, ${name || "world"}!`,
    };
  },
});
