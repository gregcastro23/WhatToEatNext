/**
 * Email Service
 * Primary: Resend API (via RESEND_API_KEY)
 * Fallback: Nodemailer SMTP (via SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private resendApiKey: string | null = null;
  private smtpTransporter: Transporter | null = null;
  private fromName: string = "alchm.kitchen";
  private fromAddress: string = "noreply@alchm.kitchen";

  /**
   * Initialize the email service.
   * Prefers Resend API key; falls back to SMTP/nodemailer.
   */
  initialize() {
    this.fromName = process.env.EMAIL_FROM_NAME || "alchm.kitchen";
    this.fromAddress =
      process.env.EMAIL_FROM_ADDRESS || "noreply@alchm.kitchen";

    // 1. Try Resend first
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      this.resendApiKey = resendKey;
      console.log(
        `Email service initialized with Resend (from: ${this.fromAddress})`,
      );
      return;
    }

    // 2. Fall back to SMTP / nodemailer
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port && user && pass) {
      const portNum = parseInt(port, 10);
      this.smtpTransporter = nodemailer.createTransport({
        host,
        port: portNum,
        secure: portNum === 465,
        auth: { user, pass },
      });
      console.log(
        `Email service initialized with SMTP (${host}:${port}, from: ${this.fromAddress})`,
      );
      return;
    }

    console.warn(
      "Email service not configured. Set RESEND_API_KEY (preferred) or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.",
    );
  }

  /**
   * Check if email service is configured and ready
   */
  isConfigured(): boolean {
    return this.resendApiKey !== null || this.smtpTransporter !== null;
  }

  /**
   * Send an email via the configured provider
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (this.resendApiKey) {
      return this.sendViaResend(options);
    }
    if (this.smtpTransporter) {
      return this.sendViaSMTP(options);
    }
    console.error("Email service not configured. Cannot send email.");
    return false;
  }

  /** Send via Resend REST API (no SDK needed) */
  private async sendViaResend(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromAddress}>`,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(`Resend API error (${response.status}): ${body}`);
        return false;
      }

      const result = await response.json();
      console.log("Email sent via Resend:", result.id);
      return true;
    } catch (error) {
      console.error("Error sending email via Resend:", error);
      return false;
    }
  }

  /** Send via nodemailer SMTP */
  private async sendViaSMTP(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.smtpTransporter!.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      console.log("Email sent via SMTP:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email via SMTP:", error);
      return false;
    }
  }

  /**
   * Send welcome/onboarding email to new user
   */
  async sendWelcomeEmail(
    to: string,
    name: string,
    dominantElement?: string,
  ): Promise<boolean> {
    const subject = "Welcome to alchm.kitchen — A Personal Note from Greg Castro";

    const html = this.getWelcomeEmailTemplate(name, dominantElement);
    const text = this.getWelcomeEmailText(name, dominantElement);

    return this.sendEmail({ to, subject, html, text });
  }

  /**
   * Send admin notification email when a new user signs up.
   * Sends to all configured notification recipients so the team
   * has a running list of registered users.
   */
  async sendAdminNotificationEmail(
    userEmail: string,
    userName: string,
    dominantElement?: string,
  ): Promise<boolean> {
    const notificationRecipients = [
      "xalchm@gmail.com",
      "cookingwithcastrollc@gmail.com",
    ];
    const subject = `New User Registration: ${userName} on alchm.kitchen`;

    const html = this.getAdminNotificationTemplate(
      userEmail,
      userName,
      dominantElement,
    );
    const text = this.getAdminNotificationText(
      userEmail,
      userName,
      dominantElement,
    );

    const results = await Promise.allSettled(
      notificationRecipients.map((recipient) =>
        this.sendEmail({ to: recipient, subject, html, text }),
      ),
    );

    const allSucceeded = results.every(
      (r) => r.status === "fulfilled" && r.value === true,
    );
    if (!allSucceeded) {
      const failed = results
        .map((r, i) => (r.status === "rejected" || (r.status === "fulfilled" && !r.value)) ? notificationRecipients[i] : null)
        .filter(Boolean);
      console.warn(`Registration notification failed for: ${failed.join(", ")}`);
    }

    return allSucceeded;
  }

  /**
   * Get HTML template for welcome email — personal note from Greg Castro
   */
  private getWelcomeEmailTemplate(
    name: string,
    dominantElement?: string,
  ): string {
    const elementEmojis: Record<string, string> = {
      Fire: "🔥",
      Water: "💧",
      Earth: "🌍",
      Air: "💨",
    };

    const elementColors: Record<string, string> = {
      Fire: "#ef4444",
      Water: "#3b82f6",
      Earth: "#22c55e",
      Air: "#a855f7",
    };

    const elementIcon = dominantElement
      ? elementEmojis[dominantElement] || "✨"
      : "✨";
    const elementColor = dominantElement
      ? elementColors[dominantElement] || "#8b5cf6"
      : "#8b5cf6";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alchm.kitchen";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to alchm.kitchen</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 620px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a0533 0%, #4c1d95 50%, #78350f 100%); border-radius: 16px 16px 0 0; padding: 48px 36px; text-align: center;">
      <div style="font-size: 42px; margin-bottom: 12px;">🜂 🜄 🜃 🜁</div>
      <h1 style="color: white; margin: 0; font-size: 30px; font-weight: bold; letter-spacing: -0.5px;">
        Welcome to alchm.kitchen ${elementIcon}
      </h1>
      <p style="color: rgba(255,255,255,0.85); margin: 12px 0 0 0; font-size: 16px; font-style: italic;">
        Where Ancient Wisdom Meets the Future of Cuisine
      </p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 44px 36px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.08);">

      <p style="color: #374151; font-size: 16px; line-height: 1.75; margin: 0 0 20px 0;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.75; margin: 0 0 20px 0;">
        My name is <strong>Greg Castro</strong>, and I want to personally welcome you to
        <strong>alchm.kitchen</strong>. That you&apos;re here means everything to me.
      </p>

      <!-- About Greg Section -->
      <div style="background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 22px 24px; margin: 0 0 28px 0; border-radius: 0 8px 8px 0;">
        <p style="color: #1f2937; font-size: 15px; font-weight: 700; margin: 0 0 10px 0;">👨‍🍳 A Note From the Chef</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.75; margin: 0 0 12px 0;">
          I&apos;ve spent my career in professional kitchens — trained classically, worked across
          cultures, and cooked for people from every walk of life. Through all of it, one truth
          stood out above all others: <strong>food is the most intimate expression of care we
          have for one another.</strong>
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.75; margin: 0;">
          I believe — deeply — that <em>everyone</em> should be able to cook for themselves and
          the people around them. Not just survive, but truly nourish. That conviction is what
          drove me to build alchm.kitchen.
        </p>
      </div>

      <!-- Mission Section -->
      <div style="background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%); border: 1px solid #fbbf24; padding: 24px 26px; margin: 0 0 28px 0; border-radius: 12px;">
        <h2 style="color: #92400e; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
          🌍 Our Mission: Preserving Humanity&apos;s Most Precious Legacy
        </h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.75; margin: 0 0 14px 0;">
          Culinary knowledge is the most precious legacy of humanity — a living thread connecting
          every generation, every culture, every grandmother who ever knew exactly what you needed
          before you did. Recipes, techniques, flavor wisdom, the memory of a meal — these are not
          just food. They are <strong>who we are.</strong>
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.75; margin: 0;">
          alchm.kitchen exists to <strong>preserve, celebrate, and evolve</strong> that knowledge —
          making it accessible to everyone, personalized to each individual, and connected to the
          natural rhythms of the cosmos that humanity has always cooked by.
        </p>
      </div>

      <!-- Technology Section -->
      <h2 style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0 0 14px 0;">
        🔭 Our Technology
      </h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.75; margin: 0 0 14px 0;">
        We combine three ancient systems — <strong>astrology</strong>, <strong>alchemy</strong>, and
        <strong>elemental philosophy</strong> — with NASA-precision planetary calculations and
        modern AI to create something entirely new:
      </p>
      <ul style="color: #374151; font-size: 15px; line-height: 1.85; margin: 0 0 24px 0; padding-left: 22px;">
        <li><strong>Your Natal Chart</strong> — analyzed to reveal your elemental nature and alchemical profile</li>
        <li><strong>Real-Time Planetary Positions</strong> — Swiss Ephemeris precision (sub-arcsecond accuracy) powering every recommendation</li>
        <li><strong>ESMS Alchemical System</strong> — Spirit, Essence, Matter &amp; Substance mapped to foods, cuisines, and cooking methods</li>
        <li><strong>14 Alchemical Pillars</strong> — cooking transformations that align your methods with the cosmos</li>
        <li><strong>Elemental Harmony Scoring</strong> — every ingredient rated for Fire, Water, Earth, and Air compatibility</li>
      </ul>

      ${
        dominantElement
          ? `
      <div style="background: linear-gradient(135deg, ${elementColor}12 0%, ${elementColor}22 100%); border-left: 4px solid ${elementColor}; padding: 20px 22px; margin: 0 0 28px 0; border-radius: 0 8px 8px 0;">
        <p style="color: #1f2937; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
          ${elementIcon} Your Dominant Element: <span style="color: ${elementColor};">${dominantElement}</span>
        </p>
        <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.7;">
          Your natal chart reveals a strong ${dominantElement} signature. Every recommendation you
          receive is tuned to this energy — from the cuisines you&apos;ll find most nourishing, to
          the ingredients and cooking methods that will serve you best today.
        </p>
      </div>
      `
          : ""
      }

      <!-- Vision Section -->
      <h2 style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0 0 14px 0;">
        🚀 The Ultimate Companion for the Future of Cuisine
      </h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.75; margin: 0 0 16px 0;">
        alchm.kitchen is designed to be <em>the</em> companion for your entire culinary life — not
        just recommendations, but a full kitchen intelligence:
      </p>

      <div style="display: grid; gap: 12px; margin: 0 0 28px 0;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 18px; border-radius: 10px;">
          <p style="margin: 0; font-size: 15px; color: #1f2937;">
            📅 <strong>Meal Planning</strong> — Plan your week aligned with your chart, the season,
            and the planetary weather. Never wonder "what&apos;s for dinner?" again.
          </p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 18px; border-radius: 10px;">
          <p style="margin: 0; font-size: 15px; color: #1f2937;">
            🧺 <strong>Inventory &amp; Pantry Tracking</strong> — Know what you have, what you need,
            and never waste an ingredient that could have been a perfect dish.
          </p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 18px; border-radius: 10px;">
          <p style="margin: 0; font-size: 15px; color: #1f2937;">
            🛒 <strong>Smart Ingredient Ordering</strong> — Get exactly what you need, sourced for
            quality and aligned with your nutritional and elemental profile.
          </p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 18px; border-radius: 10px;">
          <p style="margin: 0; font-size: 15px; color: #1f2937;">
            🍜 <strong>Restaurant Discovery</strong> — For those nights when nobody wants to cook,
            discover nearby restaurants offering authentic, delicious, healthy cuisine that matches
            your individual nutritional needs and taste preferences — no matter how specific.
          </p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 18px; border-radius: 10px;">
          <p style="margin: 0; font-size: 15px; color: #1f2937;">
            👨‍👩‍👧‍👦 <strong>Group Dining</strong> — Invite friends and family for shared,
            group-optimized recommendations that honor everyone&apos;s chart and dietary needs.
          </p>
        </div>
      </div>

      <!-- Start Exploring -->
      <h2 style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0 0 14px 0;">
        ✨ Begin Your Journey
      </h2>
      <ul style="color: #374151; font-size: 15px; line-height: 1.9; margin: 0 0 28px 0; padding-left: 22px;">
        <li><strong>Your Profile</strong> — your elemental affinities, alchemical properties, and personalized chart</li>
        <li><strong>Cuisine Recommendations</strong> — what to eat right now, based on real planetary positions</li>
        <li><strong>Ingredients</strong> — discover which foods are most harmonious with your nature</li>
        <li><strong>Cooking Methods</strong> — learn which techniques amplify your food&apos;s elemental power</li>
      </ul>

      <div style="text-align: center; margin: 0 0 32px 0;">
        <a href="${appUrl}/profile"
           style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px;">
          Explore Your Profile →
        </a>
      </div>

      <!-- Social CTA -->
      <div style="background: linear-gradient(135deg, #fef3c710 0%, #ede9fe30 100%); border: 1px solid #e5e7eb; padding: 20px 22px; margin: 0 0 28px 0; border-radius: 12px;">
        <p style="color: #1f2937; font-size: 15px; font-weight: 700; margin: 0 0 8px 0;">
          📸 Share What You Create!
        </p>
        <p style="color: #374151; font-size: 14px; line-height: 1.7; margin: 0;">
          When you cook something extraordinary, share it! Tag your meals, your chart insights, your
          kitchen experiments. Use <strong>#alchmkitchen</strong> — let&apos;s build a community
          around intentional, joyful cooking together.
        </p>
      </div>

      <p style="color: #374151; font-size: 15px; line-height: 1.75; margin: 0 0 6px 0;">
        I&apos;m honored you&apos;re here. If you ever have questions, ideas, or just want to share
        something delicious you made, reach out — I read every message personally.
      </p>

      <p style="color: #374151; font-size: 15px; line-height: 1.75; margin: 0 0 28px 0;">
        Email us anytime:
        <a href="mailto:cookingwithcastrollc@gmail.com" style="color: #7c3aed; font-weight: 600; text-decoration: none;">cookingwithcastrollc@gmail.com</a>
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.75; margin: 0;">
        With gratitude and good food,<br>
        <strong style="font-size: 17px;">Greg Castro</strong><br>
        <span style="color: #6b7280; font-size: 14px;">Chef &amp; Founder, alchm.kitchen<br>
        Cooking With Castrol LLC</span>
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 28px 20px 0 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        You&apos;re receiving this email because you joined alchm.kitchen.
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
        © ${new Date().getFullYear()} alchm.kitchen — Cooking With Castrol LLC. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Get plain text version of welcome email — personal note from Greg Castro
   */
  private getWelcomeEmailText(name: string, dominantElement?: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alchm.kitchen";
    return `
