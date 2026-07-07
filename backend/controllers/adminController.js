// backend/controllers/adminController.js
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Seat = require('../models/Seat');
const Transaction = require('../models/Transaction');

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title date')
      .populate('seats', 'seatNumber')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelAndRefundBooking = async (req, res) => {
  const bookingId = req.params.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'CANCELLED') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const user = await User.findById(booking.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    user.walletBalance += booking.totalAmount;
    await user.save({ session });

    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      {
        $set: {
          status: 'AVAILABLE',
          lockedBy: null,
          lockedUntil: null
        }
      }
    ).session(session);

    booking.status = 'CANCELLED';
    await booking.save({ session });

    const transaction = new Transaction({
      userId: user._id,
      bookingId: booking._id,
      type: 'REFUND',
      amount: booking.totalAmount,
      idempotencyKey: `refund_${booking._id}`
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Booking cancelled and refunded successfully',
      booking,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

const getGlobalLedger = async (req, res) => {
  try {
    const [bookings, transactions] = await Promise.all([
      Booking.find()
        .populate('userId', 'name email')
        .populate('eventId', 'title')
        .sort({ createdAt: -1 }),
      Transaction.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
    ]);

    res.json({ bookings, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllBookings,
  cancelAndRefundBooking,
  getGlobalLedger 
};
