#!/usr/bin/env node
/**
 * Test Email Script
 *
 * Sends a test onboarding welcome email directly via SMTP.
 * Run with environment variables set:
 *
 *   SMTP_HOST=smtp.gmail.com \
 *   SMTP_PORT=587 \
 *   SMTP_USER=your@gmail.com \
 *   SMTP_PASS=your-app-password \
 *   node scripts/send-test-email.cjs [to-email] [name] [dominantElement]
 *
 * Example:
 *   SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=xalchm@gmail.com SMTP_PASS=xxxx \
 *   node scripts/send-test-email.cjs cookingwithcastrollc@gmail.com "Greg Castro" Fire
 */

"use strict";

const nodemailer = require("nodemailer");

const toEmail = process.argv[2] || "cookingwithcastrollc@gmail.com";
const userName = process.argv[3] || "Greg";
const dominantElement = process.argv[4] || undefined;

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM_NAME = "alchm.kitchen",
  EMAIL_FROM_ADDRESS = "noreply@alchm.kitchen",
  NEXT_PUBLIC_APP_URL = "https://alchm.kitchen",
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.error(
    "ERROR: Missing SMTP environment variables.\n" +
    "Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS\n\n" +
    "Example:\n" +
    "  SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=you@gmail.com SMTP_PASS=app-password \\\n" +
    "  node scripts/send-test-email.cjs cookingwithcastrollc@gmail.com 'Greg Castro' Fire"
  );
  process.exit(1);
}

const port = parseInt(SMTP_PORT, 10);
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const elementEmojis = { Fire: "🔥", Water: "💧", Earth: "🌍", Air: "💨" };
const elementColors = { Fire: "#ef4444", Water: "#3b82f6", Earth: "#22c55e", Air: "#a855f7" };
const elementIcon = dominantElement ? (elementEmojis[dominantElement] || "✨") : "✨";
const elementColor = dominantElement ? (elementColors[dominantElement] || "#8b5cf6") : "#8b5cf6";
const year = new Date().getFullYear();

const elementBlock = dominantElement ? `
      <div style="background: linear-gradient(135deg, ${elementColor}12 0%, ${elementColor}22 100%); border-left: 4px solid ${elementColor}; padding: 20px 22px; margin: 0 0 28px 0; border-radius: 0 8px 8px 0;">
        <p style="color: #1f2937; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
          ${elementIcon} Your Dominant Element: <span style="color: ${elementColor};">${dominantElement}</span>
        </p>
        <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.7;">
          Your natal chart reveals a strong ${dominantElement} signature. Every recommendation is tuned to this energy.
        </p>
      </div>` : "";

