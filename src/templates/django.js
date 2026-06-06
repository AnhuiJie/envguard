/**
 * Django Framework Template
 * Python web framework with Django ORM and common integrations
 */

module.exports = {
  name: 'django',
  description: 'Django Python web application',
  tags: ['python', 'django', 'orm', 'wsgi'],
  schema: {
    // ── Django Core ──────────────────────
    DJANGO_SETTINGS_MODULE: {
      required: true,
      type: 'string',
      default: 'myproject.settings',
      description: 'Django settings module path',
    },
    DJANGO_SECRET_KEY: {
      required: true,
      type: 'string',
      description: 'Django secret key for cryptographic signing (generate: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")',
    },
    DJANGO_DEBUG: {
      required: false,
      type: 'boolean',
      default: 'False',
      description: 'Django debug mode (NEVER set to True in production)',
    },
    DJANGO_ALLOWED_HOSTS: {
      required: true,
      type: 'string',
      description: 'Comma-separated list of allowed hosts (e.g. example.com,www.example.com)',
    },

    // ── Database ─────────────────────────
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: 'Database connection string (PostgreSQL recommended)',
    },

    // ── Static & Media ───────────────────
    STATIC_URL: {
      required: false,
      type: 'string',
      default: '/static/',
      description: 'URL prefix for static files',
    },
    MEDIA_URL: {
      required: false,
      type: 'string',
      default: '/media/',
      description: 'URL prefix for media files',
    },
    AWS_STORAGE_BUCKET_NAME: {
      required: false,
      type: 'string',
      description: 'S3 bucket for static/media storage (optional)',
    },
    AWS_S3_ACCESS_KEY_ID: {
      required: false,
      type: 'string',
      description: 'AWS access key for S3',
    },
    AWS_S3_SECRET_ACCESS_KEY: {
      required: false,
      type: 'string',
      description: 'AWS secret key for S3',
    },

    // ── Email ────────────────────────────
    EMAIL_HOST: {
      required: false,
      type: 'string',
      default: 'smtp.gmail.com',
      description: 'SMTP server host',
    },
    EMAIL_PORT: {
      required: false,
      type: 'port',
      default: '587',
      description: 'SMTP server port',
    },
    EMAIL_HOST_USER: {
      required: false,
      type: 'email',
      description: 'SMTP authentication username',
    },
    EMAIL_HOST_PASSWORD: {
      required: false,
      type: 'string',
      description: 'SMTP authentication password or app password',
    },

    // ── Cache ────────────────────────────
    REDIS_URL: {
      required: false,
      type: 'url',
      description: 'Redis connection URL for caching (optional)',
    },

    // ── CORS ─────────────────────────────
    CORS_ALLOWED_ORIGINS: {
      required: false,
      type: 'string',
      description: 'Comma-separated CORS allowed origins',
    },
  },
  security: {
    minSeverity: 'medium',
    ignoreKeys: [],
  },
  docs: {
    projectName: 'Django App',
  },
};
