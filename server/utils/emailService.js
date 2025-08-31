const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS  // Your app password (not regular password)
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, name = '') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Code Monk Club',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Email Verification - Code Monk Registration',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: #fff; border: 2px dashed #2563eb; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fef3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Code Monk Club</h1>
              <p>Welcome to the Future of Coding!</p>
            </div>
            <div class="content">
              <h2>Email Verification Required</h2>
              <p>Hi${name ? ' ' + name : ''},</p>
              <p>Thank you for joining Code Monk Club! To complete your registration, please verify your email address using the OTP below:</p>
              
              <div class="otp-box">
                <p>Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p><small>This code will expire in 10 minutes</small></p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Note:</strong> Never share this code with anyone. Code Monk team will never ask for your OTP.
              </div>
              
              <p>If you didn't request this verification, please ignore this email.</p>
              
              <div class="footer">
                <p>Best regards,<br><strong>Code Monk Team</strong></p>
                <p><small>This is an automated email. Please do not reply to this message.</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send OTP email' };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  testEmailConfig
};
