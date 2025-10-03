/**
 * @file brevoEmails.js
 * @description
 * Module for sending transactional emails (reset password + welcome) using Brevo API with EJS templates.
 */

const Brevo = require("@getbrevo/brevo");
const renderTemplate = require("./templateEngine");

// Init API
const emailAPI = new Brevo.TransactionalEmailsApi();
emailAPI.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

// Constants
const APP_NAME = process.env.APP_NAME || "shop39";
const LOGO_URL =
  process.env.APP_LOGO_URL || "http://localhost:8000/public/logo.png";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Send reset password email
 */
const sendResetEmail = async (toEmail, name, resetLink) => {
  try {
    // Render EJS template
    const htmlContent = await renderTemplate("resetPassword", {
      name,
      resetLink,
      appName: APP_NAME,
      logoUrl: LOGO_URL,
    });

    // Plain text fallback
    const textContent = `
Hello ${name},

You requested to reset your password.

Click the link below to create a new one:
${resetLink}

This link is valid for 15 minutes and can only be used once.

If you did not request this, please ignore this email.

Thank you,
${APP_NAME} Support Team
    `;

    const email = new Brevo.SendSmtpEmail();
    email.sender = { email: "no-reply@shop39.com", name: APP_NAME };
    email.to = [{ email: toEmail }];
    email.subject = `Reset your password for ${APP_NAME}`;
    email.textContent = textContent;
    email.htmlContent = htmlContent;

    const response = await emailAPI.sendTransacEmail(email);
    console.log("Reset email sent:", response);
    return { success: true };
  } catch (err) {
    console.error("Error sending reset email:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (toEmail, name) => {
  try {
    // Render EJS template
    const htmlContent = await renderTemplate("welcome", {
      name,
      toEmail,
      appName: APP_NAME,
      logoUrl: LOGO_URL,
      frontendUrl: FRONTEND_URL,
    });

    // Plain text fallback
    const textContent = `
Welcome to ${APP_NAME}!

Hello ${name},

Thank you for creating an account with ${APP_NAME}! Your account has been successfully created.

You can now:
- Browse our products
- Add items to your cart
- Complete your purchases
- Track your orders

Start shopping at: ${FRONTEND_URL}

If you have any questions, feel free to contact our support team.

Best regards,
The ${APP_NAME} Team

This email was sent to ${toEmail}
© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
    `;

    const email = new Brevo.SendSmtpEmail();
    email.sender = { email: "no-reply@shop39.com", name: APP_NAME };
    email.to = [{ email: toEmail }];
    email.subject = `Welcome to ${APP_NAME} - Account Created Successfully!`;
    email.textContent = textContent;
    email.htmlContent = htmlContent;

    const response = await emailAPI.sendTransacEmail(email);
    console.log("Welcome email sent:", response);
    return { success: true };
  } catch (err) {
    console.error("Error sending welcome email:", err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendResetEmail, sendWelcomeEmail };
