const twilio = require('twilio');

exports.sendOTPSms = async (phone, otp) => {
  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    // Format phone number (add country code if not present)
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = '+91' + phone; // India country code
    }

    await client.messages.create({
      body: `🍺 BrewDash OTP: ${otp}\n\nUse this to reset your password.\nValid for 10 minutes.\nDo NOT share with anyone.`,
      from: process.env.TWILIO_PHONE,
      to: formattedPhone
    });

    return { success: true };
  } catch (err) {
    console.error('SMS Error:', err.message);
    return { success: false, error: err.message };
  }
};