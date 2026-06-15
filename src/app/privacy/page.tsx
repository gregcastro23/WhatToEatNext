import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Alchm Kitchen culinary planning tools.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Link href="/" className="text-sm text-white/60 hover:text-amber-300">
          &larr; Back to Alchm Kitchen
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-10 shadow-2xl shadow-purple-950/30">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
            Privacy
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-purple-300">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-white/50">Last updated: May 9, 2026</p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-white/75">
            <section>
              <h2 className="text-xl font-bold text-white">Information we collect</h2>
              <p className="mt-2">
                Alchm Kitchen may collect account details, authentication profile
                information, saved preferences, birth-data inputs you choose to
                provide, meal plans, pantry items, grocery lists, and usage events
                needed to operate the product.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">How information is used</h2>
              <p className="mt-2">
                We use information to generate recommendations, personalize meal
                planning, maintain account features, improve site reliability, process
                payments, and support linked third-party experiences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Third-party providers</h2>
              <p className="mt-2">
                The service may use providers for hosting, authentication, analytics,
                payments, email, restaurant search, grocery links, and affiliate
                shopping. Data shared with those providers is limited to what is
                needed for the related feature.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Local storage</h2>
              <p className="mt-2">
                Some preferences, draft plans, pantry state, and interaction history
                may be stored in your browser so the app remains useful without a
                full account session.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Your choices</h2>
              <p className="mt-2">
                You can choose not to provide optional personalization data. You can
                also clear local browser storage or request account-data changes
                through the contact method listed on the site or associated account
                channels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Security and retention</h2>
              <p className="mt-2">
                We use reasonable safeguards for stored account data, but no internet
                service can guarantee perfect security. Data is retained as needed to
                operate the service, comply with obligations, and maintain product
                integrity.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
