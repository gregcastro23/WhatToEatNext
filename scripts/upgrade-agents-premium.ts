import { executeQuery } from "../src/lib/database/connection";

async function upgradeAgents() {
  console.log("Searching for agentic users...");
  const agents = await executeQuery("SELECT id, email FROM users WHERE is_agent = true", []);
  
  if (agents.rows.length === 0) {
    console.log("No agentic users found. Please ensure you have created agent accounts first.");
    return;
  }

  console.log(`Found ${agents.rows.length} agents.`);
  
  for (const agent of agents.rows) {
    console.log(`Upgrading agent: ${agent.email} (${agent.id})`);
    
    // Ensure they have a premium subscription record
    await executeQuery(
      `INSERT INTO user_subscriptions (id, user_id, tier, status, current_period_start, current_period_end)
       VALUES (gen_random_uuid(), $1, 'premium', 'active', NOW(), NOW() + interval '100 years')
       ON CONFLICT (user_id) DO UPDATE SET 
         tier = 'premium', 
         status = 'active', 
         updated_at = NOW()`,
      [agent.id]
    );
  }
  
  console.log("Upgrade complete.");
}

upgradeAgents()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
