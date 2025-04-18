import { app, input, type HttpRequest, type InvocationContext } from '@azure/functions';

type EmbeddingsFileHttpRequest = {
  filePath: string;
};

const embeddingsHttpInput = input.generic({
  input: '{filePath}',
  inputType: 'FilePath',
  type: 'embeddings',
  maxChunkLength: 512,
  model: '%AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME%',
});

app.http('embeddings-file', {
  methods: ['POST'],
  route: 'embeddings/file',
  authLevel: 'anonymous',
  extraInputs: [embeddingsHttpInput],
  async handler(request: HttpRequest, context: InvocationContext) {
    const { filePath } = (await request.json()) as EmbeddingsFileHttpRequest;
    const response: any = context.extraInputs.get(embeddingsHttpInput);

    context.log(`Received ${response.count} embedding(s) for input file ${filePath}.`);

    return {
      jsonBody: response.request.input.map((chunk: string, index: number) => ({
        text: chunk,
        embedding: response.response.data[index].embedding,
      })),
    };
  },
});
