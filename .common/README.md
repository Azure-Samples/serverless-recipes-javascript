# Base templates and tools for all samples

This directory contains the base templates and tools that are used to simplify the creation and maintenance of all samples.
Before running any of the scripts, install the dependencies by running the following command:

```bash
npm install
```

## Create a new sample

To create a new sample, run the following command:

```
npm run create:sample -- <sample-name> [--template <template-name>]
```

If you don't specify a template, the default template `functions` will be used. Run the command without any arguments to see the available templates.

The new sample will be created under the `samples/<sample-name>` directory.
You'll find a `TODO` file in the sample directory that contains the steps you need to follow to complete your new sample. Make sure to read through it and follow the instructions, as it contains important steps to ensure your new sample will work with the automated maintenance scripts.

### Files that should not be modified

The following files are automatically overwritten by the maintenance scripts and should not be modified:

- Everything in the `infra` folder except for the `services.json` file
- `scripts/update-local-settings.mjs`
- `tsconfig.json`

### GitHub repository logo

Use https://m365.cloud.microsoft/chat Visual Designer agent.

Example prompt, adapt the context to your sample:
```
A logo for a software on lightning, extensibility and magic. Simple, vector, soft gradients, bright colors, flat, white background.
```

## Maintenance

To simplify this repository's maintenance, we have a few scripts that help us keep everything aligned and up to date.

### Update dependencies


### Update samples

You can update one or all samples by running the following command:

```
npm run update:samples [--sample <sample-name>]
```

If you don't specify a sample, all samples will be updated.

This process will do the following for each sample:
- Update `infra` files based on `.common/infra` (excluding `services.json`)
- Update dependencies using root `package.json` dependencies versions as reference, then run `npm install` if needed
- Run `npm update` in the sample directory
- Update `scripts/update-local-settings.mjs` based on `.common/scripts/update-local-settings.mjs`
- Update `tsconfig.json` file(s) using its original template as reference
- Lint and format the code using the autofix option, based on the root linter config (see `package.json`, `xo` section)

### Update readme

After you created a new sample or renamed an existing one, you need to update the root `README.md` file to reflect the changes, by running the following command:

```
npm run update:readme
```
