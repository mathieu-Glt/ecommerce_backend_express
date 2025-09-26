const Brevo = require("@getbrevo/brevo");
const getResetPasswordTemplate = require("../template/resetPasswordTemplate");

const emailAPI = new Brevo.TransactionalEmailsApi();
emailAPI.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

// Log pour vérifier la clé utilisée (masquée pour la sécurité)
console.log(
  "Brevo API Key loaded:",
  process.env.BREVO_API_KEY
    ? process.env.BREVO_API_KEY.substring(0, 10) + "..."
    : "NOT FOUND"
);

// Vérifier si la clé API est configurée
if (!process.env.BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY is not configured in .env file");
  console.error("Please add BREVO_API_KEY=your_api_key to your .env file");
}

const sendResetEmail = async (toEmail, name, resetLink) => {
  const { textContent, htmlContent } = getResetPasswordTemplate(
    name,
    resetLink
  );

  const email = new Brevo.SendSmtpEmail();
  email.sender = { email: "no-reply@shop39.com", name: "ecommerce shop39" };
  email.to = [{ email: toEmail }];
  email.subject = "Reset your password for shop39";
  email.textContent = textContent;
  email.htmlContent = htmlContent;

  try {
    const response = await emailAPI.sendTransacEmail(email);
    console.log("Email sent ✅", response);
  } catch (err) {
    console.error("Email send error ❌", err);
  }
};

const sendWelcomeEmail = async (toEmail, name) => {
  console.log("🚀 Tentative d'envoi d'email de bienvenue à:", toEmail);
  console.log("📧 Nom du destinataire:", name);
  console.log(
    "🔑 Clé API Brevo configurée:",
    process.env.BREVO_API_KEY ? "OUI" : "NON"
  );

  const email = new Brevo.SendSmtpEmail();
  email.sender = { email: "no-reply@shop39.com", name: "ecommerce shop39" };
  email.to = [{ email: toEmail }];
  email.subject = "Welcome to shop39 - Account Created Successfully!";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to shop39</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f8f9fa; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to shop39! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Thank you for creating an account with shop39! Your account has been successfully created.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our products</li>
            <li>Add items to your cart</li>
            <li>Complete your purchases</li>
            <li>Track your orders</li>
          </ul>
          <div style="text-align: center;">
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }" class="button">Start Shopping</a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The shop39 Team</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${toEmail}</p>
          <p>&copy; 2024 shop39. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to shop39!
    
    Hello ${name},
    
    Thank you for creating an account with shop39! Your account has been successfully created.
    
    You can now:
    - Browse our products
    - Add items to your cart
    - Complete your purchases
    - Track your orders
    
    Start shopping at: ${process.env.FRONTEND_URL || "http://localhost:3000"}
    
    If you have any questions, feel free to contact our support team.
    
    Best regards,
    The shop39 Team
    
    This email was sent to ${toEmail}
    © 2025 shop39. All rights reserved.
  `;

  email.textContent = textContent;
  email.htmlContent = htmlContent;

  try {
    console.log("📤 Envoi de l'email via Brevo...");
    const response = await emailAPI.sendTransacEmail(email);
    console.log("✅ Email de bienvenue envoyé avec succès:", response);
    return { success: true };
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi de l'email de bienvenue:", err);
    console.error("🔍 Détails de l'erreur:", {
      message: err.message,
      status: err.status,
      response: err.response?.data,
    });
    return { success: false, error: err.message };
  }
};

module.exports = { sendResetEmail, sendWelcomeEmail };
