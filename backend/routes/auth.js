const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const Farmer = require('../models/Farmer');
const Driver = require('../models/Driver');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

const OTP_TTL_MS = Number(process.env.OTP_TTL_MS || 5 * 60 * 1000);
const otpStore = new Map();

function normalizePhone(phone) {
  if (!phone) return '';
  let normalized = String(phone).trim().replace(/[\s-]/g, '');
  if (!normalized.startsWith('+')) {
    normalized = normalized.replace(/\D/g, '');
    if (normalized.length === 10) {
      normalized = `+91${normalized}`;
    } else {
      normalized = `+${normalized}`;
    }
  }
  return normalized;
}

function makeOtp() {
  try {
    return String(crypto.randomInt(100000, 1000000));
  } catch (err) {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}

function otpKey(purpose, phone) {
  return `${purpose}:${phone}`;
}

function saveOtp(purpose, phone, otp) {
  otpStore.set(otpKey(purpose, phone), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS
  });
}

function verifyOtp(purpose, phone, otp) {
  const key = otpKey(purpose, phone);
  const record = otpStore.get(key);
  if (!record) {
    return { ok: false, error: 'OTP not requested' };
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { ok: false, error: 'OTP expired' };
  }
  if (String(record.otp) !== String(otp).trim()) {
    return { ok: false, error: 'Invalid OTP' };
  }
  otpStore.delete(key);
  return { ok: true };
}

async function findUserByPhone(phone) {
  let user = await Farmer.findOne({ phone });
  let role = 'farmer';
  if (!user) {
    user = await Driver.findOne({ phone });
    role = 'driver';
  }
  return { user, role };
}

function publicUser(user, fallbackRole) {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role || fallbackRole
  };
}

function hasTwilioVerifyConfig() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

