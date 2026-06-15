import Link from "next/link";
import { esmsRestaurantCentsPerToken } from "@/lib/payments/restaurantEsms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ESMS Rewards & Redemption | Alchm Kitchen",
  description:
    "How ESMS tokens work, the food redemption rate, and our redemption-rate change policy.",
};

// Render the published rate from the same config the checkout uses, so the
// disclosure can never drift from what is actually charged. When the rate is
// not configured (the feature is off), we say so plainly rather than implying
// a value.
function formatRate(centsPerToken: number): string | null {
  if (!Number.isInteger(centsPerToken) || centsPerToken <= 0) return null;
  const dollars = centsPerToken / 100;
  // 1¢ → "$0.01"; keep it exact for small integer-cent rates.
  return `$${dollars.toFixed(2)}`;
}

export default function RewardsPage() {
  const centsPerToken = esmsRestaurantCentsPerToken();
  const rate = formatRate(centsPerToken);

  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Link href="/" className="text-sm text-white/60 hover:text-amber-300">
          &larr; Back to Alchm Kitchen
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-10 shadow-2xl shadow-purple-950/30">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
            Rewards
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-200 to-orange-300">
            ESMS Rewards &amp; Redemption
          </h1>
          <p className="mt-3 text-sm text-white/50">Last updated: June 14, 2026</p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-white/75">
            <section>
              <h2 className="text-xl font-bold text-white">
                What ESMS tokens are
              </h2>
              <p className="mt-2">
                ESMS (Spirit, Essence, Matter, Substance) are loyalty tokens you
                earn for using Alchm Kitchen — daily rituals, quests, streaks,
                and onboarding. They are <strong>closed-loop rewards</strong>:
                they unlock features and can be redeemed toward the cost of food
                orders with participating restaurant partners.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">
                Food redemption rate
              </h2>
              {rate ? (
                <p className="mt-2">
                  The current redemption rate is{" "}
                  <strong className="text-amber-200">
                    1 ESMS token = {rate}
                  </strong>{" "}
                  of food value ({centsPerToken}
                  ¢ per token). At checkout we convert your order total into an
                  equal four-axis basket (Spirit / Essence / Matter / Substance)
                  rounded up to whole tokens, and debit that basket from your
                  balance. The restaurant is paid the order total in USD.
                </p>
              ) : (
                <p className="mt-2">
                  ESMS food redemption is not currently enabled. When it is, the
                  exact redemption rate will be published here before you can
                  rely on it.
                </p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">
                Not a cash equivalent
              </h2>
              <p className="mt-2">
                ESMS is food value within Alchm Kitchen only. ESMS is{" "}
                <strong>not withdrawable cash or USDC</strong>, is not redeemable
                for money, has no cash surrender value, and cannot be transferred
                or sold. Daily and overall redemption limits may apply. If you
                want to pay with cryptocurrency, use the USDC checkout option,
                which is separate from ESMS rewards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">
                Changes to this program
              </h2>
              <p className="mt-2">
                We will publish the current redemption rate on this page and give
                reasonable advance notice here before reducing the value of ESMS
                you have already earned, consistent with consumer-rewards
                guidance. We may end or change the program, or adjust earning and
                redemption rules, including for fraud prevention or to keep the
                program sustainable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white">Related</h2>
              <p className="mt-2">
                See our{" "}
                <Link href="/terms" className="text-amber-300 hover:underline">
                  Terms of Service
                </Link>
                . For questions, contact the Alchm Kitchen operator through the
                contact method listed on the site or your account channels.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
