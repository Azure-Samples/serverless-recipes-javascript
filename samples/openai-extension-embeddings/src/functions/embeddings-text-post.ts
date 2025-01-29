import { app, input, type HttpRequest, type InvocationContext } from '@azure/functions';

type EmbeddingsHttpRequest = {
  text: string;
};

const embeddingsHttpInput = input.generic({
  input: '{text}',
  inputType: 'RawText',
  type: 'embeddings',
  model: '%AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME%',
});

app.http('embeddings-text', {
  methods: ['POST'],
  route: 'embeddings/text',
  authLevel: 'anonymous',
  extraInputs: [embeddingsHttpInput],
  async handler(request: HttpRequest, context: InvocationContext) {
    const { text } = (await request.json()) as EmbeddingsHttpRequest;
    const response: any = context.extraInputs.get(embeddingsHttpInput);

    context.log(`Received ${response.count} embedding(s) for input text containing ${text.length} characters.`);

    return {
      jsonBody: response.response.data,
    };
  },
});