const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to alchm.kitchen</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f9fafb;">
<div style="max-width:620px;margin:0 auto;padding:40px 20px;">

  <div style="background:linear-gradient(135deg,#1a0533 0%,#4c1d95 50%,#78350f 100%);border-radius:16px 16px 0 0;padding:48px 36px;text-align:center;">
    <div style="font-size:42px;margin-bottom:12px;">🜂 🜄 🜃 🜁</div>
    <h1 style="color:white;margin:0;font-size:30px;font-weight:bold;">Welcome to alchm.kitchen ${elementIcon}</h1>
    <p style="color:rgba(255,255,255,0.85);margin:12px 0 0;font-size:16px;font-style:italic;">Where Ancient Wisdom Meets the Future of Cuisine</p>
  </div>

  <div style="background:white;padding:44px 36px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.08);">
    <p style="color:#374151;font-size:16px;line-height:1.75;margin:0 0 20px;">Hi <strong>${userName}</strong>,</p>
    <p style="color:#374151;font-size:16px;line-height:1.75;margin:0 0 20px;">
      My name is <strong>Greg Castro</strong>, and I want to personally welcome you to <strong>alchm.kitchen</strong>. That you're here means everything to me.
    </p>

    <div style="background:#faf5ff;border-left:4px solid #8b5cf6;padding:22px 24px;margin:0 0 28px;border-radius:0 8px 8px 0;">
      <p style="color:#1f2937;font-size:15px;font-weight:700;margin:0 0 10px;">👨‍🍳 A Note From the Chef</p>
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 12px;">
        I've spent my career in professional kitchens — trained classically, worked across cultures, and cooked for people from every walk of life. Through all of it, one truth stood out: <strong>food is the most intimate expression of care we have for one another.</strong>
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0;">
        I believe everyone should be able to cook for themselves and the people around them. Not just survive, but truly nourish. That conviction is what drove me to build alchm.kitchen.
      </p>
    </div>

    <div style="background:linear-gradient(135deg,#fff7ed 0%,#fef3c7 100%);border:1px solid #fbbf24;padding:24px 26px;margin:0 0 28px;border-radius:12px;">
      <h2 style="color:#92400e;font-size:18px;font-weight:700;margin:0 0 12px;">🌍 Our Mission: Preserving Humanity's Most Precious Legacy</h2>
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 14px;">
        Culinary knowledge is the most precious legacy of humanity — a living thread connecting every generation, every culture, every grandmother who ever knew exactly what you needed before you did. Recipes, techniques, flavor wisdom, the memory of a meal — these are not just food. They are <strong>who we are.</strong>
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0;">
        alchm.kitchen exists to <strong>preserve, celebrate, and evolve</strong> that knowledge — making it accessible to everyone, personalized to each individual, and connected to the natural rhythms of the cosmos.
      </p>
    </div>

    <h2 style="color:#1f2937;font-size:18px;font-weight:700;margin:0 0 14px;">🔭 Our Technology</h2>
    <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 14px;">
      We combine <strong>astrology</strong>, <strong>alchemy</strong>, and <strong>elemental philosophy</strong> with NASA-precision planetary calculations:
    </p>
    <ul style="color:#374151;font-size:15px;line-height:1.85;margin:0 0 24px;padding-left:22px;">
      <li><strong>Your Natal Chart</strong> — your elemental nature and alchemical profile</li>
      <li><strong>Real-Time Planetary Positions</strong> — Swiss Ephemeris precision (sub-arcsecond accuracy)</li>
      <li><strong>ESMS Alchemical System</strong> — Spirit, Essence, Matter &amp; Substance mapped to foods</li>
      <li><strong>14 Alchemical Pillars</strong> — cooking transformations aligned with the cosmos</li>
      <li><strong>Elemental Harmony Scoring</strong> — every ingredient rated for Fire, Water, Earth, and Air</li>
    </ul>

    ${elementBlock}

    <h2 style="color:#1f2937;font-size:18px;font-weight:700;margin:0 0 14px;">🚀 The Ultimate Companion for the Future of Cuisine</h2>
    <div style="display:grid;gap:12px;margin:0 0 28px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px 18px;border-radius:10px;">
        <p style="margin:0;font-size:15px;color:#1f2937;">📅 <strong>Meal Planning</strong> — Plan your week aligned with your chart, the season, and planetary weather.</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px 18px;border-radius:10px;">
        <p style="margin:0;font-size:15px;color:#1f2937;">🧺 <strong>Inventory &amp; Pantry Tracking</strong> — Know what you have, what you need, never waste an ingredient.</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px 18px;border-radius:10px;">
        <p style="margin:0;font-size:15px;color:#1f2937;">🛒 <strong>Smart Ingredient Ordering</strong> — Get exactly what you need, aligned with your nutritional profile.</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px 18px;border-radius:10px;">
        <p style="margin:0;font-size:15px;color:#1f2937;">🍜 <strong>Restaurant Discovery</strong> — For nights when nobody wants to cook, find nearby restaurants with authentic, healthy cuisine that matches your individual nutritional needs and taste preferences — no matter how specific.</p>
      </div>
    </div>

    <div style="text-align:center;margin:0 0 32px;">
      <a href="${NEXT_PUBLIC_APP_URL}/profile" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6 0%,#f59e0b 100%);color:white;text-decoration:none;padding:16px 40px;border-radius:10px;font-weight:700;font-size:16px;">
        Explore Your Profile →
      </a>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 28px;">
      Questions? Ideas? Reach out anytime: <a href="mailto:cookingwithcastrollc@gmail.com" style="color:#7c3aed;font-weight:600;text-decoration:none;">cookingwithcastrollc@gmail.com</a>
    </p>

    <p style="color:#374151;font-size:16px;line-height:1.75;margin:0;">
      With gratitude and good food,<br>
      <strong style="font-size:17px;">Greg Castro</strong><br>
      <span style="color:#6b7280;font-size:14px;">Chef &amp; Founder, alchm.kitchen<br>Cooking With Castrol LLC</span>
    </p>
  </div>

  <div style="text-align:center;padding:28px 20px 0;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">You're receiving this because you joined alchm.kitchen.</p>
    <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">© ${year} alchm.kitchen — Cooking With Castrol LLC. All rights reserved.</p>
  </div>
