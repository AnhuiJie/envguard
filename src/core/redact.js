/**
 * Log redaction — automatically redact sensitive values in log output
 */

// Patterns that match sensitive key names
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /passwd/i,
  /pwd$/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /auth/i,
  /credential/i,
  /private[_-]?key/i,
  /access[_-]?key/i,
  /database[_-]?url/i,
  /connection[_-]?string/i,
  /stripe/i,
  /aws[_-]?secret/i,
  /jwt/i,
];

// Default redaction placeholder
const DEFAULT_MASK = '***';

/**
 * Redact sensitive values from a key-value object
 * @param {Object} obj - Key-value pairs (e.g. process.env, parsed .env)
 * @param {Object} options
 * @param {string[]} options.ignoreKeys - Keys to skip redaction
 * @param {string} options.mask - Replacement string (default: '***')
 * @param {Function} options.customDetector - Custom function to detect sensitive keys
 * @returns {Object} Redacted copy of the object
 */
function redactObject(obj, options = {}) {
  const mask = options.mask || DEFAULT_MASK;
  const ignoreKeys = new Set(options.ignoreKeys || []);
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (ignoreKeys.has(key)) {
      result[key] = value;
      continue;
    }

    if (isSensitiveKey(key, options.customDetector)) {
      result[key] = mask;
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Redact sensitive values in a string (e.g. log message)
 * Detects patterns like key=value, key: value, "key": "value"
 * @param {string} text - Text to redact
 * @param {Object} options
 * @param {string[]} options.knownValues - Specific values to redact (e.g. actual secret strings)
 * @param {string} options.mask - Replacement string (default: '***')
 * @returns {string} Redacted string
 */
function redactString(text, options = {}) {
  const mask = options.mask || DEFAULT_MASK;
  let result = text;

  // Redact known sensitive values first (highest priority)
  if (options.knownValues && Array.isArray(options.knownValues)) {
    for (const val of options.knownValues) {
      if (val && val.length > 2) {
        result = result.split(val).join(mask);
      }
    }
  }

  // Redact key=value patterns for sensitive keys
  // Matches: KEY=VALUE, KEY: VALUE, "KEY": "VALUE", KEY:VALUE
  const kvPatterns = [
    // KEY=VALUE (shell/env style) — matches keys ending with or containing sensitive words
    /\b([A-Z_][A-Z0-9_]*(?:PASSWORD|PASSWD|SECRET|TOKEN|API_KEY|API_SECRET|ACCESS_KEY|PRIVATE_KEY|CREDENTIAL|AUTH|STRIPE|AWS_SECRET|JWT)[A-Z0-9_]*|[A-Z_]*(?:PASSWORD|PASSWD|SECRET|TOKEN|API_KEY|API_SECRET|ACCESS_KEY|PRIVATE_KEY|CREDENTIAL|AUTH|STRIPE|AWS_SECRET|JWT))\s*=\s*[^\s"']+/gi,
    // KEY: VALUE or "KEY": "VALUE" (JSON/YAML style)
    /\b([A-Za-z_][A-Za-z0-9_]*(?:password|passwd|secret|token|api_key|api_secret|access_key|private_key|credential|auth|stripe|aws_secret|jwt)[A-Za-z0-9_]*|[A-Za-z_]*(?:password|passwd|secret|token|api_key|api_secret|access_key|private_key|credential|auth|stripe|aws_secret|jwt))\s*[:=]\s*["']?[^"'\s,}]+["']?/gi,
  ];

  for (const pattern of kvPatterns) {
    result = result.replace(pattern, (match, key) => {
      const separator = match.includes('=') ? '=' : ':';
      return `${key}${separator}${mask}`;
    });
  }

  // Redact database connection strings with embedded passwords
  result = result.replace(
    /(mysql|postgres|postgresql|mongodb|redis):\/\/[^:\s]+:[^@\s]+@/gi,
    (match, protocol) => `${protocol}://***:***@`
  );

  // Redact AWS access keys
  result = result.replace(/AKIA[0-9A-Z]{16}/g, mask);

  // Redact GitHub tokens
  result = result.replace(/gh[ps]_[A-Za-z0-9_]{36,}/g, mask);

  // Redact private key blocks
  result = result.replace(
    /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA )?PRIVATE KEY-----/g,
    `-----REDACTED PRIVATE KEY-----`
  );

  return result;
}

/**
 * Check if a key name suggests it contains sensitive data
 */
function isSensitiveKey(key, customDetector) {
  if (customDetector && typeof customDetector === 'function') {
    if (customDetector(key)) return true;
  }
  return SENSITIVE_KEY_PATTERNS.some((p) => p.test(key));
}

/**
 * Create a redaction middleware for logging libraries
 * Returns a function that can be used as a log formatter
 * @param {Object} options
 * @returns {Function} Middleware function
 */
function createRedactionMiddleware(options = {}) {
  return (logEntry) => {
    if (typeof logEntry === 'string') {
      return redactString(logEntry, options);
    }
    if (typeof logEntry === 'object' && logEntry !== null) {
      return redactObject(logEntry, options);
    }
    return logEntry;
  };
}

module.exports = {
  redactObject,
  redactString,
  isSensitiveKey,
  createRedactionMiddleware,
  SENSITIVE_KEY_PATTERNS,
};
