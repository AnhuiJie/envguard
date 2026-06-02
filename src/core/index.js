/**
 * EnvGuard core module — unified API
 */

const { parseSchema, validateSchema } = require('./schema');
const { validateEnv } = require('./validator');
const { scanForSecrets } = require('./security');
const { generateEnvExample, generateMarkdownDoc, writeDocs } = require('./docs');
const { parseEnvFile, diffEnvs, formatDiffResult } = require('./diff');

module.exports = {
  parseSchema,
  validateSchema,
  validateEnv,
  scanForSecrets,
  generateEnvExample,
  generateMarkdownDoc,
  writeDocs,
  parseEnvFile,
  diffEnvs,
  formatDiffResult,
};
