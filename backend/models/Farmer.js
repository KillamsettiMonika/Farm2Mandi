// const mongoose = require('mongoose');

// const FarmerSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, sparse: true, index: true },
//   password: { type: String },
//   phone: { type: String, unique: true, sparse: true, index: true },
//   village: { type: String },
//   district: { type: String },
//   state: { type: String },
//   pincode: { type: String },
//   aadhar: { type: String },
//   farm_size: { type: Number },
//   crops: { type: [String], default: [] },
//   // Fields for OTP-based password reset
//   resetOtp: { type: String },
//   resetOtpExpires: { type: Date },
//   role: { type: String, default: 'farmer' },
//   isAdmin: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Farmer', FarmerSchema);

const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    unique: true,
    sparse: true   // ✅ FIX (allows multiple null emails)
  },

  password: { type: String },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  village: String,
  district: String,
  state: String,
  pincode: String,
  aadhar: String,

  farm_size: Number,
  crops: [String],

  role: {
    type: String,
    default: 'farmer'
  },

  resetOtp: String,
  resetOtpExpires: Date

}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);
