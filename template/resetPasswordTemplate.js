const getResetPasswordTemplate = (name, resetLink) => {
  const textContent = `
  Hello ${name},
  
  You requested to reset your password.
  
  Click the link below to create a new one:
  ${resetLink}
  
  This link is valid for 15 minutes.
  
  If you did not request this, please ignore this email.
  
  Thank you,
  TonApp Support Team
  `;

  const htmlContent = `
  <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <img src="http://localhost:8000/public/logo.png" alt="TonApp Logo" style="width:150px;"/>
      <h2>Hello ${name},</h2>
      <p>You requested to reset your password.</p>
      <p>
        <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background:#007BFF; color:white; text-decoration:none; border-radius:5px;">
          Reset Password
        </a>
      </p>
      <p>This link is valid for 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you,<br>TonApp Support Team</p>
    </body>
  </html>
  `;

  return { textContent, htmlContent };
};

module.exports = getResetPasswordTemplate;