Welcome to alchm.kitchen — A Personal Note from Greg Castro

Hi ${name},

My name is Greg Castro, and I want to personally welcome you to alchm.kitchen. That you're here means everything to me.

--- A NOTE FROM THE CHEF ---

I've spent my career in professional kitchens — trained classically, worked across cultures, and cooked for people from every walk of life. Through all of it, one truth stood out above all others: food is the most intimate expression of care we have for one another.

I believe — deeply — that everyone should be able to cook for themselves and the people around them. Not just survive, but truly nourish. That conviction is what drove me to build alchm.kitchen.

--- OUR MISSION: PRESERVING HUMANITY'S MOST PRECIOUS LEGACY ---

Culinary knowledge is the most precious legacy of humanity — a living thread connecting every generation, every culture, every grandmother who ever knew exactly what you needed before you did. Recipes, techniques, flavor wisdom, the memory of a meal — these are not just food. They are who we are.

alchm.kitchen exists to preserve, celebrate, and evolve that knowledge — making it accessible to everyone, personalized to each individual, and connected to the natural rhythms of the cosmos that humanity has always cooked by.

--- OUR TECHNOLOGY ---

We combine astrology, alchemy, and elemental philosophy with NASA-precision planetary calculations to create something entirely new:

- Your Natal Chart — analyzed to reveal your elemental nature and alchemical profile
- Real-Time Planetary Positions — Swiss Ephemeris precision powering every recommendation
- ESMS Alchemical System — Spirit, Essence, Matter & Substance mapped to foods and cooking
- 14 Alchemical Pillars — cooking transformations aligned with the cosmos
- Elemental Harmony Scoring — every ingredient rated for Fire, Water, Earth, and Air

