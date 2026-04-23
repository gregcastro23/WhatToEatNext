import { executeQuery } from "./src/lib/database/connection";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

export async function run() {
   try {
     const res = await executeQuery("SELECT id, popularity_score FROM recipes LIMIT 1;");
     console.log("popularity_score works?", res.rowCount);
   } catch (e) {
     console.error("popularity_score failed:", (e as Error).message);
   }
   process.exit(0);
}
run();
