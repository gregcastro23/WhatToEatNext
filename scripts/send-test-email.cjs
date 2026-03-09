#!/usr/bin/env node
/**
 * Test Email Script — Resend (primary) or SMTP (fallback)
 *
 * Tests both email types:
 *   1. Welcome email → sent to the specified recipient (simulates new user)
 *   2. Admin notification → sent to xalchm@gmail.com + cookingwithcastrollc@gmail.com
 *
 * ── Resend (recommended, requires verified alchm.kitchen domain) ─────────────
 *   RESEND_API_KEY=re_xxxx node scripts/send-test-email.cjs [to] [name] [element]
 *
 * ── SMTP fallback ─────────────────────────────────────────────────────────────
 *   SMTP_HOST=smtp.gmail.com SMTP_PORT=587 \
 *   SMTP_USER=you@gmail.com SMTP_PASS=app-password \
 *   node scripts/send-test-email.cjs [to] [name] [element]
 *
 * Examples:
 *   RESEND_API_KEY=re_xxxx node scripts/send-test-email.cjs
 *   RESEND_API_KEY=re_xxxx node scripts/send-test-email.cjs xalchm@gmail.com "Greg Castro" Fire
 */

"use strict";

const toEmail = process.argv[2] || "cookingwithcastrollc@gmail.com";
const userName = process.argv[3] || "Greg Castro";
const dominantElement = process.argv[4] || "Fire";

const {
  RESEND_API_KEY,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM_NAME = "alchm.kitchen",
  EMAIL_FROM_ADDRESS = "noreply@alchm.kitchen",
  NEXT_PUBLIC_APP_URL = "https://alchm.kitchen",
} = process.env;

const ADMIN_RECIPIENTS = ["xalchm@gmail.com", "cookingwithcastrollc@gmail.com"];

// ── Template helpers ──────────────────────────────────────────────────────────

const elementEmojis = { Fire: "🔥", Water: "💧", Earth: "🌍", Air: "💨" };
const elementColors = { Fire: "#ef4444", Water: "#3b82f6", Earth: "#22c55e", Air: "#a855f7" };
const elementIcon = elementEmojis[dominantElement] || "✨";
const elementColor = elementColors[dominantElement] || "#8b5cf6";
const year = new Date().getFullYear();

