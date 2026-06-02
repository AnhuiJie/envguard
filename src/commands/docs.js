/**
 * envguard docs — generate .env.example and documentation
 */

const { parseSchema } = require('../core/schema');
const { writeDocs } = require('../core/docs');
const { findConfigFile } = require('../utils/file');
const { printHeader, colorize } = require('../utils/format');
const path = require('path');

function runDocs(options = {}) {
  const cwd = options.cwd || process.cwd();

  printHeader('EnvGuard — Generate Docs');

  // Find config
  const configPath = options.config || findConfigFile(cwd);
  if (!configPath) {
    console.error('No envguard.config.js found. Run "envguard init" to create one.');
    process.exit(1);
  }

  // Parse schema
  let config;
  try {
    config = parseSchema(configPath);
  } catch (err) {
    console.error(`Config error: ${err.message}`);
    process.exit(1);
  }

  // Generate docs
  const outputDir = options.output || cwd;
  const projectName = options.projectName || path.basename(cwd);

  const result = writeDocs(config.schema, outputDir, { projectName });

  console.log(colorize(`✓ Generated: ${path.relative(cwd, result.examplePath)}`, 'green'));
  console.log(colorize(`✓ Generated: ${path.relative(cwd, result.mdPath)}`, 'green'));
  console.log('');

  return result;
}

module.exports = { runDocs };
