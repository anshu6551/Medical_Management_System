const transporter = require('../config/emailConfig');

class EmailService {
  // 1. Send Account Verification Email
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${'http://localhost:5000'}/api/v1/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Medipulse Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your MediPulse.OS Account',
      html: `
        <h2>Welcome to Medipulse!</h2>
        <p>Please click the link below to verify your email address and activate your account:</p>
        <a href="${verificationUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      `
    };

    return await transporter.sendMail(mailOptions);
  }

  // 2. Send Daily Task Summary Email
  async sendTaskSummaryEmail(email, name, summary) {
    const { overdue, upcoming, completed } = summary;

    const mailOptions = {
      from: `"Medipulse Daily Summary" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Daily Task Summary - ${new Date().toLocaleDateString()}`,
      html: `
        <h3>Hello ${name},</h3>
        <p>Here is your daily task summary:</p>
        <ul>
          <li><strong>Overdue Tasks:</strong> ${overdue}</li>
          <li><strong>Upcoming Tasks:</strong> ${upcoming}</li>
          <li><strong>Completed Tasks:</strong> ${completed}</li>
        </ul>
        <p>Keep up the productivity!</p>
      `
    };

    return await transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();