async function sendMobileOtp(phone, otp) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuthToken && verifyServiceSid) {
    const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;
    const body = new URLSearchParams({
      To: phone,
      Channel: 'sms'
    });

    await axios.post(url, body.toString(), {
      auth: {
        username: twilioSid,
        password: twilioAuthToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return;
  }

  if (twilioSid && twilioAuthToken && twilioFrom) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const body = new URLSearchParams({
      To: phone,
      From: twilioFrom,
      Body: `Farm2Mandi OTP: ${otp}. Valid for ${Math.floor(OTP_TTL_MS / 60000)} minutes.`
    });

    await axios.post(url, body.toString(), {
      auth: {
        username: twilioSid,
        password: twilioAuthToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return;
  }

  // Development fallback when SMS provider is not configured.
  console.log(`Mobile OTP for ${phone}: ${otp}`);
}

async function verifyMobileOtp(purpose, phone, otp) {
  if (hasTwilioVerifyConfig()) {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
    const body = new URLSearchParams({
      To: phone,
      Code: String(otp).trim()
    });

    try {
      const result = await axios.post(url, body.toString(), {
        auth: {
          username: twilioSid,
          password: twilioAuthToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (result.data?.status === 'approved' || result.data?.valid === true) {
        return { ok: true };
      }
      return { ok: false, error: 'Invalid OTP' };
    } catch (err) {
      const msg = err.response?.data?.message;
      return { ok: false, error: msg || 'OTP verification failed' };
    }
  }

  return verifyOtp(purpose, phone, otp);
}

// Helper for cookie options (works for both local and production)
function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd, // true in production, false locally
    sameSite: isProd ? 'none' : 'lax', // 'none' for cross-site in prod, 'lax' locally
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

// Request OTP for mobile login/registration
router.post('/request-otp', async (req, res) => {
  try {
    const purpose = req.body.purpose === 'register' ? 'register' : 'login';
    const phone = normalizePhone(req.body.phone);

    if (!phone || phone.length < 8) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const existing = await findUserByPhone(phone);
    if (purpose === 'login' && !existing.user) {
      return res.status(404).json({ error: 'User not found for this mobile number' });
    }
    if (purpose === 'register' && existing.user) {
      return res.status(409).json({ error: 'Mobile number already registered' });
    }

    const otp = makeOtp();
    if (!hasTwilioVerifyConfig()) {
      saveOtp(purpose, phone, otp);
    }
    await sendMobileOtp(phone, otp);

    return res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Request mobile OTP error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Register (creates a farmer or driver based on role)
router.post('/register', async (req, res) => {
  try {
    const { role, name, email, password, phone, village, district, state, pincode, aadhar, farm_size, crops,
            driverId, vehicleType, vehicleNumber, vehicleCapacityKg, currentMandal, costPerKm, otp } = req.body;

    const userRole = role || 'farmer';
    const normalizedPhone = normalizePhone(phone);
    const isOtpFlow = Boolean(normalizedPhone && otp);

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    if (isOtpFlow) {
      const verified = await verifyMobileOtp('register', normalizedPhone, otp);
      if (!verified.ok) {
        return res.status(400).json({ error: verified.error });
      }

      const existingByPhone = await findUserByPhone(normalizedPhone);
      if (existingByPhone.user) {
        return res.status(409).json({ error: 'Mobile number already registered' });
      }
    } else {
      if (!email || !password) {
        return res.status(400).json({ error: 'For password registration, email and password are required' });
      }

      const existingFarmer = await Farmer.findOne({ email });
      const existingDriver = await Driver.findOne({ email });
      if (existingFarmer || existingDriver) {
        return res.status(409).json({ error: 'User already exists' });
      }
    }

    const hashed = password ? await bcrypt.hash(password, 10) : undefined;

    if (userRole === 'driver') {
      // Driver registration
      if (!driverId || !vehicleType || !vehicleNumber || !vehicleCapacityKg || !currentMandal || !costPerKm) {
        return res.status(400).json({ error: 'Driver registration requires: driverId, vehicleType, vehicleNumber, vehicleCapacityKg, currentMandal, costPerKm' });
      }

      // Check if driverId or vehicleNumber already exists
      const existingDriverId = await Driver.findOne({ driverId });
      const existingVehicle = await Driver.findOne({ vehicleNumber });
      if (existingDriverId) return res.status(409).json({ error: 'Driver ID already exists' });
      if (existingVehicle) return res.status(409).json({ error: 'Vehicle number already registered' });

      const driverData = {
  driverId,
  name,
  phone: normalizedPhone || phone,
  vehicleType,
  vehicleNumber,
  vehicleCapacityKg,
  currentMandal,
  costPerKm,
  role: 'driver'
};

if (email) driverData.email = email;
if (hashed) driverData.password = hashed;

const driver = new Driver(driverData);

await driver.save();

      const token = jwt.sign({ id: driver._id, phone: driver.phone, role: driver.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, getCookieOptions());

      res.json({ user: publicUser(driver, 'driver') });
    } else {
      // Farmer registration
const farmerData = {
  name,
  phone: normalizedPhone || phone,
  village,
  district,
  state,
  pincode,
  aadhar,
  farm_size: farm_size || null,
  crops: Array.isArray(crops) ? crops : (crops ? [crops] : [])
};

// ✅ only add email if exists
if (email) farmerData.email = email;

// ✅ only add password if exists
if (hashed) farmerData.password = hashed;

const farmer = new Farmer(farmerData);

await farmer.save();

      const token = jwt.sign({ id: farmer._id, phone: farmer.phone, role: farmer.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, getCookieOptions());

      res.json({ user: publicUser(farmer, 'farmer') });
    }
  } catch (err) {
  console.error("Register error FULL:", err);
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);
  res.status(500).json({ error: err.message });
}
});

// Login (supports both farmer and driver)
router.post('/login', async (req, res) => {
  try {
    const { email, password, phone, otp } = req.body;

    if (phone && otp) {
      const normalizedPhone = normalizePhone(phone);
      const verified = await verifyMobileOtp('login', normalizedPhone, otp);
      if (!verified.ok) {
        return res.status(400).json({ error: verified.error });
      }

      const found = await findUserByPhone(normalizedPhone);
      if (!found.user) {
        return res.status(401).json({ error: 'Invalid mobile login' });
      }

      const token = jwt.sign({ id: found.user._id, phone: found.user.phone, role: found.user.role || found.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, getCookieOptions());
      return res.json({ user: publicUser(found.user, found.role) });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Use mobile OTP login or provide email and password' });
    }

    let user = await Farmer.findOne({ email });
    let userType = 'farmer';

    if (!user) {
      user = await Driver.findOne({ email });
      userType = 'driver';
    }

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role || userType }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, getCookieOptions());

    return res.json({ user: publicUser(user, userType) });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password (OTP) - generate numeric OTP, save it, and (in production) email it
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    
    // Check both Farmer and Driver collections
    let user = await Farmer.findOne({ email });
    if (!user) {
      user = await Driver.findOne({ email });
    }
    if (!user) return res.status(404).json({ error: 'No such user' });

    // generate 6-digit OTP
    const otp = (await new Promise((resolve) => {
      try {
        const n = crypto.randomInt(100000, 1000000);
        resolve(String(n));
      } catch (err) {
        resolve(String(Math.floor(100000 + Math.random() * 900000)));
      }
    }));

    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(expires);
    await user.save();

    // Try to send email if SMTP config exists
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost && nodemailer) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
        });

        const mailOpts = {
          from: process.env.SMTP_FROM || 'no-reply@farm2mandi.local',
          to: user.email,
          subject: 'Farm2Mandi password reset OTP',
          text: `Your password reset OTP is: ${otp}. It expires in 15 minutes.`
        };
        await transporter.sendMail(mailOpts);
      } catch (mailErr) {
        console.error('Failed to send reset OTP email', mailErr);
      }
    } else {
      // no mail configured - log OTP for development
      console.log(`Password reset OTP for ${user.email}: ${otp} (expires ${new Date(expires).toISOString()})`);
    }

  // Do not return the OTP in the API response. The user must enter the OTP they received by email.
  res.json({ message: 'If an account exists, an OTP was sent to the email (check server logs in dev).' });
  } catch (err) {
    console.error('Forgot OTP error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout - clear cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
});

// Protected: get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    // req.user is populated by requireAuth middleware (without password)
    res.json({ user: req.user });
  } catch (err) {
    console.error('Get profile error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected: update current user profile (non-password fields)
router.put('/me', requireAuth, async (req, res) => {
  try {
    const userRole = req.user.role || 'farmer';
    
    if (userRole === 'driver') {
      // Driver profile update
      const allowed = ['name', 'phone', 'vehicleType', 'vehicleCapacityKg', 'currentMandal', 'costPerKm', 'currentLocation'];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }
      
      const driver = await Driver.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select('-password');
      res.json({ user: driver });
    } else {
      // Farmer profile update
      const allowed = ['name', 'phone', 'village', 'district', 'state', 'pincode', 'aadhar', 'farm_size', 'crops'];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      // if crops provided as comma string, normalize to array
      if (typeof updates.crops === 'string') {
        updates.crops = updates.crops.split(',').map(s => s.trim()).filter(Boolean);
      }

      const farmer = await Farmer.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select('-password');
      res.json({ user: farmer });
    }
  } catch (err) {
    console.error('Update profile error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected: change password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'oldPassword and newPassword required' });
    
    const userRole = req.user.role || 'farmer';
    let user;
    
    if (userRole === 'driver') {
      user = await Driver.findById(req.user._id);
    } else {
      user = await Farmer.findById(req.user._id);
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(401).json({ error: 'Old password incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed' });
  } catch (err) {
    console.error('Change password error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password using email + OTP
router.post('/reset-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'email, otp and newPassword required' });

    // Check both Farmer and Driver collections
    let user = await Farmer.findOne({ email });
    if (!user) {
      user = await Driver.findOne({ email });
    }
    if (!user) return res.status(404).json({ error: 'No such user' });

    if (!user.resetOtp || !user.resetOtpExpires) return res.status(400).json({ error: 'No OTP requested' });
    if (new Date() > new Date(user.resetOtpExpires)) return res.status(400).json({ error: 'OTP expired' });
    if (String(otp).trim() !== String(user.resetOtp).trim()) return res.status(400).json({ error: 'Invalid OTP' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    // Optionally sign-in user by setting cookie
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, getCookieOptions());

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset OTP error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
