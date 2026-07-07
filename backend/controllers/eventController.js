// backend/controllers/eventController.js
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Seat = require('../models/Seat');

const createEvent = async (req, res) => {
  const { title, description, date, totalSeats } = req.body;

  if (!title || !description || !date || !totalSeats || totalSeats <= 0) {
    return res.status(400).json({ message: 'Please provide all valid event details' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = new Event({
      title,
      description,
      date,
      totalSeats
    });

    await event.save({ session });

    const seats = [];
    const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < totalSeats; i++) {
      const rowIdx = Math.floor(i / 10);
      const colNum = (i % 10) + 1;
      const rowLetter = rows[rowIdx] || `R${rowIdx + 1}`;
      seats.push({
        eventId: event._id,
        seatNumber: `${rowLetter}${colNum}`,
        status: 'AVAILABLE',
        lockedBy: null,
        lockedUntil: null
      });
    }

    await Seat.insertMany(seats, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Event and seats successfully created',
      event
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventSeats = async (req, res) => {
  const eventId = req.params.id;

  try {
    const now = new Date();

    await Seat.updateMany(
      {
        eventId,
        status: 'RESERVED',
        lockedUntil: { $lt: now }
      },
      {
        $set: {
          status: 'AVAILABLE',
          lockedBy: null,
          lockedUntil: null
        }
      }
    );

    const seats = await Seat.find({ eventId }).sort({ seatNumber: 1 });
    res.json(seats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  const eventId = req.params.id;
  const { title, description, date } = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { title, description, date },
      // { new: true, runValidators: true }
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event deployment scope not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event deployment scope not found' });
    }

    await Seat.deleteMany({ eventId });
    await Event.findByIdAndDelete(eventId);

    res.json({ message: 'Schema Mutation Success: Event record wiped successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventSeats,
  updateEvent,
  deleteEvent
};