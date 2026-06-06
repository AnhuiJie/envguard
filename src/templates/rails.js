/**
 * Ruby on Rails Framework Template
 * Ruby web framework with ActiveRecord and common gems
 */

module.exports = {
  name: 'rails',
  description: 'Ruby on Rails web application',
  tags: ['ruby', 'rails', 'activerecord', 'mvc'],
  schema: {
    // ── Rails Core ───────────────────────
    RAILS_ENV: {
      required: true,
      type: 'string',
      enum: ['development', 'test', 'production'],
      description: 'Rails environment',
    },
    RAILS_LOG_TO_STDOUT: {
      required: false,
      type: 'boolean',
      default: 'true',
      description: 'Log to stdout (recommended for Docker/Heroku)',
    },
    RAILS_SERVE_STATIC_FILES: {
      required: false,
      type: 'boolean',
      default: 'true',
      description: 'Serve static files from public directory',
    },
    SECRET_KEY_BASE: {
      required: true,
      type: 'string',
      description: 'Rails secret key base (generate: rails secret)',
    },

    // ── Database ─────────────────────────
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: 'Database connection string (PostgreSQL/MySQL)',
    },
    DATABASE_POOL: {
      required: false,
      type: 'number',
      default: '5',
      min: 1,
      max: 50,
      description: 'Database connection pool size',
    },

    // ── Redis ────────────────────────────
    REDIS_URL: {
      required: false,
      type: 'url',
      description: 'Redis connection URL (for Sidekiq, caching, Action Cable)',
    },

    // ── Action Mailer ────────────────────
    SMTP_ADDRESS: {
      required: false,
      type: 'string',
      default: 'smtp.gmail.com',
      description: 'SMTP server address',
    },
    SMTP_PORT: {
      required: false,
      type: 'port',
      default: '587',
      description: 'SMTP server port',
    },
    SMTP_USERNAME: {
      required: false,
      type: 'string',
      description: 'SMTP authentication username',
    },
    SMTP_PASSWORD: {
      required: false,
      type: 'string',
      description: 'SMTP authentication password',
    },
    MAILER_FROM: {
      required: false,
      type: 'email',
      description: 'Default from address for emails',
    },

    // ── Active Storage (AWS S3) ──────────
    AWS_ACCESS_KEY_ID: {
      required: false,
      type: 'string',
      description: 'AWS access key for Active Storage S3',
    },
    AWS_SECRET_ACCESS_KEY: {
      required: false,
      type: 'string',
      description: 'AWS secret key for Active Storage S3',
    },
    AWS_REGION: {
      required: false,
      type: 'string',
      default: 'us-east-1',
      description: 'AWS region for S3 bucket',
    },
    AWS_BUCKET: {
      required: false,
      type: 'string',
      description: 'S3 bucket name for Active Storage',
    },

    // ── Web Server ───────────────────────
    WEB_CONCURRENCY: {
      required: false,
      type: 'number',
      default: '2',
      min: 1,
      max: 16,
      description: 'Number of Puma worker processes',
    },
    PORT: {
      required: false,
      type: 'port',
      default: '3000',
      description: 'Rails server port',
    },
  },
  security: {
    minSeverity: 'medium',
    ignoreKeys: [],
  },
  docs: {
    projectName: 'Rails App',
  },
};
