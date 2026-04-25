async function run() {
  const { executeQuery } = require('./src/lib/database/connection.ts');
  try {
    const res = await executeQuery("SELECT * FROM recipes LIMIT 1", []);
    console.log("Success! Columns:", Object.keys(res.rows[0] || {}));
  } catch(e) {
    console.error("Simple Query Error:", e);
  }
}
run();
