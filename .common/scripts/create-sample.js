#!/usr/bin/env node
/*
 * Creates a new sample from the template.
 * Usage: create-sample.js <sample-name> [--template <template-name>]
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesDir = join(__dirname, '..', 'templates');

function listTemplates() {
  const availableTemplates = readdirSync(templatesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  console.error('Available templates:');
  availableTemplates.forEach(template => console.error(`- ${template}`));
}

if (process.argv.length < 3) {
  console.error('Usage: node create-sample.js <name> [--template <template-name>]');
  listTemplates();
  process.exit(1);
}

const args = process.argv.slice(2);
let templateName = 'functions';
let sampleName;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--template' || args[i] === '-t') {
    templateName = args[i + 1] || templateName;
    i++;
  } else {
    sampleName = args[i];
  }
}

const templateDir = join(templatesDir, templateName);
if (!existsSync(templateDir)) {
  console.error(`Template "${templateName}" does not exist.`);
  listTemplates();
  process.exit(1);
}

if (/\s/.test(sampleName) || /[A-Z]/.test(sampleName)) {
  console.error('Sample name must be in dash-case (e.g. my-sample)');
  process.exit(1);
}

const destinationDir = join(__dirname, '..', '..', 'samples', sampleName);
if (!existsSync(destinationDir)) {
  mkdirSync(destinationDir, { recursive: true });
}

function copyDirectory(src, dest) {
  const entries = readdirSync(src, { withFileTypes: true });

  entries.forEach(entry => {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!existsSync(destPath)) {
        mkdirSync(destPath);
      }
      copyDirectory(srcPath, destPath);
    } else {
      const content = readFileSync(srcPath, 'utf8').replace(/__SAMPLE_NAME__/g, sampleName);
      writeFileSync(destPath, content, 'utf8');
    }
  });
};

copyDirectory(templateDir, destinationDir);

console.log(`Sample '${sampleName}' created successfully in ${destinationDir}`);
