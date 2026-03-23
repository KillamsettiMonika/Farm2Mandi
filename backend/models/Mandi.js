const mongoose = require('mongoose');

const MandiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  commodity: { type: String, required: true }, // Commodities this mandi deals with
  commodities: { type: [String], default: [] }, // Multiple commodities supported
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient querying by commodity and location
MandiSchema.index({ commodity: 1 });
MandiSchema.index({ commodities: 1 });
MandiSchema.index({ latitude: 1, longitude: 1 });
MandiSchema.index({ state: 1, district: 1 }); // For browsing by state and district
MandiSchema.index({ state: 1, name: 1 }); // For searching markets by name in a state

module.exports = mongoose.model('Mandi', MandiSchema);
