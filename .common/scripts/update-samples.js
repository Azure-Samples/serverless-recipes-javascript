#!/usr/bin/env node
/*
 * Updates common parts of samples.
 * Usage: update-sample.js [sample-name]
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sampleDir = join(__dirname, '..', '..', 'samples');
const infraDir = join(__dirname, '..', 'infra');

// Update samples infrastructure
readdirSync(sampleDir, { withFileTypes: true }).forEach(dirent => {
  if (dirent.isDirectory()) {
    const samplePath = join(sampleDir, dirent.name);
    const sampleInfraPath = join(samplePath, 'infra');

    if (!existsSync(sampleInfraPath)) {
      mkdirSync(sampleInfraPath, { recursive: true });
    }

    readdirSync(infraDir).forEach(file => {
      const srcFile = join(infraDir, file);
      const destFile = join(sampleInfraPath, file);

      if (file !== 'services.json') {
        writeFileSync(destFile, readFileSync(srcFile));
      }
    });
  }
});

// TODO:
// - copy .editorconfig
// - update package.json
// - run `npm update` in each sample

// - run prettier (xo linter?) in each sample