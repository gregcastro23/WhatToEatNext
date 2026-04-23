import { executeQuery } from "./src/lib/database/connection";
async function test() {
  let res = await executeQuery("SELECT COUNT(*) as count FROM recipes", []);
  console.log("Total recipes:", res.rows[0]);
  res = await executeQuery("SELECT COUNT(*) as count FROM recipes WHERE is_public = true", []);
  console.log("Public recipes:", res.rows[0]);
}
test().catch(console.error);
