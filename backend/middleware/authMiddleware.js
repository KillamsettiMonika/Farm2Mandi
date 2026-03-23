const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const Driver = require('../models/Driver');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required. Please login first.' 
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check role from token and fetch appropriate user
    const role = decoded.role || 'farmer';
    let user;
    
    if (role === 'driver') {
      user = await Driver.findById(decoded.id).select('-password');
    } else {
      user = await Farmer.findById(decoded.id).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not found. Please login again.' 
      });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired token. Please login again.' 
    });
  }
}

module.exports = { requireAuth };