${dominantElement ? `YOUR DOMINANT ELEMENT: ${dominantElement}\n\nYour natal chart reveals a strong ${dominantElement} signature. Every recommendation is tuned to this energy — cuisines, ingredients, and cooking methods that serve you best today.\n\n` : ""}--- THE ULTIMATE COMPANION FOR THE FUTURE OF CUISINE ---

alchm.kitchen is designed to be THE companion for your entire culinary life:

- MEAL PLANNING: Plan your week aligned with your chart, the season, and planetary weather.
- INVENTORY & PANTRY TRACKING: Know what you have, what you need, never waste an ingredient.
- SMART INGREDIENT ORDERING: Get exactly what you need, aligned with your nutritional profile.
- RESTAURANT DISCOVERY: For nights when nobody wants to cook — find nearby restaurants with authentic, healthy cuisine that matches your individual nutritional needs and taste preferences, no matter how specific.
- GROUP DINING: Group-optimized recommendations that honor everyone's chart and dietary needs.

--- BEGIN YOUR JOURNEY ---

Visit your profile: ${appUrl}/profile

- Your Profile — elemental affinities, alchemical properties, and your personalized chart
- Cuisine Recommendations — what to eat right now, based on real planetary positions
- Ingredients — discover foods most harmonious with your nature
- Cooking Methods — techniques that amplify your food's elemental power

