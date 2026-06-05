/**
 * envguard redact — redact sensitive values in .env files or log output
 */

const fs = require('fs');
const path = require('path');
const { printHeader, colorize } = require('../utils/format');
const { loadEnvFile } = require('../utils/file');
const { redactObject, redactString } = require('../core/redact');

function runRedact(options = {}) {
  const cwd = options.cwd || process.cwd();

  printHeader('EnvGuard — Redact');

  const envPath = options.envFile || path.join(cwd, '.env');
  const mask = options.mask || '***';

  // Mode 1: redact .env file values
  if (!options.text) {
    const envObj = loadEnvFile(envPath);

    if (Object.keys(envObj).length === 0) {
      console.log(colorize(`No variables found in ${envPath}`, 'yellow'));
      return;
    }

    const ignoreKeys = options.ignoreKeys
      ? options.ignoreKeys.split(',').map((k) => k.trim())
      : [];

    const redacted = redactObject(envObj, { mask, ignoreKeys });

    console.log(colorize(`Redacted ${Object.keys(envObj).length} variable(s) from ${envPath}`, 'cyan'));
    console.log('');

    for (const [key, value] of Object.entries(redacted)) {
      const isRedacted = value === mask;
      const marker = isRedacted ? colorize('🔴 REDACTED', 'red') : colorize('🟢 CLEAR', 'green');
      console.log(`  ${marker}  ${key}=${value}`);
    }

    // Write redacted file if --output is specified
    if (options.output) {
      const outputPath = path.resolve(options.output);
      const lines = Object.entries(redacted).map(([k, v]) => `${k}=${v}`);
      fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf-8');
      console.log('');
      console.log(colorize(`✓ Redacted file written to ${outputPath}`, 'green'));
    }

    const redactedCount = Object.entries(redacted).filter(([_, v]) => v === mask).length;
    console.log('');
    console.log(`📊 Summary: ${redactedCount} redacted, ${Object.keys(envObj).length - redactedCount} clear`);
  } else {
    // Mode 2: redact a text string
    const knownValues = [];
    const envObj = loadEnvFile(envPath);

    // Collect actual sensitive values from .env for targeted redaction
    for (const [key, value] of Object.entries(envObj)) {
      if (value && value.length > 2) {
        knownValues.push(value);
      }
    }

    const redactedText = redactString(options.text, { mask, knownValues });
    console.log(redactedText);
  }
}

module.exports = { runRedact };