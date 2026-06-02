/**
 * envguard validate — validate environment variables against schema
 */

const { validateEnv } = require('../core/validator');
const { parseSchema } = require('../core/schema');
const { formatError, formatWarning, formatSuccess, printHeader, printSummary } = require('../utils/format');
const { findConfigFile, loadEnvFile } = require('../utils/file');
const path = require('path');

function runValidate(options = {}) {
  const cwd = options.cwd || process.cwd();

  printHeader('EnvGuard — Validate');

  // Find config
  const configPath = options.config || findConfigFile(cwd);
  if (!configPath) {
    console.error('No envguard.config.js found. Run "envguard init" to create one.');
    process.exit(1);
  }

  console.log(`Using config: ${path.relative(cwd, configPath)}`);

  // Parse schema
  let config;
  try {
    config = parseSchema(configPath);
  } catch (err) {
    console.error(`Config error: ${err.message}`);
    process.exit(1);
  }

  // Load env values
  let envObj;
  if (options.envFile) {
    envObj = loadEnvFile(path.resolve(cwd, options.envFile));
  } else {
    // Merge process.env with .env file
    envObj = { ...loadEnvFile(path.join(cwd, '.env')), ...process.env };
  }

  // Validate
  const results = validateEnv(envObj, config.schema);

  // Print results
  for (const error of results.errors) {
    console.log(formatError(error));
  }
  for (const warning of results.warnings) {
    console.log(formatWarning(warning));
  }

  // Print checked variables that passed
  const errorKeys = new Set(results.errors.map((e) => e.key));
  const warningKeys = new Set(results.warnings.map((w) => w.key));
  for (const key of Object.keys(config.schema)) {
    if (!errorKeys.has(key) && !warningKeys.has(key)) {
      console.log(formatSuccess(key));
    }
  }

  printSummary(results);

  if (!results.valid && !options.allowFailure) {
    process.exit(1);
  }

  return results;
}

module.exports = { runValidate };
