import { app, input, HttpRequest, InvocationContext } from "@azure/functions";

const openAICompletionInput = input.generic({
  // {name} comes from the API route
  prompt: 'Who is {name}? Answer in 2 sentences.',
  maxTokens: 100,
  type: 'textCompletion',
  model: '%AZURE_OPENAI_CHAT_DEPLOYMENT_NAME%'
})

app.http('whois', {
  methods: ['GET'],
  route: 'whois/{name}',
  authLevel: 'anonymous',
  extraInputs: [openAICompletionInput],
  handler: async (_request: HttpRequest, context: InvocationContext) => {
    const response: any = context.extraInputs.get(openAICompletionInput);
    return {
      status: 200,
      body: response.content.trim()
    };
  }
});
