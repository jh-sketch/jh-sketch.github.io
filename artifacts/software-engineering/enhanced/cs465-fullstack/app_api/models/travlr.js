const mongoose = require('mongoose');

// Define the trip schema
const tripSchema = new mongoose.Schema({
code: { type: String, required: true, index: true },
name: { type: String, required: true, index: true },
length: { type: String, required: true },
start: { type: Date, required: true },
resort: { type: String, required: true },
perPerson: {
  type: String,
  required: true,
  validate: {
    validator: function(value) {
      return /^\d+(\.\d{1,2})?$/.test(value);
    },
    message: 'Price must be a valid nonnegative amount with up to two decimal places'
  }
},

image: { type: String, required: true },
description: { type: String, required: true }
});

const Trip = mongoose.model('trips', tripSchema);
module.exports = Trip;