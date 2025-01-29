import { app, input, type HttpRequest, type InvocationContext } from '@azure/functions';

const openAiCompletionInput = input.generic({
  // {prompt} comes from the request body
  prompt: '{prompt}',
  maxTokens: 1000,
  type: 'textCompletion',
  model: '%AZURE_OPENAI_CHAT_DEPLOYMENT_NAME%',
});

app.http('completions', {
  methods: ['POST'],
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
