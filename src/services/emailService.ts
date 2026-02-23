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
    const subject = "Welcome to alchm.kitchen! 🔮";

    const html = this.getWelcomeEmailTemplate(name, dominantElement);
    const text = this.getWelcomeEmailText(name, dominantElement);

    return this.sendEmail({ to, subject, html, text });
  }

  /**
   * Send admin notification email when a new user signs up
   */
  async sendAdminNotificationEmail(
    userEmail: string,
    userName: string,
    dominantElement?: string,
  ): Promise<boolean> {
    const adminEmail = "xalchm@gmail.com";
    const subject = `New User Signup: ${userName} on alchm.kitchen`;

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

    return this.sendEmail({ to: adminEmail, subject, html, text });
  }

  /**
   * Get HTML template for welcome email
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
    <!-- Header with Gradient -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">
        Welcome to alchm.kitchen! ${elementIcon}
      </h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 18px;">
        Your Alchemical Culinary Journey Begins
      </p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for joining alchm.kitchen! We're excited to help you discover personalized food recommendations based on your unique astrological and alchemical profile.
      </p>

      ${
        dominantElement
          ? `
      <div style="background: linear-gradient(135deg, ${elementColor}10 0%, ${elementColor}20 100%); border-left: 4px solid ${elementColor}; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">
          ${elementIcon} Your Dominant Element: <span style="color: ${elementColor};">${dominantElement}</span>
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0; line-height: 1.5;">
          We've calculated your natal chart and discovered your elemental affinity. This will help us recommend dishes that resonate with your unique energy.
        </p>
      </div>
      `
          : ""
      }

      <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 30px 0 15px 0;">
        What's Next?
      </h2>

      <ul style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
        <li><strong>Explore Your Profile:</strong> View your elemental affinities and personalization insights</li>
        <li><strong>Set Your Preferences:</strong> Tell us about your favorite cuisines and dietary restrictions</li>
        <li><strong>Get Recommendations:</strong> Discover dishes aligned with your astrological profile</li>
        <li><strong>Create Dining Groups:</strong> Add friends and family for group-optimized recommendations</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile"
           style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Your Profile
        </a>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0 0 0;">
        <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
          <strong>🔮 About Our Alchemical System:</strong><br>
          alchm.kitchen uses a unique combination of astrological data and alchemical principles to create personalized culinary recommendations. Your preferences are analyzed through elemental properties (Fire, Water, Earth, Air) and planetary positions to find dishes that truly match your taste.
        </p>
      </div>

      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
        We're here to help you discover your next favorite meal!
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 10px 0 0 0;">
        Happy exploring,<br>
        <strong>The alchm.kitchen Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 20px 0 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        You're receiving this email because you signed up for alchm.kitchen.
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
        © ${new Date().getFullYear()} alchm.kitchen. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Get plain text version of welcome email
   */
  private getWelcomeEmailText(name: string, dominantElement?: string): string {
    return `
Welcome to alchm.kitchen!

Hi ${name},

Thank you for joining alchm.kitchen! We're excited to help you discover personalized food recommendations based on your unique astrological and alchemical profile.

${dominantElement ? `Your Dominant Element: ${dominantElement}\n\nWe've calculated your natal chart and discovered your elemental affinity. This will help us recommend dishes that resonate with your unique energy.\n` : ""}
What's Next?

- Explore Your Profile: View your elemental affinities and personalization insights
- Set Your Preferences: Tell us about your favorite cuisines and dietary restrictions
- Get Recommendations: Discover dishes aligned with your astrological profile
- Create Dining Groups: Add friends and family for group-optimized recommendations

About Our Alchemical System:
alchm.kitchen uses a unique combination of astrological data and alchemical principles to create personalized culinary recommendations. Your preferences are analyzed through elemental properties (Fire, Water, Earth, Air) and planetary positions to find dishes that truly match your taste.

We're here to help you discover your next favorite meal!

Happy exploring,
The alchm.kitchen Team

---
You're receiving this email because you signed up for alchm.kitchen.
© ${new Date().getFullYear()} alchm.kitchen. All rights reserved.
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
        A new user has completed onboarding on alchm.kitchen:
      </p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #1f2937; font-size: 16px; margin: 0 0 10px 0;">
          <strong>Name:</strong> ${userName}
        </p>
        <p style="color: #1f2937; font-size: 16px; margin: 0 0 10px 0;">
          <strong>Email:</strong> ${userEmail}
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
New User Signup - alchm.kitchen

A new user has completed onboarding on alchm.kitchen:

Name: ${userName}
Email: ${userEmail}
${dominantElement ? `Dominant Element: ${dominantElement}\n` : ""}

The user has been added to the system and their natal chart has been calculated.

View User Profile: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile

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

// Email service is currently disabled.
// To re-enable, uncomment the line below and configure SMTP_* env variables.
// emailService.initialize();

export default emailService;
