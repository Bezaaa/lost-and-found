import { defineConfig, env } from "prisma/config";


try {
  process.loadEnvFile();
} catch {
  
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
