const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'lost' },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);