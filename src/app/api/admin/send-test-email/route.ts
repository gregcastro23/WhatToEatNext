/**
 * Admin API: Send Test Onboarding Email
 *
 * POST /api/admin/send-test-email
 * Body: { to?: string, name?: string, dominantElement?: string, type?: "welcome" | "admin" | "login" }
 *
 * Sends a test welcome or admin-notification email.
 * Protected: requires AUTH_ADMIN_EMAIL or a valid session with admin role.
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import emailService from "@/services/emailService";
import type { NatalChart } from "@/types/natalChart";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Representative sample chart so bulletin previews render the personalized path. */
function sampleChart(dominantElement: string): Partial<NatalChart> {
  const byElement: Record<string, { sun: string; moon: string; asc: string; balance: Record<string, number> }> = {
    Fire: { sun: "aries", moon: "leo", asc: "sagittarius", balance: { Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2 } },
    Water: { sun: "cancer", moon: "pisces", asc: "scorpio", balance: { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.2 } },
    Earth: { sun: "taurus", moon: "capricorn", asc: "virgo", balance: { Fire: 0.15, Water: 0.2, Earth: 0.5, Air: 0.15 } },
    Air: { sun: "gemini", moon: "aquarius", asc: "libra", balance: { Fire: 0.2, Water: 0.15, Earth: 0.15, Air: 0.5 } },
  };
  const s = byElement[dominantElement] || byElement.Fire;
  return {
    dominantElement: dominantElement as NatalChart["dominantElement"],
    dominantModality: "Cardinal",
    elementalBalance: s.balance as unknown as NatalChart["elementalBalance"],
    ascendant: s.asc as NatalChart["ascendant"],
    planetaryPositions: { Sun: s.sun, Moon: s.moon, Ascendant: s.asc } as NatalChart["planetaryPositions"],
    alchemicalProperties: { Spirit: 0.4, Essence: 0.25, Matter: 0.2, Substance: 0.15 },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Admin gate — require a valid session with admin role + allowlisted email.
    const auth = await validateAdminRequest(request);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json().catch(() => ({}));

    const {
      to = "cookingwithcastrollc@gmail.com",
      name = "Greg Castro",
      dominantElement,
      type = "welcome",
    } = body as {
      to?: string;
      name?: string;
      dominantElement?: string;
      type?: "welcome" | "admin" | "login" | "bulletin";
    };

    // Re-check env vars in case they weren't available at module load
    emailService.ensureInitialized();

    if (!emailService.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email service not configured. Set RESEND_API_KEY (preferred) or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.",
          hint: "For Resend: set RESEND_API_KEY and EMAIL_FROM_ADDRESS=noreply@alchm.kitchen",
        },
        { status: 503 },
      );
    }

    let success: boolean;
    if (type === "admin") {
      success = await emailService.sendAdminNotificationEmail(
        to,
        name,
        dominantElement,
      );
    } else if (type === "login") {
      success = await emailService.sendLoginNotificationEmail(to, name, true);
    } else if (type === "bulletin") {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alchm.kitchen";
      success = await emailService.sendBulletinEmail(
        to,
        name,
        dominantElement ? sampleChart(dominantElement) : undefined,
        { unsubscribeUrl: `${appUrl}/profile` },
      );
    } else {
      success = await emailService.sendWelcomeEmail(to, name, dominantElement);
    }

    if (success) {
      console.log(`[test-email] ${type} email sent successfully to ${to}`);
      return NextResponse.json({
        success: true,
        message: `${type} email sent to ${to}`,
        to,
        type,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Email sending failed. Check SMTP credentials and server logs.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[test-email] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/** Health check — returns email service configuration status */
export async function GET() {
  emailService.ensureInitialized();
  return NextResponse.json({
    configured: emailService.isConfigured(),
    message: emailService.isConfigured()
      ? "Email service is ready. POST to this endpoint to send a test email."
      : "Email service not configured. Set RESEND_API_KEY (preferred) or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.",
    example: {
      method: "POST",
      body: {
        to: "cookingwithcastrollc@gmail.com",
        name: "Greg Castro",
        dominantElement: "Fire",
        type: "welcome",
      },
    },
  });
}
