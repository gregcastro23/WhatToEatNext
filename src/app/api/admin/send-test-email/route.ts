/**
 * Admin API: Send Test Onboarding Email
 *
 * POST /api/admin/send-test-email
 * Body: { to?: string, name?: string, dominantElement?: string, type?: "welcome" | "admin" }
 *
 * Sends a test welcome or admin-notification email.
 * Protected: requires AUTH_ADMIN_EMAIL or a valid session with admin role.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import emailService from "@/services/emailService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ADMIN_EMAILS = ["xalchm@gmail.com", "cookingwithcastrollc@gmail.com"];

export async function POST(request: NextRequest) {
  try {
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
      type?: "welcome" | "admin";
    };

    // Simple admin gate: request must come from an admin email or include the admin secret
    const adminSecret = process.env.ADMIN_SECRET || process.env.AUTH_SECRET;
    const providedSecret = request.headers.get("x-admin-secret");
    const isAuthorized =
      ADMIN_EMAILS.includes(to) ||
      (adminSecret && providedSecret === adminSecret);

    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!emailService.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables.",
          hint: "For Gmail: use smtp.gmail.com:587 with an App Password.",
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
  return NextResponse.json({
    configured: emailService.isConfigured(),
    message: emailService.isConfigured()
      ? "Email service is ready. POST to this endpoint to send a test email."
      : "Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.",
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
