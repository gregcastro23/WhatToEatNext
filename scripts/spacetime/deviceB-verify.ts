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
    case "plan-upsert":
      await conn.reducers.upsertMealPlanSlot({
        weekEpochDay: Number(args[0]),
        dayOfWeek: Number(args[1]),
        mealType: Number(args[2]),
        recipeId: 0n,
        recipeRef: args[3],
        recipeName: args[4],
        servings: Number(args[5]),
      });
      break;
    case "plan-clear":
      await conn.reducers.clearMealPlanSlot({
        weekEpochDay: Number(args[0]),
        dayOfWeek: Number(args[1]),
        mealType: Number(args[2]),
      });
      break;
    case "plan-lock":
      await conn.reducers.setMealPlanSlotLocked({
        weekEpochDay: Number(args[0]),
        dayOfWeek: Number(args[1]),
        mealType: Number(args[2]),
        locked: args[3] === "1",
      });
      break;
    case "cart-upsert":
      await conn.reducers.cartUpsertItem({
        itemKey: args[0],
        name: args[1],
        quantity: Number(args[2]),
        unit: args[3] ?? "each",
        category: "",
        notes: "",
        asin: "",
        recipeRefs: [],
      });
      break;
    case "cart-remove":
      await conn.reducers.cartRemoveItem({ itemKey: args[0] });
      break;
    case "feed-post":
      await conn.reducers.postFeedEvent({
        actorName: args[1] ?? "Device B",
        actorIsAgent: false,
        eventType: args[0] ?? "shared_menu",
        payloadJson: JSON.stringify({ menuTitle: "device-B test", mealCount: 2 }),
      });
      break;
    case "comm-create":
      await conn.reducers.createCommensalSession({
        title: args[0] ?? "Test Party",
        displayName: args[1] ?? "DeviceB",
      });
      break;
    case "comm-join":
      await conn.reducers.joinCommensalSession({
        sessionId: BigInt(args[0]),
        displayName: args[1] ?? "DeviceB",
      });
      break;
    case "comm-leave":
      await conn.reducers.leaveCommensalSession({ sessionId: BigInt(args[0]) });
      break;
    case "comm-status":
      await conn.reducers.setCommensalSessionStatus({
        sessionId: BigInt(args[0]),
        status: Number(args[1]),
      });
      break;
    default:
      throw new Error(`unknown command: ${cmd}`);
  }

  const stayIdx = { "comm-create": 2, "comm-join": 2 }[cmd];
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
