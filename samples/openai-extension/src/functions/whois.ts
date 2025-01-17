import { app, HttpRequest, HttpResponseInit, input, InvocationContext } from "@azure/functions";

async function getTextCompletion(_request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const response: any = context.extraInputs.get(openAICompletionInput);
  return { status: 200, body: response.content.trim() };
}

// This OpenAI completion input requires a {name} binding value.
const openAICompletionInput = input.generic({
  prompt: 'Who is {name}? Answer in 2 sentences.',
  maxTokens: '100',
  type: 'textCompletion',
  model: '%AZURE_OPENAI_CHAT_DEPLOYMENT_NAME%'
})

app.http('whois', {
  methods: ['GET'],
  route: 'whois/{name}',
  authLevel: 'anonymous',
  extraInputs: [openAICompletionInput],
  handler: getTextCompletion
});
