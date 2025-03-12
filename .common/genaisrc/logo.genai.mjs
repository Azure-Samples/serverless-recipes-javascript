script({
  model: "none",
  group: "samples",
});

if (!env.vars.question) {
  throw new Error("Please provide 2-3 keywords to use in the logo.");
}

const genLogo = () => generateImage(
  `A logo for a software on ${env.vars.question}. Simple, vector, soft gradients, bright colors, flat, white background.`,
  { model: "azure:dall-e-3" }
);

const results = await Promise.all([ genLogo(), genLogo(), genLogo()]);

env.output.appendContent(
  `Here are 3 ideas for your logo:
  ${results.map((r, i) => `[![logo ${i+1}](${r.image.filename})](${r.image.filename})`).join(" ")}`
);