function buildWelcomeHtml(name, element) {
  const icon = elementEmojis[element] || "✨";
  const color = elementColors[element] || "#8b5cf6";
  const elementBlock = element ? `
    <div style="background:linear-gradient(135deg,${color}12 0%,${color}22 100%);border-left:4px solid ${color};padding:20px 22px;margin:0 0 28px;border-radius:0 8px 8px 0;">
      <p style="color:#1f2937;font-size:16px;margin:0 0 8px;font-weight:700;">${icon} Your Dominant Element: <span style="color:${color};">${element}</span></p>
      <p style="color:#4b5563;font-size:14px;margin:0;line-height:1.7;">Your natal chart reveals a strong ${element} signature. Every recommendation is tuned to this energy — cuisines, ingredients, and cooking methods that serve you best today.</p>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Welcome to alchm.kitchen</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f9fafb;">
<div style="max-width:620px;margin:0 auto;padding:40px 20px;">
  <div style="background:linear-gradient(135deg,#1a0533 0%,#4c1d95 50%,#78350f 100%);border-radius:16px 16px 0 0;padding:48px 36px;text-align:center;">
    <div style="font-size:42px;margin-bottom:12px;">🜂 🜄 🜃 🜁</div>
    <h1 style="color:white;margin:0;font-size:30px;font-weight:bold;">Welcome to alchm.kitchen ${icon}</h1>
    <p style="color:rgba(255,255,255,0.85);margin:12px 0 0;font-size:16px;font-style:italic;">Where Ancient Wisdom Meets the Future of Cuisine</p>
  </div>
  <div style="background:white;padding:44px 36px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.08);">
    <p style="color:#374151;font-size:16px;line-height:1.75;margin:0 0 20px;">Hi <strong>${name}</strong>,</p>
    <p style="color:#374151;font-size:16px;line-height:1.75;margin:0 0 20px;">My name is <strong>Greg Castro</strong>, and I want to personally welcome you to <strong>alchm.kitchen</strong>. That you&apos;re here means everything to me.</p>
    <div style="background:#faf5ff;border-left:4px solid #8b5cf6;padding:22px 24px;margin:0 0 28px;border-radius:0 8px 8px 0;">
      <p style="color:#1f2937;font-size:15px;font-weight:700;margin:0 0 10px;">👨‍🍳 A Note From the Chef</p>
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 12px;">I&apos;ve spent my career in professional kitchens — trained classically, worked across cultures, and cooked for people from every walk of life. Through all of it, one truth stood out: <strong>food is the most intimate expression of care we have for one another.</strong></p>
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0;">I believe everyone should be able to cook for themselves and the people around them. Not just survive, but truly nourish. That conviction is what drove me to build alchm.kitchen.</p>
    </div>
    <div style="background:linear-gradient(135deg,#fff7ed 0%,#fef3c7 100%);border:1px solid #fbbf24;padding:24px 26px;margin:0 0 28px;border-radius:12px;">
      <h2 style="color:#92400e;font-size:18px;font-weight:700;margin:0 0 12px;">🌍 Our Mission: Preserving Humanity&apos;s Most Precious Legacy</h2>
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0;">Culinary knowledge is the most precious legacy of humanity. alchm.kitchen exists to <strong>preserve, celebrate, and evolve</strong> that knowledge — making it accessible to everyone, personalized to each individual, and connected to the natural rhythms of the cosmos.</p>
    </div>
    <h2 style="color:#1f2937;font-size:18px;font-weight:700;margin:0 0 14px;">🔭 Our Technology</h2>
    <ul style="color:#374151;font-size:15px;line-height:1.85;margin:0 0 24px;padding-left:22px;">
      <li><strong>Your Natal Chart</strong> — your elemental nature and alchemical profile</li>
      <li><strong>Real-Time Planetary Positions</strong> — Swiss Ephemeris precision (sub-arcsecond accuracy)</li>
      <li><strong>ESMS Alchemical System</strong> — Spirit, Essence, Matter &amp; Substance mapped to foods</li>
      <li><strong>14 Alchemical Pillars</strong> — cooking transformations aligned with the cosmos</li>
      <li><strong>Elemental Harmony Scoring</strong> — every ingredient rated for Fire, Water, Earth, and Air</li>
    </ul>
    ${elementBlock}
    <div style="text-align:center;margin:0 0 32px;">
      <a href="${NEXT_PUBLIC_APP_URL}/profile" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6 0%,#f59e0b 100%);color:white;text-decoration:none;padding:16px 40px;border-radius:10px;font-weight:700;font-size:16px;">Explore Your Profile →</a>
    </div>
    <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 28px;">Questions or ideas? Reach out anytime: <a href="mailto:cookingwithcastrollc@gmail.com" style="color:#7c3aed;font-weight:600;text-decoration:none;">cookingwithcastrollc@gmail.com</a></p>
    <p style="color:#374151;font-size:16px;line-height:1.75;margin:0;">With gratitude and good food,<br><strong style="font-size:17px;">Greg Castro</strong><br><span style="color:#6b7280;font-size:14px;">Chef &amp; Founder, alchm.kitchen<br>Cooking With Castrol LLC</span></p>
  </div>
  <div style="text-align:center;padding:28px 20px 0;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">You&apos;re receiving this because you joined alchm.kitchen.</p>
    <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">© ${year} alchm.kitchen — Cooking With Castrol LLC. All rights reserved.</p>
  </div>
</div>
</body>
</html>`.trim();
}

function buildWelcomeText(name, element) {
  return `Welcome to alchm.kitchen — A Personal Note from Greg Castro

Hi ${name},

My name is Greg Castro, and I want to personally welcome you to alchm.kitchen.

I've spent my career in professional kitchens — trained classically, worked across cultures. Food is the most intimate expression of care we have for one another. That conviction is what drove me to build alchm.kitchen.

OUR MISSION: Culinary knowledge is the most precious legacy of humanity. alchm.kitchen exists to preserve, celebrate, and evolve that knowledge.

${element ? `YOUR DOMINANT ELEMENT: ${element}\nEvery recommendation is tuned to your ${element} signature.\n\n` : ""}OUR TECHNOLOGY:
- Your Natal Chart — elemental nature and alchemical profile
- Real-Time Planetary Positions — Swiss Ephemeris precision
- ESMS Alchemical System — Spirit, Essence, Matter & Substance
- 14 Alchemical Pillars — cooking transformations
- Elemental Harmony Scoring — Fire, Water, Earth, Air

Visit your profile: ${NEXT_PUBLIC_APP_URL}/profile

Questions? cookingwithcastrollc@gmail.com

With gratitude and good food,
Greg Castro
Chef & Founder, alchm.kitchen | Cooking With Castrol LLC

© ${year} alchm.kitchen — All rights reserved.`.trim();
}

