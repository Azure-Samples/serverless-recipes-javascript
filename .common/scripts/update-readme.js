#!/usr/bin/env node
/*
 * Update sample table in README.md
 * Usage: update-readme.js
 */

import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dir } from 'node:console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const samplesDir = path.join(__dirname, '..', '..', 'samples');
const mainReadmePath = path.join(__dirname, '..', '..', 'README.md');
const tablePlaceholderStart = '<!-- #begin-samples -->';
const tablePlaceholderEnd = '<!-- #end-samples -->';

function getSampleInfo(sampleDir) {
  const readmePath = path.join(sampleDir, 'README.md');
  if (!fs.existsSync(readmePath)) return null;

  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  const nameMatch = readmeContent.match(/^name:\s+(.+)/m);
  const descriptionMatch = readmeContent.match(/^description:\s+(.+)/m);
  const deploymentMatch = readmeContent.match(/Time%20to%20deploy-([^-]+)-teal/);
  const videoMatch = readmeContent.match(/\[📺\s+YouTube]\((.+)\)/);
  const blogMatch = readmeContent.match(/\[📚\s+Azure Blog]\((.+)\)/);

  if (!nameMatch) {
    const message = `Name not found in ${readmePath}`;
    console.error(message);
    process.exit(-1);
  }

  return {
    name: nameMatch ? nameMatch[1] : 'TODO',
    description: descriptionMatch ? descriptionMatch[1] : '-',
    deployment: deploymentMatch ? deploymentMatch[1] : 'N/A',
    video: videoMatch && videoMatch[1] !== 'TODO' ? `[📺](${videoMatch[1]})` : '-',
    blog: blogMatch && blogMatch[1] !== 'TODO' ? `[📚](${blogMatch[1]})` : '-',
  };
}

function generateTable(samples) {
  const header = '| | Sample | Deployment Time | Video | Blog |\n| --- |:--- | --- | --- | --- |\n';
  const rows = samples
    .filter((sample) => sample.name && sample.name !== 'TODO')
    .map(
      (sample) =>
        `| <img src="./samples/${sample.directory}/docs/images/icon.png" width="32px"/> | [${sample.name}](./samples/${sample.directory}) | ${sample.deployment} | ${sample.video} | ${sample.blog} |`,
    )
    .join('\n');
  return header + rows;
}

function injectTableIntoReadme(table) {
  const readmeContent = fs.readFileSync(mainReadmePath, 'utf8');
  const newContent = readmeContent.replace(
    new RegExp(`${tablePlaceholderStart}[\\s\\S]*${tablePlaceholderEnd}`),
    `${tablePlaceholderStart}\n\n${table}\n\n${tablePlaceholderEnd}`,
  );
  fs.writeFileSync(mainReadmePath, newContent, 'utf8');
}

function main() {
  const samples = fs
    .readdirSync(samplesDir)
    .map((directory) => {
      const sampleDir = path.join(samplesDir, directory);
      if (fs.lstatSync(sampleDir).isDirectory()) {
        const info = getSampleInfo(sampleDir);
        if (info) {
          return { directory, ...info };
        }
      }

      return null;
    })
    .filter(Boolean);

  const table = generateTable(samples);
  injectTableIntoReadme(table);

  console.log('README.md updated');
}

main();
