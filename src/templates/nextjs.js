/**
 * Next.js Framework Template
 * Full-stack React framework with SSR, API routes, and authentication
 */

module.exports = {
  name: 'nextjs',
  description: 'Next.js full-stack application',
  tags: ['react', 'ssr', 'api-routes', 'nextauth'],
  schema: {
    // ── Application ──────────────────────
    NODE_ENV: {
      required: true,
      type: 'string',
      enum: ['development', 'test', 'production'],
      description: 'Application environment',
    },
    NEXT_PUBLIC_APP_URL: {
      required: true,
      type: 'url',
      description: 'Public-facing application URL (used for OG images, redirects)',
    },
    NEXT_PUBLIC_API_URL: {
      required: false,
      type: 'url',
      description: 'API endpoint URL (defaults to same origin if not set)',
    },

    // ── Database ─────────────────────────
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: 'PostgreSQL connection string (e.g. postgres://user:pass@host:5432/db)',
    },

    // ── Authentication (NextAuth.js) ─────
    NEXTAUTH_SECRET: {
      required: true,
      type: 'string',
      description: 'NextAuth.js secret key (generate: openssl rand -base64 32)',
    },
    NEXTAUTH_URL: {
      required: true,
      type: 'url',
      description: 'NextAuth.js callback URL (usually same as NEXT_PUBLIC_APP_URL)',
    },

    // ── Optional: OAuth Providers ────────
    GITHUB_CLIENT_ID: {
      required: false,
      type: 'string',
      description: 'GitHub OAuth client ID (for GitHub login)',
    },
    GITHUB_CLIENT_SECRET: {
      required: false,
      type: 'string',
      description: 'GitHub OAuth client secret',
    },
    GOOGLE_CLIENT_ID: {
      required: false,
      type: 'string',
      description: 'Google OAuth client ID (for Google login)',
    },
    GOOGLE_CLIENT_SECRET: {
      required: false,
      type: 'string',
      description: 'Google OAuth client secret',
    },

    // ── Optional: Analytics ───────────────
    NEXT_PUBLIC_ANALYTICS_ID: {
      required: false,
      type: 'string',
      description: 'Google Analytics or similar tracking ID',
    },
  },
  security: {
    minSeverity: 'medium',
    ignoreKeys: ['NEXT_PUBLIC_*'],
  },
  docs: {
    projectName: 'Next.js App',
  },
};
