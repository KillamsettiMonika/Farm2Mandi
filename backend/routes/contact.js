const express = require('express');
let nodemailer;

try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

const router = express.Router();

// Create transporter once and reuse it
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost || !nodemailer) return null;

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: 465,          // ✅ FIXED
    secure: true,       // ✅ FIXED
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
    connectionTimeout: 10000,
    socketTimeout: 10000
  });

  return transporter;
}


router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    const toEmail = process.env.FARM2MANDI_CONTACT_EMAIL || process.env.SMTP_USER;
    if (!toEmail) {
      return res.status(500).json({ error: 'Contact recipient email is not configured' });
    }

    const mailTransporter = getTransporter();
    if (!mailTransporter) {
      console.log('Contact message received (email not configured):', {
        name,
        email,
        phone,
        message,
        receivedAt: new Date().toISOString()
      });
      return res.json({ message: 'Message received successfully' });
    }

    const mailFrom = process.env.SMTP_FROM || 'no-reply@farm2mandi.local';
    const mailSubject = `New Contact Message from ${name}`;
    const mailText = [
      'New message submitted from Farm2Mandi Contact page',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'N/A'}`,
      '',
      'Message:',
      message
    ].join('\n');

    await mailTransporter.sendMail({
      from: mailFrom,
      to: toEmail,
      replyTo: email,
      subject: mailSubject,
      text: mailText
    });

    console.log(`✅ Contact message sent successfully to ${toEmail} from ${email}`);
    return res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact email error:', err.message || err);
    console.error('Error code:', err.code);
    console.error('SMTP Config - Host:', process.env.SMTP_HOST, 'Port:', process.env.SMTP_PORT, 'Secure:', process.env.SMTP_SECURE);
    return res.status(500).json({ error: 'Server error while sending contact message' });
  }
});

module.exports = router;
