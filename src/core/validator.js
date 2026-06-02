/**
 * Environment variable validation engine
 */

const validators = {
  string: (value) => typeof value === 'string',

  number: (value, rule) => {
    const num = Number(value);
    if (isNaN(num)) return { valid: false, error: `"${value}" is not a valid number` };
    if (rule.min !== undefined && num < rule.min) {
      return { valid: false, error: `${num} is less than minimum ${rule.min}` };
    }
    if (rule.max !== undefined && num > rule.max) {
      return { valid: false, error: `${num} exceeds maximum ${rule.max}` };
    }
    return { valid: true };
  },

  boolean: (value) => {
    const lower = String(value).toLowerCase();
    if (['true', 'false', '1', '0', 'yes', 'no'].includes(lower)) {
      return { valid: true };
    }
    return { valid: false, error: `"${value}" is not a valid boolean (true/false, 1/0, yes/no)` };
  },

  url: (value) => {
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, error: `"${value}" is not a valid URL` };
    }
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value)
      ? { valid: true }
      : { valid: false, error: `"${value}" is not a valid email address` };
  },

  json: (value) => {
    try {
      JSON.parse(value);
      return { valid: true };
    } catch {
      return { valid: false, error: `"${value}" is not valid JSON` };
    }
  },

  regex: (value) => {
    try {
      new RegExp(value);
      return { valid: true };
    } catch {
      return { valid: false, error: `"${value}" is not a valid regex pattern` };
    }
  },

  port: (value) => {
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 65535) {
      return { valid: false, error: `"${value}" is not a valid port (0-65535)` };
    }
    return { valid: true };
  },
};

function validateValue(value, rule) {
  const type = rule.type || 'string';
  const validator = validators[type];

  if (!validator) {
    return { valid: false, error: `Unknown type: ${type}` };
  }

  const result = validator(value, rule);

  // Validator can return boolean or { valid, error }
  if (typeof result === 'boolean') {
    return { valid: result, error: result ? undefined : `Value does not match type "${type}"` };
  }
  return result;
}

function validateEnv(envObj, schema) {
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    checked: 0,
  };

  for (const [key, rule] of Object.entries(schema)) {
    results.checked++;
    const value = envObj[key];

    // Check required
    if (value === undefined || value === '') {
      if (rule.required) {
        results.valid = false;
        results.errors.push({
          key,
          type: 'missing',
          message: `Required variable "${key}" is not set`,
        });
      } else if (rule.default !== undefined) {
        // Will use default, just note it
        results.warnings.push({
          key,
          type: 'default_used',
          message: `Variable "${key}" not set, will use default: ${rule.default}`,
        });
      }
      continue;
    }

    // Check type
    const typeResult = validateValue(value, rule);
    if (!typeResult.valid) {
      results.valid = false;
      results.errors.push({
        key,
        type: 'type_mismatch',
        message: `Variable "${key}": ${typeResult.error}`,
      });
      continue;
    }

    // Check enum
    if (rule.enum && !rule.enum.includes(value)) {
      results.valid = false;
      results.errors.push({
        key,
        type: 'enum_mismatch',
        message: `Variable "${key}": value "${value}" is not one of: ${rule.enum.join(', ')}`,
      });
      continue;
    }

    // Check pattern
    if (rule.pattern) {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(value)) {
        results.valid = false;
        results.errors.push({
          key,
          type: 'pattern_mismatch',
          message: `Variable "${key}": value does not match pattern /${rule.pattern}/`,
        });
        continue;
      }
    }

    // Check deprecation
    if (rule.deprecated) {
      results.warnings.push({
        key,
        type: 'deprecated',
        message: `Variable "${key}" is deprecated${rule.replacement ? `, use "${rule.replacement}" instead` : ''}`,
      });
    }
  }

  return results;
}

module.exports = { validateEnv, validateValue, validators };
