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

  // Date type: validates ISO 8601 date strings (YYYY-MM-DD or full ISO format)
  date: (value) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;
    if (!dateRegex.test(value)) {
      return { valid: false, error: `"${value}" is not a valid date (expected ISO 8601 format, e.g. 2024-01-15)` };
    }
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      return { valid: false, error: `"${value}" is not a valid date` };
    }
    return { valid: true };
  },

  // Semver type: validates semantic version strings (e.g. 1.2.3, 1.0.0-beta.1)
  semver: (value) => {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?(\+[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/;
    return semverRegex.test(value)
      ? { valid: true }
      : { valid: false, error: `"${value}" is not a valid semver (expected format: X.Y.Z, e.g. 1.2.3)` };
  },

  // Color type: validates CSS color values (hex, rgb, rgba, hsl, named colors)
  color: (value) => {
    const str = String(value).trim();
    // Hex: #RGB, #RRGGBB, #RRGGBBAA
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(str)) {
      return { valid: true };
    }
    // rgb/rgba
    if (/^rgba?\(\s*\d+(\.\d+)?%?\s*(,\s*\d+(\.\d+)?%?\s*){2,3}\)$/.test(str)) {
      return { valid: true };
    }
    // hsl/hsla
    if (/^hsla?\(\s*\d+(\.\d+)?(deg)?\s*(,\s*\d+(\.\d+)?%?\s*){2,3}\)$/.test(str)) {
      return { valid: true };
    }
    // Named CSS colors
    const namedColors = [
      'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
      'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
      'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue',
      'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
      'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon',
      'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise',
      'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick',
      'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod',
      'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo',
      'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
      'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey',
      'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
      'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta',
      'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
      'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
      'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite',
      'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
      'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink',
      'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue',
      'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver',
      'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
      'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke',
      'yellow', 'yellowgreen',
    ];
    if (namedColors.includes(str.toLowerCase())) {
      return { valid: true };
    }
    return { valid: false, error: `"${value}" is not a valid color (expected hex, rgb, hsl, or named CSS color)` };
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
