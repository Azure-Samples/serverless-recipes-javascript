#!/usr/bin/env node
/*
 * Creates a new sample from the template.
 * Usage: create-sample.js <sample-name>
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv.length < 3) {
  console.error('Usage: node create-sample.js <name>');
  process.exit(1);
}

const sampleName = process.argv[2];
const templateDir = join(__dirname, '..', 'templates/functions');
const destinationDir = join(__dirname, '..', '..', 'samples', sampleName);

if (/\s/.test(sampleName) || /[A-Z]/.test(sampleName)) {
  console.error('Sample name must be in dash-case (e.g. my-sample)');
  process.exit(1);
}

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
