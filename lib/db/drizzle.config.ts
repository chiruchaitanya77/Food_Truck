import { defineConfig } from "drizzle-kit";
import path from "path";
import dotenv from "dotenv";

// ✅ explicitly load root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
