import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not defined.');
    }

    const adapter = new PrismaNeon({ connectionString });
    super({ adapter });
  }
  async onModuleInit() {
    // Note: this is optional
    await this.$connect();
  }
}