const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true
    },

    fromMandi: {
      type: String,
      required: true
    },
    toMandi: {
      type: String,
      required: true
    },

    cropType: {
      type: String,
      required: true
    },
    quantityKg: {
      type: Number,
      required: true
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },

    status: {
      type: String,
      enum: ["Requested", "Assigned", "Accepted", "Rejected", "Cancelled", "OnTheWay", "Delivered"],
      default: "Requested"
    },

    estimatedCost: {
      type: Number
    },
    distanceKm: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
bookingSchema.index({ farmerId: 1 });
bookingSchema.index({ driver: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