function buildAdminHtml(userEmail, name, element) {
  const icon = elementEmojis[element] || "✨";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>New User Signup - alchm.kitchen</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f9fafb;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:linear-gradient(135deg,#8b5cf6 0%,#f59e0b 100%);border-radius:16px 16px 0 0;padding:40px 30px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:32px;font-weight:bold;">New User Signup ${icon}</h1>
    <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:18px;">alchm.kitchen Admin Notification</p>
  </div>
  <div style="background:white;padding:40px 30px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">A new user has registered and completed onboarding on alchm.kitchen:</p>
    <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;">
      <p style="color:#1f2937;font-size:16px;margin:0 0 10px;"><strong>Name:</strong> ${name}</p>
      <p style="color:#1f2937;font-size:16px;margin:0 0 10px;"><strong>Email:</strong> <a href="mailto:${userEmail}" style="color:#7c3aed;">${userEmail}</a></p>
      <p style="color:#1f2937;font-size:16px;margin:0 0 10px;"><strong>Registered:</strong> ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
      ${element ? `<p style="color:#1f2937;font-size:16px;margin:0;"><strong>Dominant Element:</strong> ${icon} ${element}</p>` : ""}
    </div>
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:30px 0 0;">You can reach them at <a href="mailto:${userEmail}" style="color:#7c3aed;">${userEmail}</a>.</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${NEXT_PUBLIC_APP_URL}/admin" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6 0%,#f59e0b 100%);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">View Admin Dashboard</a>
    </div>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:30px 0 0;">This is an automated notification from alchm.kitchen.</p>
  </div>
  <div style="text-align:center;padding:30px 20px 0;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">© ${year} alchm.kitchen. All rights reserved.</p>
  </div>
</div>
</body>
</html>`.trim();
}

function buildAdminText(userEmail, name, element) {
  return `New User Registration - alchm.kitchen

A new user has registered and completed onboarding:

Name: ${name}
Email: ${userEmail}
Registered: ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
${element ? `Dominant Element: ${element}\n` : ""}
Admin Dashboard: ${NEXT_PUBLIC_APP_URL}/admin

This is an automated notification from alchm.kitchen.
© ${year} alchm.kitchen. All rights reserved.`.trim();
}

// ── Send via Resend REST API ───────────────────────────────────────────────────

async function sendViaResend(to, subject, html, text) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend API error (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.id;
}

// ── Send via nodemailer SMTP ──────────────────────────────────────────────────

async function sendViaSMTP(to, subject, html, text) {
  const nodemailer = require("nodemailer");
  const port = parseInt(SMTP_PORT, 10);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.verify();
  const info = await transporter.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
    text,
  });
  return info.messageId;
}

// ── Unified sender ────────────────────────────────────────────────────────────

async function sendEmail(to, subject, html, text) {
  if (RESEND_API_KEY) {
    const id = await sendViaResend(to, subject, html, text);
    console.log(`  ✓ Sent via Resend (id: ${id})`);
  } else {
    const id = await sendViaSMTP(to, subject, html, text);
    console.log(`  ✓ Sent via SMTP (messageId: ${id})`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const provider = RESEND_API_KEY ? "Resend" : "SMTP";

  if (!RESEND_API_KEY && !(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS)) {
    console.error(`
ERROR: No email provider configured.

Option 1 — Resend (recommended, alchm.kitchen domain already verified):
  RESEND_API_KEY=re_xxxx node scripts/send-test-email.cjs

Option 2 — SMTP fallback:
  SMTP_HOST=smtp.gmail.com SMTP_PORT=587 \\
  SMTP_USER=you@gmail.com SMTP_PASS=app-password \\
  node scripts/send-test-email.cjs
`);
    process.exit(1);
  }

  console.log(`\n=== alchm.kitchen Email Test (${provider}) ===`);
  console.log(`From: ${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`);
  console.log(`App URL: ${NEXT_PUBLIC_APP_URL}\n`);

  // ── 1. Welcome email ──────────────────────────────────────────────────────
  console.log(`[1/3] Welcome email → ${toEmail} (name: "${userName}", element: ${dominantElement})`);
  try {
    await sendEmail(
      toEmail,
      "Welcome to alchm.kitchen — A Personal Note from Greg Castro",
      buildWelcomeHtml(userName, dominantElement),
      buildWelcomeText(userName, dominantElement),
    );
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
    process.exit(1);
  }

  // ── 2. Admin notification → xalchm@gmail.com ─────────────────────────────
  console.log(`\n[2/3] Admin notification → xalchm@gmail.com`);
  try {
    await sendEmail(
      "xalchm@gmail.com",
      `New User Registration: ${userName} on alchm.kitchen`,
      buildAdminHtml(toEmail, userName, dominantElement),
      buildAdminText(toEmail, userName, dominantElement),
    );
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
    process.exit(1);
  }

  // ── 3. Admin notification → cookingwithcastrollc@gmail.com ───────────────
  console.log(`\n[3/3] Admin notification → cookingwithcastrollc@gmail.com`);
  try {
    await sendEmail(
      "cookingwithcastrollc@gmail.com",
      `New User Registration: ${userName} on alchm.kitchen`,
      buildAdminHtml(toEmail, userName, dominantElement),
      buildAdminText(toEmail, userName, dominantElement),
    );
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n✓ All 3 emails sent successfully via ${provider}!`);
  console.log(`\nCheck inboxes for:`);
  console.log(`  • ${toEmail} — welcome email from Greg Castro`);
  console.log(`  • xalchm@gmail.com — new user signup notification`);
  console.log(`  • cookingwithcastrollc@gmail.com — new user signup notification\n`);
}

main();
