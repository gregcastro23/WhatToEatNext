/**
 * Email Service
 * Handles sending emails using nodemailer
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}

class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;

  /**
   * Initialize the email service with SMTP configuration
   */
  initialize() {
    // Get configuration from environment variables
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const fromName = process.env.EMAIL_FROM_NAME || "alchm.kitchen";
    const fromAddress =
      process.env.EMAIL_FROM_ADDRESS || "noreply@alchm.kitchen";

    // Check if email is configured
    if (!host || !port || !user || !pass) {
      console.warn(
        "Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.",
      );
      return;
    }

    this.config = {
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
      from: {
        name: fromName,
        address: fromAddress,
      },
    };

    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth,
    });

    console.log("Email service initialized successfully");
  }

  /**
   * Check if email service is configured and ready
   */
  isConfigured(): boolean {
    return this.transporter !== null;
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.error("Email service not configured. Cannot send email.");
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.address}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log("Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
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

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to alchm.kitchen</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">
        Welcome to alchm.kitchen ${elementIcon}
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 17px;">
        Your Alchemical Culinary Journey Begins
      </p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.08);">

      <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 18px 0;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 18px 0;">
        My name is <strong>Greg Castro</strong>, and I want to personally thank you for joining
        <strong>alchm.kitchen</strong>. Your interest genuinely means the world to me.
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 18px 0;">
        I built this platform around a simple but powerful idea: <em>the stars have always guided
        what we eat</em>. By weaving together astrological data, alchemical principles, and the
        elemental nature of food, alchm.kitchen gives you personalized culinary recommendations
        that are truly in tune with <strong>who you are</strong> — your birth chart, your dominant
        element, your moment in time.
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        My mission is to help people eat better, cook with intention, and ultimately live with
        more vitality and joy. Food is alchemy — and you are the alchemist.
      </p>

      ${
        dominantElement
          ? `
      <div style="background: linear-gradient(135deg, ${elementColor}12 0%, ${elementColor}22 100%); border-left: 4px solid ${elementColor}; padding: 20px 22px; margin: 0 0 28px 0; border-radius: 8px;">
        <p style="color: #1f2937; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
          ${elementIcon} Your Dominant Element: <span style="color: ${elementColor};">${dominantElement}</span>
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
          Your natal chart reveals a strong ${dominantElement} energy. Use this insight to discover
          cuisines, ingredients, and cooking methods that resonate deeply with your nature.
        </p>
      </div>
      `
          : ""
      }

      <h2 style="color: #1f2937; font-size: 19px; font-weight: 700; margin: 0 0 14px 0;">
        Start Exploring
      </h2>

      <ul style="color: #374151; font-size: 15px; line-height: 1.9; margin: 0 0 28px 0; padding-left: 22px;">
        <li><strong>Your Profile</strong> — explore your elemental affinities and alchemical properties</li>
        <li><strong>Cuisine Recommendations</strong> — discover foods aligned with today's planetary positions</li>
        <li><strong>Ingredients &amp; Cooking Methods</strong> — learn how to cook in harmony with your chart</li>
        <li><strong>Dining Groups</strong> — invite friends and family for shared, group-optimized recommendations</li>
      </ul>

      <!-- Social Media CTA -->
      <div style="background: linear-gradient(135deg, #fef3c710 0%, #ede9fe30 100%); border: 1px solid #e5e7eb; padding: 22px 24px; margin: 0 0 28px 0; border-radius: 12px;">
        <p style="color: #1f2937; font-size: 15px; font-weight: 700; margin: 0 0 8px 0;">
          📸 Share What You Create!
        </p>
        <p style="color: #374151; font-size: 14px; line-height: 1.7; margin: 0;">
          As you cook, learn, and discover new dishes, I'd love for you to share your journey on
          social media. Tag your meals, your chart insights, your experiments in the kitchen.
          Not only does it inspire others — it builds a community around mindful, intentional
          cooking. Use <strong>#alchmkitchen</strong> so we can celebrate your creations together!
        </p>
      </div>

      <div style="text-align: center; margin: 0 0 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://alchm.kitchen"}/profile"
           style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%); color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.2px;">
          Explore Your Profile
        </a>
      </div>

      <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 6px 0;">
        I&apos;m genuinely excited to see how alchm.kitchen improves your cooking and quality
        of life. If you ever have questions, feedback, or just want to share something amazing
        you made, reach out directly — I read every message.
      </p>

      <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 28px 0;">
        Email us anytime at
        <a href="mailto:cookingwithcastrollc@gmail.com" style="color: #7c3aed; font-weight: 600; text-decoration: none;">cookingwithcastrollc@gmail.com</a>
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0;">
        With gratitude and good food,<br>
        <strong style="font-size: 17px;">Greg Castro</strong><br>
        <span style="color: #6b7280; font-size: 14px;">Founder, alchm.kitchen</span>
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 28px 20px 0 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        You&apos;re receiving this email because you signed up for alchm.kitchen.
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
    return `
Welcome to alchm.kitchen — A Personal Note from Greg Castro

Hi ${name},

My name is Greg Castro, and I want to personally thank you for joining alchm.kitchen. Your interest genuinely means the world to me.

I built this platform around a simple but powerful idea: the stars have always guided what we eat. By weaving together astrological data, alchemical principles, and the elemental nature of food, alchm.kitchen gives you personalized culinary recommendations that are truly in tune with who you are — your birth chart, your dominant element, your moment in time.

My mission is to help people eat better, cook with intention, and ultimately live with more vitality and joy. Food is alchemy — and you are the alchemist.

${dominantElement ? `Your Dominant Element: ${dominantElement}\n\nYour natal chart reveals a strong ${dominantElement} energy. Use this insight to discover cuisines, ingredients, and cooking methods that resonate deeply with your nature.\n\n` : ""}Start Exploring:

- Your Profile — explore your elemental affinities and alchemical properties
- Cuisine Recommendations — discover foods aligned with today's planetary positions
- Ingredients & Cooking Methods — learn how to cook in harmony with your chart
- Dining Groups — invite friends and family for shared, group-optimized recommendations

Visit your profile: ${process.env.NEXT_PUBLIC_APP_URL || "https://alchm.kitchen"}/profile

---

Share What You Create!

As you cook, learn, and discover new dishes, I'd love for you to share your journey on social media. Tag your meals, your chart insights, your experiments in the kitchen. Not only does it inspire others — it builds a community around mindful, intentional cooking. Use #alchmkitchen so we can celebrate your creations together!

---

I'm genuinely excited to see how alchm.kitchen improves your cooking and quality of life. If you ever have questions, feedback, or just want to share something amazing you made, reach out directly — I read every message.

Email us anytime at: cookingwithcastrollc@gmail.com

With gratitude and good food,
Greg Castro
Founder, alchm.kitchen

---
You're receiving this email because you signed up for alchm.kitchen.
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
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.error("Email service not configured");
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("SMTP connection verification failed:", error);
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Initialize email service if SMTP env vars are configured
emailService.initialize();

export default emailService;
