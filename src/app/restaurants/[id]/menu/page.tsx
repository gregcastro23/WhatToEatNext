import Link from "next/link";
import { notFound } from "next/navigation";
import { executeQuery } from "@/lib/database/connection";
import { DeliverectClient } from "@/lib/integrations/deliverect";
import MenuOrderClient from "./MenuOrderClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RestaurantMenuPageProps {
  params: Promise<{ id: string }>;
}

interface RestaurantRow {
  id: string;
  name: string;
  menu_url: string | null;
  external_provider: string | null;
  external_id: string | null;
  stripe_connect_account_id: string | null;
  deliverect_location_id: string | null;
}

async function getRestaurant(id: string): Promise<RestaurantRow | null> {
  const result = await executeQuery<RestaurantRow>(
    `SELECT id, name, menu_url, external_provider, external_id,
            stripe_connect_account_id, deliverect_location_id
     FROM restaurants
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] ?? null;
}

function appUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    process.env.VERCEL_URL ||
    "https://alchm.kitchen";

  return configured.startsWith("http") ? configured : `https://${configured}`;
}

export default async function RestaurantMenuPage({
  params,
}: RestaurantMenuPageProps) {
  const { id } = await params;
  const restaurant = await getRestaurant(id);

  if (!restaurant) {
    notFound();
  }

  const deliverect = new DeliverectClient();
  const menu = await deliverect.getMenu(
    restaurant.deliverect_location_id || restaurant.id,
  );
  const fallbackMenuUrl = new URL(`/restaurants/${restaurant.id}/menu`, appUrl());

  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/restaurants"
          className="mb-6 inline-flex text-sm text-white/60 transition-colors hover:text-orange-300"
        >
          Back to restaurants
        </Link>

        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Partner Menu
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white md:text-5xl">
            {restaurant.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/55">
            Menu items are fetched through the POS integration and sent into the
            existing Stripe Connect checkout flow.
          </p>
        </header>

        <MenuOrderClient
          restaurant={{
            id: restaurant.id,
            name: restaurant.name,
            url: restaurant.menu_url || fallbackMenuUrl.toString(),
            stripeConnectAccountId:
              restaurant.stripe_connect_account_id ?? undefined,
          }}
          menu={menu}
        />
      </div>
    </main>
  );
}
