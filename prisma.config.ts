import path from "node:path";
import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";

// Charge .env.production si NODE_ENV=production, sinon .env.local puis .env
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
config({ path: path.resolve(process.cwd(), envFile) });
config({ path: path.resolve(process.cwd(), ".env") }); // fallback

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
