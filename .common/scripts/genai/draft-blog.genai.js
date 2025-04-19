
script({
  model: "ollama:deepseek-r1:32b",
  group: "blog",
});

def("FILE", env.files, { glob: ["samples/*/src/**/*.ts", "samples/*/*.README.md"] })

$`## Role
You're a Principal Developer Advocate working at Microsoft, expert in AI.

## Instructions
Using the provided files as a reference, write a technical blog post that illustrate why Azure Functions extension for OpenAI is useful using the two provided samples for text and embeddings completion.

Use friendly, yet professional tone that's easy to read and understand.
The post should follow this structure:
- Title, intro (catch)
- TL;DR key takeaways (3-4 bullet points)
- What you'll learn here (3-4 bullet points)
- Reference links (most important content links)
- Requirements (accounts and tools you need to run the code)
- Getting started (how to run prepare for running the samples)
- 1 or more sections detailing what's demonstrated in the samples, how to run it with code excepts, what's interesting, how to deploy it on azure, configuration details...
- Going further (opening on what to learn next, with links)`;
