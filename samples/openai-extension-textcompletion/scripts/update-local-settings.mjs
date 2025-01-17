#!/usr/bin/env node
/*
 * Creates local.settings.json file for the Azure Functions.
 * Usage: update-local-settings.mjs
 */

import process from 'node:process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let settings = {
  FUNCTIONS_WORKER_RUNTIME: "node",
  AzureWebJobsFeatureFlags: "EnableWorkerIndexing",
  AzureWebJobsStorage: "UseDevelopmentStorage=true"
};
const settingsFilePath = join(__dirname, '../local.settings.json');
const servicesFilePath = join(__dirname, '../infra/services.json');

let services = {};
if (existsSync(servicesFilePath)) {
  services = JSON.parse(readFileSync(servicesFilePath, 'utf-8'));
}

if (services.useOpenAi) {
  console.log('Setting OpenAI service values...');
  settings = {
    ...settings,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_CHAT_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT_NAME,
    AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME,
  };
}

writeFileSync(settingsFilePath, JSON.stringify({
  IsEncrypted: false,
  Values: settings
}, null, 2));
console.log('local.settings.json file updated successfully.');
