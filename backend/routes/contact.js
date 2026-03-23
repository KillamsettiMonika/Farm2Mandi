const express = require('express');
let nodemailer;

try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

const router = express.Router();

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

    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost || !nodemailer) {
      console.log('Contact message received (email not configured):', {
        name,
        email,
        phone,
        message,
        receivedAt: new Date().toISOString()
      });
      return res.json({ message: 'Message received successfully' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
    });

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

    await transporter.sendMail({
      from: mailFrom,
      to: toEmail,
      replyTo: email,
      subject: mailSubject,
      text: mailText
    });

    return res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact email error:', err);
    return res.status(500).json({ error: 'Server error while sending contact message' });
  }
});

module.exports = router;
