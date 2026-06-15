import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using Alchm Kitchen culinary planning tools.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Link href="/" className="text-sm text-white/60 hover:text-amber-300">
          &larr; Back to Alchm Kitchen
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-10 shadow-2xl shadow-purple-950/30">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-200 to-orange-300">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-white/50">Last updated: May 9, 2026</p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-white/75">
            <section>
              <h2 className="text-xl font-bold text-white">Use of the service</h2>
              <p className="mt-2">
                Alchm Kitchen provides recipe discovery, meal planning, grocery list,
                restaurant discovery, and culinary recommendation tools. You agree to
                use the service lawfully and not interfere with the site, APIs, or
                other users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Culinary and wellness content</h2>
              <p className="mt-2">
                Recommendations are informational and experimental. They are not
                medical, nutrition, allergy, safety, financial, or professional
                advice. Always verify ingredients, allergens, cooking temperatures,
                and product details before preparing food or purchasing items.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Accounts and purchases</h2>
              <p className="mt-2">
                Some features may require an account or paid access. You are
                responsible for maintaining account security and for reviewing any
                third-party checkout terms before completing a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Rewards and ESMS tokens</h2>
              <p className="mt-2">
                ESMS (Spirit, Essence, Matter, Substance) are closed-loop loyalty
                rewards. They are not cash, not withdrawable, and have no cash
                value. You may redeem ESMS toward food orders with participating
                partners at the published rate, subject to daily and overall
                limits. The current redemption rate and our change policy are on
                the{" "}
                <Link href="/rewards" className="text-amber-300 hover:underline">
                  ESMS Rewards &amp; Redemption
                </Link>{" "}
                page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Third-party services</h2>
              <p className="mt-2">
                The site may link to services such as Amazon, payment processors,
                authentication providers, restaurant data providers, and grocery
                platforms. Those services are governed by their own terms and
                policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Availability and changes</h2>
              <p className="mt-2">
                We may update, remove, or limit features at any time. The service is
                provided as-is, and we do not guarantee uninterrupted availability or
                perfectly accurate recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Contact</h2>
              <p className="mt-2">
                For questions about these terms, contact the Alchm Kitchen operator
                through the contact method listed on the site or associated account
                channels.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
