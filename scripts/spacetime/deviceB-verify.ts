/**
 * deviceB-verify.ts — throwaway "second device" driver for local verification
 * of the v4.0 SpacetimeDB live layer. NOT for commit — delete after testing.
 *
 * Usage:
 *   STDB_TOKEN=<jwt> bun scripts/spacetime/deviceB-verify.ts <cmd> [...args]
 *   (omit STDB_TOKEN for a fresh anonymous identity)
 *
 * Commands:
 *   dump
 *   plan-upsert <week> <day> <meal> <ref> <name> <servings>
 *   plan-clear <week> <day> <meal>
 *   plan-lock <week> <day> <meal> <0|1>
 *   cart-upsert <key> <name> <qty> <unit>
 *   cart-remove <key>
 *   feed-post <eventType> <actorName>
 *   comm-create <title> <displayName> [staySeconds]
 *   comm-join <sessionId> <displayName> [staySeconds]
 *   comm-leave <sessionId>
 *   comm-status <sessionId> <status>
 */

import { DbConnection } from "@/lib/spacetime/generated";

const URI = process.env.SPACETIME_URI ?? "ws://127.0.0.1:3010";
const MODULE = process.env.SPACETIME_MODULE ?? "alchm-culinary";
const TOKEN = process.env.STDB_TOKEN;

const [cmd = "dump", ...args] = process.argv.slice(2);

const json = (v: unknown) =>
  JSON.stringify(v, (_, x) => (typeof x === "bigint" ? x.toString() : x), 2);

function connect(): Promise<{ conn: DbConnection; idHex: string }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("connect timeout")), 15_000);
    let builder = DbConnection.builder().withUri(URI).withDatabaseName(MODULE);
    if (TOKEN) builder = builder.withToken(TOKEN);
    builder
      .onConnect((conn, identity) => {
        clearTimeout(timer);
        resolve({ conn, idHex: identity.toHexString() });
      })
      .onConnectError((_ctx, error) => {
        clearTimeout(timer);
        reject(error);
      })
      .build();
  });
}

