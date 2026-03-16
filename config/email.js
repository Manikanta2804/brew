const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"BrewDash 🍺" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 BrewDash - Your OTP for Password Reset',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin:0;padding:0;background:#f2f2f2;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:500px;margin:30px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);">
          <div style="background:linear-gradient(135deg,#1a1a2e,#e94560);padding:30px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:1.8rem;">🍺 BrewDash</h1>
            <p style="color:rgba(255,255,255,0.8);margin:5px 0 0;">Password Reset Request</p>
          </div>
          <div style="padding:30px;">
            <p style="color:#333;font-size:1rem;">Hi <strong>${name}</strong>,</p>
            <p style="color:#555;font-size:0.9rem;">We received a request to reset your BrewDash password. Use the OTP below:</p>
            <div style="background:#f9f9f9;border-radius:15px;padding:25px;text-align:center;margin:20px 0;border:2px dashed #e94560;">
              <p style="color:#777;font-size:0.82rem;margin:0 0 10px;">Your OTP Code</p>
              <h1 style="color:#e94560;font-size:2.5rem;letter-spacing:10px;margin:0;">${otp}</h1>
              <p style="color:#aaa;font-size:0.75rem;margin:10px 0 0;">⏱️ Valid for 10 minutes only</p>
            </div>
            <p style="color:#777;font-size:0.82rem;">If you didn't request this, please ignore this email. Your account is safe.</p>
            <p style="color:#aaa;font-size:0.75rem;margin-top:20px;border-top:1px solid #eee;padding-top:15px;">
              © 2024 BrewDash. All rights reserved.<br/>
              Do not share this OTP with anyone.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return await transporter.sendMail(mailOptions);
};
