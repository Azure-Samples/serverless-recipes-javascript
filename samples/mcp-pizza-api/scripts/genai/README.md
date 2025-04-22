# Generative AI helper scripts

The menu content for the pizza API was generated using Generative AI. The scripts in this folder uses GenAIScript (https://aka.ms/genaiscript) to create the JSON content for the pizzas, toppings and their associated images.

## Prerequisites
- [Node.js](https://nodejs.org/en/download/) (v20 or later)
- A Dall-E 3 deployment in Azure OpenAI Service or an OpenAI API key with Dall-E 3 access
- Access to any model capable of generating structured JSON content. The base content provided was generated using Azure OpenAI and `gpt-4o-` model.

### Model configuration

Create a `.env` file in this folder folder with the following content:

```bash
GENAISCRIPT_DEFAULT_MODEL="<provider>:<model>"
GENAISCRIPT_IMAGE_MODEL="<provider>:dall-e-3"
```

Depending on the provider, you may also require additional environment variables. You can find the required variables in the [GenAIScript documentation](https://microsoft.github.io/genaiscript/getting-started/configuration/).

The file [.env.example](.env.example) contains an example configuration for Azure OpenAI.

## Usage

1. Open a terminal and navigate to the `scripts/genai` folder.
2. Run the following command to generate the JSON content for the pizzas and toppings:

    ```bash
    npx -y genaiscript@latest run generate-pizzas
    ```

3. Once the script is completed, you can optionally run the following commands to generate images for the pizzas and toppings. Be warned that this may take a while, as it generates about ~40 images!

    ```bash
    npm i -D sharp
    npx -y genaiscript@latest run generate-images
    ```
