/**
 * Sensitive information detection in environment variables
 */

// Patterns for detecting secrets and sensitive data
const SECRET_PATTERNS = [
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/,
    severity: 'critical',
  },
  {
    name: 'AWS Secret Key',
    pattern: /aws(.{0,20})?(secret|key).{0,20}[A-Za-z0-9/+=]{40}/i,
    severity: 'critical',
  },
  {
    name: 'GitHub Token',
    pattern: /gh[ps]_[A-Za-z0-9_]{36,}/,
    severity: 'critical',
  },
  {
    name: 'GitLab Token',
    pattern: /glpat-[A-Za-z0-9\-]{20}/,
    severity: 'critical',
  },
  {
    name: 'Slack Token',
    pattern: /xox[baprs]-[0-9]{10,}-[A-Za-z0-9]+/,
    severity: 'critical',
  },
  {
    name: 'Stripe Key',
    pattern: /sk_live_[A-Za-z0-9]{24,}/,
    severity: 'critical',
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/,
    severity: 'critical',
  },
  {
    name: 'JWT Secret',
    pattern: /jwt(.{0,20})?(secret|key).{0,20}[A-Za-z0-9\-._~+/]+=*/i,
    severity: 'high',
  },
  {
    name: 'Database URL with Password',
    pattern: /(mysql|postgres|mongodb|redis):\/\/[^\s:]+:[^\s@]+@[^\s]+/i,
    severity: 'high',
  },
  {
    name: 'Generic API Key',
    pattern: /(api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*['"]?[A-Za-z0-9\-._]{20,}['"]?/i,
    severity: 'high',
  },
  {
    name: 'Generic Password',
    pattern: /(password|passwd|pwd)\s*[=:]\s*['"]?[^\s'"]{8,}['"]?/i,
    severity: 'high',
  },
  {
    name: 'Generic Secret',
    pattern: /(secret|token|auth)\s*[=:]\s*['"]?[A-Za-z0-9\-._]{20,}['"]?/i,
    severity: 'medium',
  },
];

// Keys that are commonly sensitive by name
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
];

function scanForSecrets(envObj, options = {}) {
  const findings = [];
  const ignoredKeys = new Set(options.ignoreKeys || []);
  const minSeverity = options.minSeverity || 'medium';
  const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };

  for (const [key, value] of Object.entries(envObj)) {
    if (ignoredKeys.has(key)) continue;
    if (value === undefined || value === '') continue;

    // Check value against secret patterns
    for (const { name, pattern, severity } of SECRET_PATTERNS) {
      if (severityOrder[severity] < severityOrder[minSeverity]) continue;

      if (pattern.test(value)) {
        findings.push({
          key,
          severity,
          type: name,
          message: `Potential ${name} detected in variable "${key}"`,
        });
        break; // One finding per variable to avoid duplicates
      }
    }

    // Check if key name suggests sensitive data
    const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((p) => p.test(key));
    if (isSensitiveKey && !findings.some((f) => f.key === key)) {
      findings.push({
        key,
        severity: 'medium',
        type: 'Sensitive Key Name',
        message: `Variable "${key}" appears to contain sensitive data based on its name`,
      });
    }
  }

  return {
    findings,
    hasCritical: findings.some((f) => f.severity === 'critical'),
    hasHigh: findings.some((f) => f.severity === 'high'),
    total: findings.length,
  };
}

module.exports = { scanForSecrets, SECRET_PATTERNS, SENSITIVE_KEY_PATTERNS };
