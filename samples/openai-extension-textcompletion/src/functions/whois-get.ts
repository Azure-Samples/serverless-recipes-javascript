import { app, input, type HttpRequest, type InvocationContext } from '@azure/functions';

const openAiCompletionInput = input.generic({
  // {name} comes from the API route
  prompt: 'Who is {name}? Answer in 2 sentences.',
  maxTokens: 100,
  type: 'textCompletion',
  model: '%AZURE_OPENAI_CHAT_DEPLOYMENT_NAME%',
});

app.http('whois', {
  methods: ['GET'],
  route: 'whois/{name}',
  authLevel: 'anonymous',
  extraInputs: [openAiCompletionInput],
  async handler(_request: HttpRequest, context: InvocationContext) {
    const response: any = context.extraInputs.get(openAiCompletionInput);
    return {
      status: 200,
      body: response.content.trim(),
    };
  },
});
