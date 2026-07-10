import { defineConfig } from "prisma/config";

const url = process.env["DATABASE_URL"];

if (!url) {
  throw new Error("DATABASE_URL environment variable is not defined. Check your Render environment variables.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
