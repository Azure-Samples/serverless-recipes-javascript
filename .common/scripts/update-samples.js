#!/usr/bin/env node
/*
 * Updates common parts of samples.
 * Usage: update-sample.js [sample-name]
 */

import path from 'node:path';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleDir = path.join(__dirname, '..', '..', 'samples');
const infraDir = path.join(__dirname, '..', 'infra');

// Update samples infrastructure
for (const dirent of readdirSync(sampleDir, { withFileTypes: true })) {
  if (dirent.isDirectory()) {
    const samplePath = path.join(sampleDir, dirent.name);
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
}

// TODO:
// - copy .editorconfig
// - update package.json
// - run `npm update` in each sample

// - run prettier (xo linter?) in each sample
