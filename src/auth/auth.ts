import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

type Role = 'admin' | 'client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined.');
}

if (!process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL environment variable is not defined.');
}

const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
const isHttpsFrontend = frontendUrl.startsWith('https://');

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  additionalFields: {
    role: {
      type: 'string',
      required: true,
      defaultValue: 'client',
      input: false,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  trustedOrigins: [frontendUrl],
  advanced: {
    defaultCookieAttributes: {
      // In localhost over HTTP, Secure + SameSite=None can block session cookies.
      sameSite: isHttpsFrontend ? 'None' : 'Lax',
      secure: isHttpsFrontend,
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  basePath: '/api/auth',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    admin({
      defaultRole: 'client' as Role,
      adminRoles: ['admin'] as Role[],
    }),
  ],
  hooks: {},
});