function subscribeAll(conn: DbConnection): Promise<void> {
  return new Promise((resolve) => {
    conn
      .subscriptionBuilder()
      .onApplied(() => resolve())
      .subscribe([
        "SELECT * FROM meal_plan_slot",
        "SELECT * FROM grocery_cart_item",
        "SELECT * FROM commensal_session",
        "SELECT * FROM commensal_member",
        "SELECT * FROM feed_event",
      ]);
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { conn, idHex } = await connect();
  await subscribeAll(conn);
  console.log(`[deviceB] identity=${idHex}`);

  const dump = () => {
    const out: Record<string, unknown[]> = {
      meal_plan_slot: [...conn.db.meal_plan_slot.iter()].map((r) => ({
        owner: r.owner.toHexString().slice(0, 8),
        week: r.weekEpochDay,
        day: r.dayOfWeek,
        meal: r.mealType,
        recipeRef: r.recipeRef,
        recipeName: r.recipeName,
        servings: r.servings,
        locked: r.locked,
      })),
      grocery_cart_item: [...conn.db.grocery_cart_item.iter()].map((r) => ({
        owner: r.owner.toHexString().slice(0, 8),
        itemKey: r.itemKey,
        name: r.name,
        quantity: r.quantity,
        unit: r.unit,
      })),
      commensal_session: [...conn.db.commensal_session.iter()].map((r) => ({
        ...r,
        host: r.host?.toHexString?.()?.slice(0, 8) ?? r.host,
      })),
      commensal_member: [...conn.db.commensal_member.iter()].map((r) => ({
        ...r,
        member: r.member?.toHexString?.()?.slice(0, 8) ?? r.member,
      })),
      feed_event: [...conn.db.feed_event.iter()].map((r) => ({
        ...r,
        actor: r.actor?.toHexString?.()?.slice(0, 8) ?? r.actor,
      })),
    };
    console.log(json(out));
  };

  switch (cmd) {
    case "dump":
      dump();
      break;
    case "plan-upsert": {
      if (args.length < 6) {
        console.error("Usage: plan-upsert <week> <day> <meal> <ref> <name> <servings>");
        process.exit(1);
      }
      await conn.reducers.upsertMealPlanSlot({
        weekEpochDay: Number(args[0]),
        dayOfWeek: Number(args[1]),
        mealType: Number(args[2]),
        recipeId: 0n,
        recipeRef: args[3] ?? "",
        recipeName: args[4] ?? "",
        servings: Number(args[5]),
      });
      break;
    }
    case "plan-clear": {
      if (args.length < 3) {
        console.error("Usage: plan-clear <week> <day> <meal>");
        process.exit(1);
      }
      await conn.reducers.clearMealPlanSlot({
        weekEpochDay: Number(args[0]),
        dayOfWeek: Number(args[1]),
        mealType: Number(args[2]),
      });
      break;
    }
    case "plan-lock": {
      if (args.length < 4) {
        console.error("Usage: plan-lock <week> <day> <meal> <0|1>");
        process.exit(1);
      }
      await conn.reducers.setMealPlanSlotLocked({
        weekEpochDay: Number(args[0]),
        dayOfWeek: Number(args[1]),
        mealType: Number(args[2]),
        locked: args[3] === "1",
      });
      break;
    }
    case "cart-upsert": {
      const itemKey = args[0];
      const name = args[1];
      const quantity = Number(args[2]);
      if (!itemKey || !name || Number.isNaN(quantity)) {
        console.error("Usage: cart-upsert <key> <name> <qty> [unit]");
        process.exit(1);
      }
      await conn.reducers.cartUpsertItem({
        itemKey,
        name,
        quantity,
        unit: args[3] ?? "each",
        category: "",
        notes: "",
        asin: "",
        recipeRefs: [],
      });
      break;
    }
    case "cart-remove": {
      const itemKey = args[0];
      if (!itemKey) {
        console.error("Usage: cart-remove <key>");
        process.exit(1);
      }
      await conn.reducers.cartRemoveItem({ itemKey });
      break;
    }
    case "feed-post": {
      const eventType = args[0];
      if (!eventType) {
        console.error("Usage: feed-post <eventType> [actorName]");
        process.exit(1);
      }
      await conn.reducers.postFeedEvent({
        actorName: args[1] ?? "Device B",
        actorIsAgent: false,
        eventType,
        payloadJson: JSON.stringify({ menuTitle: "device-B test", mealCount: 2 }),
      });
      break;
    }
    case "comm-create": {
      const title = args[0];
      if (!title) {
        console.error("Usage: comm-create <title> [displayName] [staySeconds]");
        process.exit(1);
      }
      await conn.reducers.createCommensalSession({
        title,
        displayName: args[1] ?? "DeviceB",
      });
      break;
    }
    case "comm-join": {
      const rawSessionId = args[0];
      if (!rawSessionId) {
        console.error("Usage: comm-join <sessionId> [displayName] [staySeconds]");
        process.exit(1);
      }
      await conn.reducers.joinCommensalSession({
        sessionId: BigInt(rawSessionId),
        displayName: args[1] ?? "DeviceB",
      });
      break;
    }
    case "comm-leave": {
      const rawSessionId = args[0];
      if (!rawSessionId) {
        console.error("Usage: comm-leave <sessionId>");
        process.exit(1);
      }
      await conn.reducers.leaveCommensalSession({ sessionId: BigInt(rawSessionId) });
      break;
    }
    case "comm-status": {
      const rawSessionId = args[0];
      const rawStatus = args[1];
      if (!rawSessionId || rawStatus === undefined) {
        console.error("Usage: comm-status <sessionId> <status>");
        process.exit(1);
      }
      await conn.reducers.setCommensalSessionStatus({
        sessionId: BigInt(rawSessionId),
        status: Number(rawStatus),
      });
      break;
    }
    default:
      throw new Error(`unknown command: ${cmd}`);
  }

  const stayCommands: Record<string, number> = { "comm-create": 2, "comm-join": 2 };
  const stayIdx = stayCommands[cmd];
  const stay =
    stayIdx !== undefined && args[stayIdx] ? Number(args[stayIdx]) : 0;
  await sleep(1200);
  if (cmd !== "dump") dump();
  if (stay > 0) {
    console.log(`[deviceB] holding connection for ${stay}s...`);
    await sleep(stay * 1000);
  }
  conn.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error("[deviceB] failed:", e);
  process.exit(1);
});
