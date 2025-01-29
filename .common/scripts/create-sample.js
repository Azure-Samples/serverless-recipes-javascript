#!/usr/bin/env node
/*
 * Creates a new sample from the template.
 * Usage: create-sample.js <sample-name> [--template <template-name>]
 */

import process from 'node:process';
import path from 'node:path';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.join(__dirname, '..', 'templates');
const infraDir = path.join(__dirname, '..', 'infra');

function listTemplates() {
  const availableTemplates = readdirSync(templatesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  console.error('Available templates:');
  for (const template of availableTemplates) console.error(`- ${template}`);
}

function copyDirectory(source, destination, sampleName) {
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  const entries = readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      if (!existsSync(destinationPath)) {
        mkdirSync(destinationPath);
      }

      copyDirectory(sourcePath, destinationPath);
    } else {
      const content = readFileSync(sourcePath, 'utf8').replaceAll('__SAMPLE_NAME__', sampleName);
      writeFileSync(destinationPath, content, 'utf8');
    }
  }
}

function main() {
  if (process.argv.length < 3) {
    console.error('Usage: node create-sample.js <name> [--template <template-name>]');
    listTemplates();
    process.exit(1);
  }

  const arguments_ = process.argv.slice(2);
  let templateName = 'functions';
  let sampleName;

  for (let index = 0; index < arguments_.length; index++) {
    if (arguments_[index] === '--template' || arguments_[index] === '-t') {
      templateName = arguments_[index + 1] || templateName;
      index++;
    } else {
      sampleName = arguments_[index];
    }
  }

  const templateDir = path.join(templatesDir, templateName);
  if (!existsSync(templateDir)) {
    console.error(`Template "${templateName}" does not exist.`);
    listTemplates();
    process.exit(1);
  }

  if (/\s/.test(sampleName) || /[A-Z]/.test(sampleName)) {
    console.error('Sample name must be in dash-case (e.g. my-sample)');
    process.exit(1);
  }

  const commonTemplateDir = path.join(templatesDir, 'common');
  const destinationDir = path.join(__dirname, '..', '..', 'samples', sampleName);

  copyDirectory(commonTemplateDir, destinationDir, sampleName);
  copyDirectory(templateDir, destinationDir, sampleName);
  copyDirectory(infraDir, path.join(destinationDir, 'infra'), sampleName);

  console.log(`Sample '${sampleName}' created successfully in ${destinationDir}`);
}

main();
