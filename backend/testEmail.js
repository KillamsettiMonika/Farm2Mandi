const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false
  }
});

console.log('Testing SMTP Connection...');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('---');

transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP Connection Failed:', err.message);
    console.error('Error Code:', err.code);
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection Successful!');
    console.log('Attempting to send test email...');
    
    transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Farm2Mandi SMTP Test',
      text: 'This is a test email to verify SMTP configuration is working correctly.'
    }, (err, info) => {
      if (err) {
        console.error('❌ Email Send Failed:', err.message);
        process.exit(1);
      } else {
        console.log('✅ Test Email Sent Successfully!');
        console.log('Response:', info.response);
        process.exit(0);
      }
    });
  }
});