</div>
</body>
</html>
`.trim();

const text = `
Welcome to alchm.kitchen — A Personal Note from Greg Castro

Hi ${userName},

My name is Greg Castro, and I want to personally welcome you to alchm.kitchen.

I've spent my career in professional kitchens — trained classically, worked across cultures, and cooked for people from every walk of life. I believe everyone should be able to cook for themselves and the people around them. That conviction is what drove me to build alchm.kitchen.

OUR MISSION: Culinary knowledge is the most precious legacy of humanity. alchm.kitchen exists to preserve, celebrate, and evolve that knowledge — making it accessible to everyone, personalized to each individual, and connected to the natural rhythms of the cosmos.

OUR TECHNOLOGY:
- Your Natal Chart — elemental nature and alchemical profile
- Real-Time Planetary Positions — Swiss Ephemeris precision
- ESMS Alchemical System — Spirit, Essence, Matter & Substance mapped to foods
- 14 Alchemical Pillars — cooking transformations
- Elemental Harmony Scoring — Fire, Water, Earth, Air

THE FUTURE OF CUISINE:
- Meal Planning — aligned with your chart and planetary weather
- Inventory & Pantry Tracking — never waste an ingredient
- Smart Ingredient Ordering — aligned with your nutritional profile
- Restaurant Discovery — authentic, healthy options matching your exact needs
- Group Dining — recommendations that honor everyone's chart

Visit your profile: ${NEXT_PUBLIC_APP_URL}/profile

Questions? cookingwithcastrollc@gmail.com

With gratitude,
Greg Castro
Chef & Founder, alchm.kitchen

© ${year} alchm.kitchen — Cooking With Castrol LLC
`.trim();

async function main() {
  console.log(`\nSending test welcome email to: ${toEmail}`);
  console.log(`Name: ${userName}`);
  if (dominantElement) console.log(`Dominant Element: ${dominantElement}`);
  console.log(`\nSMTP: ${SMTP_USER}@${SMTP_HOST}:${port}\n`);

  try {
    await transporter.verify();
    console.log("✓ SMTP connection verified");
  } catch (err) {
    console.error("✗ SMTP connection failed:", err.message);
    console.error("\nCheck your SMTP credentials. For Gmail:");
    console.error("  1. Enable 2-factor authentication");
    console.error("  2. Create an App Password at https://myaccount.google.com/apppasswords");
    console.error("  3. Use that App Password as SMTP_PASS (not your regular password)");
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`,
      to: toEmail,
      subject: "Welcome to alchm.kitchen — A Personal Note from Greg Castro",
      html,
      text,
    });

    console.log(`✓ Email sent successfully!`);
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  To: ${toEmail}`);
    if (info.accepted?.length) console.log(`  Accepted: ${info.accepted.join(", ")}`);
    if (info.rejected?.length) console.log(`  Rejected: ${info.rejected.join(", ")}`);
  } catch (err) {
    console.error("✗ Email sending failed:", err.message);
    process.exit(1);
  }
}

main();
