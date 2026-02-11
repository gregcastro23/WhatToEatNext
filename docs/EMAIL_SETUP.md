# Email Setup Guide

This guide explains how to configure email functionality for WhatToEatNext to send onboarding welcome emails to new users.

## Overview

WhatToEatNext uses **nodemailer** to send transactional emails via SMTP. When a user completes onboarding, they automatically receive a personalized welcome email featuring:

- Their dominant elemental affinity (Fire, Water, Earth, or Air)
- Brief explanation of the alchemical recommendation system
- Links to their profile and next steps
- Beautiful HTML template with gradient styling

## Quick Setup

### 1. Install Dependencies

The email dependencies should already be in `package.json`:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.16"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.4.16"
  }
}
```

Run the installation:

```bash
yarn install
```

### 2. Configure Environment Variables

Copy the `.env.example` to create your local environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the email settings:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Sender Information
EMAIL_FROM_NAME=WhatToEatNext
EMAIL_FROM_ADDRESS=noreply@alchm.kitchen

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## SMTP Provider Setup

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google account
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Configure `.env.local`**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # Your App Password
   EMAIL_FROM_ADDRESS=your-email@gmail.com
   ```

**Important**: Use the App Password, NOT your regular Gmail password!

### Option 2: SendGrid

1. **Sign up** for SendGrid (free tier available)
2. **Create an API Key** in SendGrid dashboard
3. **Configure `.env.local`**:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```

### Option 3: AWS SES

1. **Configure AWS SES** in your AWS account
2. **Verify your email/domain**
3. **Create SMTP credentials** in SES console
4. **Configure `.env.local`**:
   ```bash
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-aws-smtp-username
   SMTP_PASS=your-aws-smtp-password
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```

### Option 4: Mailgun

1. **Sign up** for Mailgun
2. **Verify your domain**
3. **Get SMTP credentials** from Mailgun dashboard
4. **Configure `.env.local`**:
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@mg.yourdomain.com
   SMTP_PASS=your-mailgun-password
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```

## Testing Email Configuration

### 1. Verify SMTP Connection

Create a test script at `scripts/test-email.js`:

```javascript
const emailService = require("../src/services/emailService").default;

async function testEmail() {
  console.log("Testing email configuration...");

  const verified = await emailService.verifyConnection();

  if (verified) {
    console.log("✅ SMTP connection verified!");

    // Send test email
    const sent = await emailService.sendWelcomeEmail(
      "test@example.com",
      "Test User",
      "Fire",
    );

    if (sent) {
      console.log("✅ Test email sent successfully!");
    } else {
      console.log("❌ Failed to send test email");
    }
  } else {
    console.log("❌ SMTP connection failed");
  }
}

testEmail();
```

Run the test:

```bash
node scripts/test-email.js
```

### 2. Test via Onboarding

1. Start the development server:

   ```bash
   yarn dev
   ```

2. Navigate to the onboarding page:

   ```
   http://localhost:3000/onboarding
   ```

3. Fill out the form with your email address

4. Check your inbox for the welcome email

## Email Template Preview

The welcome email includes:

- **Header**: Gradient banner with "Welcome to WhatToEatNext" and elemental emoji
- **Personalized Greeting**: Uses the user's name
- **Dominant Element Card**: Highlights their calculated elemental affinity
- **What's Next Section**: Bulleted list of next steps
- **CTA Button**: Link to their profile page
- **About Section**: Explanation of the alchemical system
- **Footer**: Branding and copyright

## Troubleshooting

### Email Not Sending

**Check console logs:**

```bash
# Development server logs will show:
"Email service not configured - skipping welcome email"
# OR
"Welcome email sent successfully to user@example.com"
```

**Common Issues:**

1. **"Email service not configured"**
   - Ensure all SMTP environment variables are set in `.env.local`
   - Restart your development server after changing `.env.local`

2. **"SMTP connection failed"**
   - Verify SMTP_HOST and SMTP_PORT are correct
   - Check firewall isn't blocking port 587
   - Verify SMTP credentials are valid

3. **"Authentication failed"**
   - For Gmail: Ensure you're using App Password, not regular password
   - For other providers: Verify API key or SMTP credentials are correct

4. **"Sender address rejected"**
   - Verify your email address with your SMTP provider
   - For production, use a verified domain

### Email Goes to Spam

**Recommendations:**

1. **Use a verified domain** instead of generic email addresses
2. **Configure SPF, DKIM, and DMARC** DNS records for your domain
3. **Use a reputable SMTP provider** (SendGrid, AWS SES, etc.)
4. **Avoid spam trigger words** in email content

### Testing in Development

For development, you can use:

- **Mailhog**: Local SMTP testing server (doesn't send real emails)
- **Mailtrap**: Email testing service (catches all emails)
- **Gmail with App Password**: Real emails to your own account

**Example Mailhog setup:**

```bash
# Install and run Mailhog
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configure .env.local
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=

# View emails at http://localhost:8025
```

## Production Deployment

### Environment Variables

Ensure these are set in your production environment:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-production-api-key
EMAIL_FROM_NAME=WhatToEatNext
EMAIL_FROM_ADDRESS=noreply@whattoeatnext.com
NEXT_PUBLIC_APP_URL=https://whattoeatnext.com
```

### Security Considerations

1. **Never commit** `.env.local` or `.env.production` to version control
2. **Use environment-specific** SMTP credentials
3. **Rotate API keys** regularly
4. **Monitor email sending** for suspicious activity
5. **Set up rate limiting** to prevent abuse

### Email Sending Behavior

- **Non-blocking**: Email sending doesn't block onboarding completion
- **Graceful degradation**: Onboarding succeeds even if email fails
- **Logging**: All email events are logged for debugging

## Email Service Architecture

### File Structure

```
src/services/emailService.ts    # Main email service
src/app/api/onboarding/route.ts # Onboarding endpoint (sends welcome email)
```

### Email Service Methods

```typescript
// Initialize with environment variables
emailService.initialize()

// Check if configured
emailService.isConfigured(): boolean

// Send generic email
emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Subject',
  html: '<p>HTML content</p>',
  text: 'Plain text content'
}): Promise<boolean>

// Send welcome email
emailService.sendWelcomeEmail(
  to: string,
  name: string,
  dominantElement?: string
): Promise<boolean>

// Verify SMTP connection
emailService.verifyConnection(): Promise<boolean>
```

## Future Enhancements

Potential additions to the email system:

- [ ] Email verification flow
- [ ] Password reset emails
- [ ] Weekly recommendation digest
- [ ] Recipe sharing via email
- [ ] Group dining invitations
- [ ] Preference update confirmations
- [ ] Email templates library
- [ ] Email analytics and tracking

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test SMTP connection with `emailService.verifyConnection()`
4. Review SMTP provider documentation
5. Check if your email provider requires additional security settings

For Gmail specifically, ensure:

- 2FA is enabled
- App Password is generated and used
- "Less secure app access" is NOT needed (App Passwords bypass this)

---

**Last Updated**: November 23, 2025
