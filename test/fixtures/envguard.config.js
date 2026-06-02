module.exports = {
  schema: {
    NODE_ENV: {
      required: true,
      type: 'string',
      enum: ['development', 'staging', 'production', 'test'],
      description: 'Application environment',
    },
    PORT: {
      required: false,
      type: 'port',
      default: '3000',
      description: 'Server port',
    },
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: 'Database connection string',
    },
    JWT_SECRET: {
      required: true,
      type: 'string',
      description: 'Secret key for JWT signing',
    },
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
    projectName: 'TestApp',
  },
};
