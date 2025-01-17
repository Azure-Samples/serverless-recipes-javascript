import { app, input, HttpRequest, InvocationContext } from "@azure/functions";

const openAICompletionInput = input.generic({
  // {prompt} comes from the request body
  prompt: '{prompt}',
  maxTokens: 1000,
  type: 'textCompletion',
  model: '%AZURE_OPENAI_CHAT_DEPLOYMENT_NAME%',
})

app.http('completions', {
  methods: ['POST'],
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
