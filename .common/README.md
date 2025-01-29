# Base templates and tools for all samples

This directory contains the base templates and tools that are used to simplify the creation and maintenance of all samples.
Before running any of the scripts, make sure to open the `.common` directory and install the dependencies by running the following command:

```bash
cd .common
npm install
```

## Create a new sample

To create a new sample, run the following command:

```
npm run create:sample -- <sample-name> [--template <template-name>]
```

Or if you're on Linux or MacOS:

```
./scripts/create-sample.js <sample-name> [--template <template-name>]
```

If you don't specify a template, the default template `functions` will be used. Run the command without any arguments to see the available templates.

The new sample will be created under the `samples/<sample-name>` directory.
You'll find a `TODO` file in the sample directory that contains the steps you need to follow to complete your new sample. Make sure to read through it and follow the instructions, as it contains important steps to ensure your new sample will work with the automated maintenance scripts.

### Files that should not be modified

The following files are automatically overwritten by the maintenance scripts and should not be modified:

- Everything in the `infra` folder except for the `services.json` file
- `scripts/update-local-settings.js`
- `tsconfig.json`

## Maintenance

To simplify this repository's maintenance, we have a few scripts that help us keep everything aligned and up to date.

### Update dependencies


### Update samples


### Update readme



