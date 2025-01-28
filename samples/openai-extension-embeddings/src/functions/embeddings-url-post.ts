import { app, input, HttpRequest, InvocationContext } from "@azure/functions";

interface EmbeddingsUrlHttpRequest {
  url?: string;
}

const embeddingsHttpInput = input.generic({
  input: "{url}",
  inputType: "Url",
  type: "embeddings",
  maxChunkLength: 512,
  model: "%AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME%",
});

app.http("embeddings-url", {
  methods: ["POST"],
  route: "embeddings/url",
  authLevel: "anonymous",
  extraInputs: [embeddingsHttpInput],
  handler: async (request: HttpRequest, context: InvocationContext) => {
    const { url } = await request.json() as EmbeddingsUrlHttpRequest;
    const response: any = context.extraInputs.get(embeddingsHttpInput);

    context.log(
      `Received ${response.count} embedding(s) for input URL ${url}.`
    );

    return {
      jsonBody: response.request.input.map((chunk, index) => ({
        text: chunk,
        embedding: response.response.data[index].embedding,
      }))
    };
  },
});
