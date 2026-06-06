/**
 * Docker Compose Template
 * Multi-container Docker applications
 */

module.exports = {
  name: 'docker-compose',
  description: 'Docker Compose multi-container setup',
  tags: ['docker', 'containers', 'orchestration', 'devops'],
  schema: {
    // ── Compose Project ──────────────────
    COMPOSE_PROJECT_NAME: {
      required: false,
      type: 'string',
      description: 'Docker Compose project name (defaults to directory name)',
    },

    // ── Database ─────────────────────────
    POSTGRES_USER: {
      required: false,
      type: 'string',
      default: 'postgres',
      description: 'PostgreSQL username',
    },
    POSTGRES_PASSWORD: {
      required: true,
      type: 'string',
      description: 'PostgreSQL password',
    },
    POSTGRES_DB: {
      required: false,
      type: 'string',
      default: 'app',
      description: 'PostgreSQL database name',
    },
    DATABASE_URL: {
      required: false,
      type: 'url',
      description: 'Full database URL for app container',
    },

    // ── Redis ────────────────────────────
    REDIS_PASSWORD: {
      required: false,
      type: 'string',
      description: 'Redis password (optional but recommended)',
    },
    REDIS_URL: {
      required: false,
      type: 'url',
      description: 'Redis connection URL for app container',
    },

    // ── MySQL (Alternative) ───────────────
    MYSQL_ROOT_PASSWORD: {
      required: false,
      type: 'string',
      description: 'MySQL root password (if using MySQL)',
    },
    MYSQL_DATABASE: {
      required: false,
      type: 'string',
      default: 'app',
      description: 'MySQL database name',
    },
    MYSQL_USER: {
      required: false,
      type: 'string',
      default: 'app',
      description: 'MySQL application user',
    },
    MYSQL_PASSWORD: {
      required: false,
      type: 'string',
      description: 'MySQL application password',
    },

    // ── MongoDB (Alternative) ─────────────
    MONGO_INITDB_ROOT_USERNAME: {
      required: false,
      type: 'string',
      description: 'MongoDB root username',
    },
    MONGO_INITDB_ROOT_PASSWORD: {
      required: false,
      type: 'string',
      description: 'MongoDB root password',
    },
    MONGODB_URL: {
      required: false,
      type: 'url',
      description: 'MongoDB connection URL for app container',
    },

    // ── Application ──────────────────────
    NODE_ENV: {
      required: false,
      type: 'string',
      enum: ['development', 'test', 'production'],
      default: 'development',
      description: 'Application environment',
    },
    APP_PORT: {
      required: false,
      type: 'port',
      default: '3000',
      description: 'Application port exposed to host',
    },

    // ── Traefik / Reverse Proxy ──────────
    TRAEFIK_DASHBOARD_AUTH: {
      required: false,
      type: 'string',
      description: 'htpasswd for Traefik dashboard (generate: htpasswd -nB admin)',
    },

    // ── Monitoring ───────────────────────
    GRAFANA_ADMIN_PASSWORD: {
      required: false,
      type: 'string',
      description: 'Grafana admin password',
    },
  },
  security: {
    minSeverity: 'medium',
    ignoreKeys: [],
  },
  docs: {
    projectName: 'Docker Compose Stack',
  },
};