Share What You Create! Use #alchmkitchen on social media to join our community.

---

I'm honored you're here. If you ever have questions, ideas, or want to share something delicious you made, reach out — I read every message personally.

Email: cookingwithcastrollc@gmail.com

With gratitude and good food,
Greg Castro
Chef & Founder, alchm.kitchen
Cooking With Castrol LLC

---
You're receiving this email because you joined alchm.kitchen.
© ${new Date().getFullYear()} alchm.kitchen — Cooking With Castrol LLC. All rights reserved.
    `.trim();
  }

  /**
   * Get HTML template for admin notification email
   */
  private getAdminNotificationTemplate(
    userEmail: string,
    userName: string,
    dominantElement?: string,
  ): string {
    const elementEmojis: Record<string, string> = {
      Fire: "🔥",
      Water: "💧",
      Earth: "🌍",
      Air: "💨",
    };

    const elementIcon = dominantElement
      ? elementEmojis[dominantElement] || "✨"
      : "✨";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New User Signup - alchm.kitchen</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">
        New User Signup ${elementIcon}
      </h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 18px;">
        alchm.kitchen Admin Notification
      </p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        A new user has registered and completed onboarding on alchm.kitchen:
      </p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #1f2937; font-size: 16px; margin: 0 0 10px 0;">
          <strong>Name:</strong> ${userName}
        </p>
        <p style="color: #1f2937; font-size: 16px; margin: 0 0 10px 0;">
          <strong>Email:</strong> <a href="mailto:${userEmail}" style="color: #7c3aed;">${userEmail}</a>
        </p>
        <p style="color: #1f2937; font-size: 16px; margin: 0 0 10px 0;">
          <strong>Registered:</strong> ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
        </p>
        ${
          dominantElement
            ? `
        <p style="color: #1f2937; font-size: 16px; margin: 0;">
          <strong>Dominant Element:</strong> ${elementIcon} ${dominantElement}
        </p>
        `
            : ""
        }
      </div>

      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
        The user has been added to the system and their natal chart has been calculated.
        You can reach them at <a href="mailto:${userEmail}" style="color: #7c3aed;">${userEmail}</a>.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile"
           style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View User Profile
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
        This is an automated notification from alchm.kitchen.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 20px 0 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} alchm.kitchen. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Get plain text version of admin notification email
   */
  private getAdminNotificationText(
    userEmail: string,
    userName: string,
    dominantElement?: string,
  ): string {
    return `
