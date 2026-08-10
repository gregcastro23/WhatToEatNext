import Link from "next/link";
import OnboardingFunnelPanel from "@/components/admin/OnboardingFunnelPanel";

/** Dedicated operator route for the complete signup → calibrated-user journey. */
export default function AdminOnboardingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-600">
            Journey operations
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            User onboarding
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600 sm:text-base">
            Monitor route health, funnel loss, recent completions, and users who
            need hands-on recovery.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/users"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Human accounts
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700"
          >
            Open public route ↗
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <RouteCard
          route="/login"
          title="Authentication entry"
          detail="Session establishment and identity provider hand-off."
        />
        <RouteCard
          route="/onboarding"
          title="Birth-data calibration"
          detail="Profile, location, natal chart, and completion transition."
        />
        <RouteCard
          route="/admin/users/[userId]"
          title="Operator recovery"
          detail="Timeline and account-level inspection for a stuck user."
        />
      </div>

      <OnboardingFunnelPanel />
    </div>
  );
}

function RouteCard({
  route,
  title,
  detail,
}: {
  route: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="font-mono text-xs text-purple-700">{route}</div>
      <div className="mt-2 text-sm font-semibold text-gray-900">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{detail}</p>
    </div>
  );
}
