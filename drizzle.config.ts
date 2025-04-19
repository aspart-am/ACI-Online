import { defineConfig } from "drizzle-kit";

// En développement, on peut utiliser une base de données locale
// En production sur Render, DATABASE_URL sera défini
const dbUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/aci_online";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
