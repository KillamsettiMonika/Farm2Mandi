const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
  state: { type: String, required: true },
  district: { type: String, required: true },
  marketName: { type: String, required: true }, // Mandi name
  commodity: { type: String, required: true, index: true },
  variety: { type: String },
  grade: { type: String },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  modalPrice: { type: Number, required: true }, // Average/Modal price
  priceDate: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying by commodity and date
PriceSchema.index({ commodity: 1, priceDate: -1 });
PriceSchema.index({ marketName: 1, commodity: 1, priceDate: -1 });

module.exports = mongoose.model('Price', PriceSchema);
