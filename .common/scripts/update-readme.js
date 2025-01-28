#!/usr/bin/env node
/*
 * Update sample table in README.md
 * Usage: update-readme.js
 */

import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const samplesDir = path.join(__dirname, '..', '..', 'samples');
const mainReadmePath = path.join(__dirname, '..', '..', 'README.md');
const tablePlaceholderStart = '<!-- #begin-samples -->';
const tablePlaceholderEnd = '<!-- #end-samples -->';

function getSampleInfo(sampleDir) {
  const readmePath = path.join(sampleDir, 'README.md');
  if (!fs.existsSync(readmePath)) return null;

  const readmeContent = fs.readFileSync(readmePath, 'utf-8');
  const nameMatch = readmeContent.match(/#\s+(.+)/);
  const descriptionMatch = readmeContent.match(/description:\s+(.+)/);
  const deploymentMatch = readmeContent.match(/Time%20to%20deploy-([^-]+)-teal/);
  const videoMatch = readmeContent.match(/\[📺\s+YouTube\]\((.+)\)/);
  const blogMatch = readmeContent.match(/\[📚\s+Azure Blog\]\((.+)\)/);

  if (!nameMatch) {
    const message = `Name not found in ${readmePath}`;
    console.error(message);
    process.exit(-1);
  }

  return {
    name: nameMatch ? nameMatch[1] : 'Unknown',
    description: descriptionMatch ? descriptionMatch[1] : '-',
    deployment: deploymentMatch ? deploymentMatch[1] : 'N/A',
    video: videoMatch ? `[📺](${videoMatch[1]})` : '-',
    blog: blogMatch ? `[📚](${blogMatch[1]})` : '-',
  };
}

function generateTable(samples) {
  const header = '| | Sample | Deployment Time | Video | Blog |\n| --- |:--- | --- | --- | --- |\n';
  const rows = samples.map(sample => 
    `| <img src="./samples/${sample.dir}/docs/images/icon.png" width="32px"/> | [${sample.name}](./samples/${sample.dir}) | ${sample.deployment} | ${sample.video} | ${sample.blog} |`
  ).join('\n');
  return header + rows;
}

function injectTableIntoReadme(table) {
  const readmeContent = fs.readFileSync(mainReadmePath, 'utf-8');
  const newContent = readmeContent.replace(
    new RegExp(`${tablePlaceholderStart}[\\s\\S]*${tablePlaceholderEnd}`),
    `${tablePlaceholderStart}\n\n${table}\n\n${tablePlaceholderEnd}`
  );
  fs.writeFileSync(mainReadmePath, newContent, 'utf-8');
}

function main() {
  const samples = fs.readdirSync(samplesDir).map(dir => {
    const sampleDir = path.join(samplesDir, dir);
    if (fs.lstatSync(sampleDir).isDirectory()) {
      const info = getSampleInfo(sampleDir);
      if (info) {
        return { dir, ...info };
      }
    }
    return null;
  }).filter(Boolean);

  const table = generateTable(samples);
  injectTableIntoReadme(table);

  console.log('README.md updated');
}

main();
