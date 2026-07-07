// backend/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add an event description'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Please add an event date']
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please add the total seats count']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Event', eventSchema);
