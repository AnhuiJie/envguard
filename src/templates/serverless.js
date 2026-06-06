/**
 * Serverless Framework Template
 * AWS Lambda / Serverless Framework applications
 */

module.exports = {
  name: 'serverless',
  description: 'Serverless Framework AWS Lambda application',
  tags: ['aws', 'lambda', 'serverless', 'api-gateway'],
  schema: {
    // ── AWS Credentials ──────────────────
    AWS_ACCESS_KEY_ID: {
      required: true,
      type: 'string',
      description: 'AWS access key ID',
    },
    AWS_SECRET_ACCESS_KEY: {
      required: true,
      type: 'string',
      description: 'AWS secret access key',
    },
    AWS_REGION: {
      required: false,
      type: 'string',
      default: 'us-east-1',
      description: 'AWS region for deployment',
    },

    // ── Serverless Framework ─────────────
    SLS_STAGE: {
      required: false,
      type: 'string',
      enum: ['dev', 'staging', 'prod'],
      default: 'dev',
      description: 'Serverless deployment stage',
    },
    SLS_PROFILE: {
      required: false,
      type: 'string',
      description: 'AWS CLI profile to use (optional)',
    },

    // ── Database ─────────────────────────
    DATABASE_URL: {
      required: false,
      type: 'url',
      description: 'Database connection string (RDS/Aurora)',
    },
    DB_SECRET_ARN: {
      required: false,
      type: 'string',
      description: 'AWS Secrets Manager ARN for database credentials',
    },

    // ── DynamoDB ─────────────────────────
    DYNAMODB_TABLE: {
      required: false,
      type: 'string',
      description: 'DynamoDB table name',
    },
    DYNAMODB_ENDPOINT: {
      required: false,
      type: 'url',
      description: 'DynamoDB endpoint (for local development)',
    },

    // ── S3 ───────────────────────────────
    S3_BUCKET_NAME: {
      required: false,
      type: 'string',
      description: 'S3 bucket name for file storage',
    },

    // ── SQS / SNS ────────────────────────
    SQS_QUEUE_URL: {
      required: false,
      type: 'url',
      description: 'SQS queue URL',
    },
    SNS_TOPIC_ARN: {
      required: false,
      type: 'string',
      description: 'SNS topic ARN for notifications',
    },

    // ── API Gateway ──────────────────────
    API_GATEWAY_ID: {
      required: false,
      type: 'string',
      description: 'API Gateway ID (set after first deploy)',
    },

    // ── Authentication ───────────────────
    JWT_SECRET: {
      required: false,
      type: 'string',
      description: 'JWT signing secret',
    },
    COGNITO_USER_POOL_ID: {
      required: false,
      type: 'string',
      description: 'Cognito User Pool ID',
    },
    COGNITO_CLIENT_ID: {
      required: false,
      type: 'string',
      description: 'Cognito App Client ID',
    },

    // ── External Services ────────────────
    STRIPE_SECRET_KEY: {
      required: false,
      type: 'string',
      description: 'Stripe API secret key',
    },
    SENDGRID_API_KEY: {
      required: false,
      type: 'string',
      description: 'SendGrid API key for emails',
    },
    SLACK_WEBHOOK_URL: {
      required: false,
      type: 'url',
      description: 'Slack webhook URL for notifications',
    },

    // ── Monitoring ───────────────────────
    SENTRY_DSN: {
      required: false,
      type: 'url',
      description: 'Sentry DSN for error tracking',
    },
  },
  security: {
    minSeverity: 'medium',
    ignoreKeys: [],
  },
  docs: {
    projectName: 'Serverless App',
  },
};
