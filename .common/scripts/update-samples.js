#!/usr/bin/env node
/*
 * Automated update of one or all samples.
 * If no sample name is provided, all samples will be updated. 
 * Usage: update-sample.js [sample-name]
 */

import process from 'node:process';
import path from 'node:path';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..', '..');
const sampleDir = path.join(rootDir, 'samples');
const templatesDir = path.join(__dirname, '..', 'templates');
const infraDir = path.join(__dirname, '..', 'infra');
const referencePackageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json')));
const dependencies = new Map([
  ...Object.entries(referencePackageJson.dependencies),
  ...Object.entries(referencePackageJson.devDependencies)
]);

const filesToUpdate = [
  'tsconfig.json',
  'update-local-settings.mjs'
];

function listSamples() {
  return readdirSync(sampleDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function updateInfra(samplePath) {
  const sampleInfraPath = path.join(samplePath, 'infra');

  if (!existsSync(sampleInfraPath)) {
    mkdirSync(sampleInfraPath, { recursive: true });
  }

  for (const file of readdirSync(infraDir)) {
    const sourceFile = path.join(infraDir, file);
    const destinationFile = path.join(sampleInfraPath, file);

    if (file !== 'services.json') {
      writeFileSync(destinationFile, readFileSync(sourceFile));
    }
  }
}

function updateDependenciesVersions(samplePath) {
  const packageJsonPath = path.join(samplePath, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath));
  let changes = 0;

  const updatePackageSection = (section) => {
    for (const packageName of Object.keys(section || {})) {
      const version = dependencies.get(packageName);
      if (version && section[packageName] !== version) {
        section[packageName] = dependencies.get(packageName);
        changes++;
      }
    }
  }

  updatePackageSection(packageJson.dependencies);
  updatePackageSection(packageJson.devDependencies);

  if (changes > 0) {
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated ${changes} dependencies`);
    console.log('Running `npm install`...');
    execSync('npm install', { cwd: samplePath, stdio: 'inherit' });
  } else {
    console.log('Running `npm update`...');
    execSync('npm update', { cwd: samplePath, stdio: 'inherit' });
  }
}

function lintAndFormat(samplePath) {
  console.log('Running `npm run lint:fix`...');
  execSync(`npm run lint:fix -- "${samplePath}"`, { cwd: rootDir, stdio: 'inherit' });
}

function main() {
  if (process.argv.length > 3) {
    console.log('Usage: node update-sample.js [sample-name]');
    process.exit(1);
  }

  const samples = process.argv.length === 3 ? [process.argv[2]] : listSamples();
  for (const sample of samples) {
    console.log(`Updating sample "${sample}"...`);
    const samplePath = path.join(sampleDir, sample);
    updateInfra(samplePath);
    updateDependenciesVersions(samplePath);
    lintAndFormat(samplePath);
  }

  console.log(`Updated ${samples.length} samples.`);
}

main();

// TODO:
// update files from common or template name