New User Registration - alchm.kitchen

A new user has registered and completed onboarding on alchm.kitchen:

Name: ${userName}
Email: ${userEmail}
Registered: ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
${dominantElement ? `Dominant Element: ${dominantElement}\n` : ""}
The user has been added to the system and their natal chart has been calculated.
You can reach them at ${userEmail}.

View Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin

This is an automated notification from alchm.kitchen.

© ${new Date().getFullYear()} alchm.kitchen. All rights reserved.
    `.trim();
  }

  /**
   * Verify email service connectivity
   */
  async verifyConnection(): Promise<boolean> {
    if (this.resendApiKey) {
      try {
        const res = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${this.resendApiKey}` },
        });
        console.log(
          res.ok
            ? "Resend API connection verified"
            : `Resend API verification failed (${res.status})`,
        );
        return res.ok;
      } catch (error) {
        console.error("Resend API verification failed:", error);
        return false;
      }
    }

    if (this.smtpTransporter) {
      try {
        await this.smtpTransporter.verify();
        console.log("SMTP connection verified successfully");
        return true;
      } catch (error) {
        console.error("SMTP connection verification failed:", error);
        return false;
      }
    }

    console.error("Email service not configured");
    return false;
  }
}

// Create singleton instance
const emailService = new EmailService();

// Initialize on module load
emailService.initialize();

export default emailService;
