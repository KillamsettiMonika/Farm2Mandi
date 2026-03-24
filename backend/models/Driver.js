// const mongoose = require('mongoose');

// const driverSchema = new mongoose.Schema(
//   {
//     // Basic Identity & Authentication
//     driverId: {
//       type: String,
//       required: true,
//       unique: true
//     },
//     name: {
//       type: String,
//       required: true
//     },
//     email: {
//       type: String,
//       unique: true,
//       sparse: true,
//       index: true
//     },
//     password: {
//       type: String,
//       required: false
//     },
//     phone: {
//       type: String,
//       required: true,
//       unique: true,
//       sparse: true
//     },
//     role: {
//       type: String,
//       default: 'driver'
//     },
//     // Fields for OTP-based password reset
//     resetOtp: { type: String },
//     resetOtpExpires: { type: Date },

//     // Vehicle Details
//     vehicleType: {
//       type: String,
//       enum: ["Mini Truck", "Pickup Van", "Tractor", "Lorry", "Container"],
//       required: true
//     },
//     vehicleNumber: {
//       type: String,
//       required: true,
//       unique: true
//     },
//     vehicleCapacityKg: {
//       type: Number,
//       required: true
//     },

//     // Location & Availability
//     currentLocation: {
//       latitude: Number,
//       longitude: Number
//     },
//     locationName: {
//       type: String,
//       default: ''
//     },
//     lastLocationUpdate: {
//       type: Date
//     },
//     currentMandal: {
//       type: String,
//       required: true
//     },
//     isAvailable: {
//       type: Boolean,
//       default: true
//     },

//     // Pricing
//     costPerKm: {
//       type: Number,
//       required: true
//     },

//     // Ratings & Trust
//     rating: {
//       type: Number,
//       default: 4.0,
//       min: 0,
//       max: 5
//     },
//     totalTrips: {
//       type: Number,
//       default: 0
//     },

//     // Status
//     status: {
//       type: String,
//       enum: ["Idle", "Assigned", "OnTrip"],
//       default: "Idle"
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// // Indexes for efficient querying
// driverSchema.index({ driverId: 1 });
// driverSchema.index({ email: 1 });
// driverSchema.index({ vehicleNumber: 1 });
// driverSchema.index({ isAvailable: 1, currentMandal: 1 });
// driverSchema.index({ isAvailable: 1, vehicleCapacityKg: 1 });
// driverSchema.index({ status: 1 });

// module.exports = mongoose.model('Driver', driverSchema);

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },

  name: { type: String, required: true },

  email: {
    type: String,
    unique: true,
    sparse: true   // ✅ FIX
  },

  password: { type: String },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  vehicleType: String,
  vehicleNumber: { type: String, unique: true },
  vehicleCapacityKg: Number,
  currentMandal: String,
  costPerKm: Number,

  role: {
    type: String,
    default: 'driver'
  },

  resetOtp: String,
  resetOtpExpires: Date

}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);