// backend/controllers/bookingController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Activity = require('../models/Activity'); 


const reserveSeats = async (req, res) => {
  const { eventId, seats } = req.body; 

  if (!eventId || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: 'Please provide eventId and seats array' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const lockExpiration = new Date(now.getTime() + 5 * 60 * 1000); 

    const targetSeats = await Seat.find({
      eventId,
      seatNumber: { $in: seats }
    }).session(session);

    if (targetSeats.length !== seats.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'One or more selected seats do not exist' });
    }

    for (const seat of targetSeats) {
      const isAvailable = seat.status === 'AVAILABLE';
      const isExpiredLock = seat.status === 'RESERVED' && seat.lockedUntil && seat.lockedUntil < now;
      if (!isAvailable && !isExpiredLock) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({ message: `Seat ${seat.seatNumber} is already reserved or booked` });
      }
    }

    const seatIds = targetSeats.map(s => s._id);
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      {
        $set: {
          status: 'RESERVED',
          lockedBy: req.user._id,
          lockedUntil: lockExpiration
        }
      }
    ).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Seats reserved successfully for 5 minutes',
      lockedUntil: lockExpiration,
      seats
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

const bookSeats = async (req, res) => {
  const { eventId, seats, idempotencyKey } = req.body; 

  if (!eventId || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: 'Please provide eventId and seats array' });
  }
  if (!idempotencyKey) {
    return res.status(400).json({ message: 'Please provide an idempotency key for booking checkout' });
  }

  const SEAT_PRICE_PAISE = 50000; 
  const totalAmount = seats.length * SEAT_PRICE_PAISE;

  const session = await mongoose.startSession();
  session.startTransaction(); 

  try {
    const now = new Date();

    const existingTx = await Transaction.findOne({ idempotencyKey }).session(session);
    if (existingTx) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'Duplicate transaction: booking request already processed' });
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.walletBalance < totalAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const targetSeats = await Seat.find({
      eventId,
      seatNumber: { $in: seats }
    }).session(session);

    if (targetSeats.length !== seats.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'One or more selected seats do not exist' });
    }

    for (const seat of targetSeats) {
      const isLockedByUser = seat.status === 'RESERVED' && seat.lockedBy?.toString() === req.user._id.toString();
      const isNotExpired = seat.lockedUntil && seat.lockedUntil >= now;
      if (!isLockedByUser || !isNotExpired) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Reservation for seat ${seat.seatNumber} has expired or is invalid` });
      }
    }

    const seatIds = targetSeats.map(s => s._id);
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      {
        $set: {
          status: 'BOOKED',
          lockedBy: null,
          lockedUntil: null
        }
      }
    ).session(session);

    user.walletBalance -= totalAmount;
    await user.save({ session });

    const booking = new Booking({
      userId: req.user._id,
      eventId,
      seats: seatIds,
      totalAmount,
      status: 'CONFIRMED'
    });
    await booking.save({ session });

    const transaction = new Transaction({
      userId: req.user._id,
      bookingId: booking._id,
      type: 'DEBIT',
      amount: totalAmount,
      idempotencyKey
    });
    await transaction.save({ session });

    await new Activity({
      userId: req.user._id,
      type: 'TICKET_BOOK',
      message: `Ticket successfully authorized! Booked ${seats.length} seat(s) [${seats.join(', ')}].`
    }).save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    let query = {};
    
    if (req.user && req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('eventId')
      .populate('seats') 
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  reserveSeats,
  bookSeats,
  getBookings 
};