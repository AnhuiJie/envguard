/**
 * Schema definition and parsing for envguard.config.js
 */

const SUPPORTED_TYPES = ['string', 'number', 'boolean', 'url', 'email', 'json', 'regex', 'port'];

function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be a non-empty object');
  }

  const errors = [];

  for (const [key, rule] of Object.entries(schema)) {
    if (!rule || typeof rule !== 'object') {
      errors.push(`Variable "${key}": rule must be an object`);
      continue;
    }

    if (rule.type && !SUPPORTED_TYPES.includes(rule.type)) {
      errors.push(`Variable "${key}": unsupported type "${rule.type}". Supported: ${SUPPORTED_TYPES.join(', ')}`);
    }

    if (rule.type === 'number' && rule.min !== undefined && rule.max !== undefined && rule.min > rule.max) {
      errors.push(`Variable "${key}": min (${rule.min}) cannot be greater than max (${rule.max})`);
    }

    if (rule.enum && !Array.isArray(rule.enum)) {
      errors.push(`Variable "${key}": enum must be an array`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Schema validation failed:\n  ${errors.join('\n  ')}`);
  }

  return true;
}

function parseSchema(configPath) {
  try {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    // Clear require cache for fresh reload
    delete require.cache[require.resolve(path.resolve(configPath))];

    const config = require(path.resolve(configPath));

    if (!config.schema && !config.env) {
      throw new Error('Config must export a "schema" or "env" object');
    }

    const schema = config.schema || config.env;
    validateSchema(schema);

    return {
      schema,
      security: config.security || {},
      docs: config.docs || {},
    };
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new Error(`Cannot load config: ${err.message}`);
    }
    throw err;
  }
}

module.exports = { validateSchema, parseSchema, SUPPORTED_TYPES };
