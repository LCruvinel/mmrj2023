//Description: This file is used to create a singleton instance of PrismaClient

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
    }
  }
}

declare const global: NodeJS.Global;

const databaseUrl = process.env.DATABASE_URL
  ? new URL(process.env.DATABASE_URL)
  : null;

const adapter = new PrismaPg({
  host: process.env.DB_HOST ?? databaseUrl?.hostname ?? "localhost",
  port: Number(process.env.DB_PORT ?? databaseUrl?.port ?? 5432),
  user: process.env.DB_USER ?? databaseUrl?.username ?? "postgres",
  password: process.env.DB_PASSWORD ?? databaseUrl?.password ?? "",
  database:
    process.env.DB_NAME ??
    (databaseUrl?.pathname ? databaseUrl.pathname.replace(/^\//, "") : "proj_fapesp"),
});

const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
