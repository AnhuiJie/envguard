/**
 * Express.js Framework Template
 * Node.js REST API server with common middleware
 */

module.exports = {
  name: 'express',
  description: 'Express.js REST API server',
  tags: ['nodejs', 'rest-api', 'middleware', 'jwt'],
  schema: {
    // ── Server ───────────────────────────
    NODE_ENV: {
      required: true,
      type: 'string',
      enum: ['development', 'test', 'production'],
      description: 'Application environment',
    },
    PORT: {
      required: false,
      type: 'port',
      default: '3000',
      description: 'Server port',
    },
    HOST: {
      required: false,
      type: 'string',
      default: '0.0.0.0',
      description: 'Server host binding',
    },

    // ── Database ─────────────────────────
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: 'Database connection string (PostgreSQL/MySQL/MongoDB)',
    },
    DATABASE_POOL_SIZE: {
      required: false,
      type: 'number',
      default: '10',
      min: 1,
      max: 100,
      description: 'Database connection pool size',
    },

    // ── Authentication ───────────────────
    JWT_SECRET: {
      required: true,
      type: 'string',
      description: 'JWT signing secret (min 32 characters recommended)',
    },
    JWT_EXPIRES_IN: {
      required: false,
      type: 'string',
      default: '7d',
      description: 'JWT expiration time (e.g. 1h, 7d, 30d)',
    },
    BCRYPT_SALT_ROUNDS: {
      required: false,
      type: 'number',
      default: '10',
      min: 8,
      max: 15,
      description: 'Bcrypt salt rounds for password hashing',
    },

    // ── CORS ─────────────────────────────
    CORS_ORIGIN: {
      required: false,
      type: 'string',
      default: '*',
      description: 'CORS allowed origin(s), comma-separated for multiple',
    },

    // ── Rate Limiting ────────────────────
    RATE_LIMIT_WINDOW_MS: {
      required: false,
      type: 'number',
      default: '900000',
      description: 'Rate limit window in milliseconds (default: 15 min)',
    },
    RATE_LIMIT_MAX_REQUESTS: {
      required: false,
      type: 'number',
      default: '100',
      description: 'Max requests per window',
    },

    // ── Logging ──────────────────────────
    LOG_LEVEL: {
      required: false,
      type: 'string',
      enum: ['debug', 'info', 'warn', 'error'],
      default: 'info',
      description: 'Logging level',
    },
  },
  security: {
    minSeverity: 'medium',
    ignoreKeys: [],
  },
  docs: {
    projectName: 'Express API',
  },
};
