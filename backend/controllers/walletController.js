// backend/controllers/walletController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Activity = require('../models/Activity');

const addMoney = async (req, res) => {
  const { amount, idempotencyKey } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Please provide a valid amount' });
  }
  if (!idempotencyKey) {
    return res.status(400).json({ message: 'Please provide an idempotency key' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingTx = await Transaction.findOne({ idempotencyKey }).session(session);
    if (existingTx) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'Duplicate transaction: this request has already been processed' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: amount } },
      { returnDocument: 'after', session }
    );

    if (!updatedUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    const transaction = new Transaction({
      userId: req.user._id,
      bookingId: null,
      type: 'CREDIT',
      amount,
      idempotencyKey
    });

    await transaction.save({ session });

    await new Activity({
      userId: req.user._id,
      type: 'WALLET_ADD',
      message: `Success! Added ${amount / 100} INR to capital ledger.`
    }).save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      walletBalance: updatedUser.walletBalance,
      transaction
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (
      error.code === 112 ||
      error.errorLabels?.includes('TransientTransactionError') ||
      (error.name === 'MongoServerError' && error.message.includes('WriteConflict')) ||
      error.message.includes('Write conflict') ||
      error.message.includes('WriteConflict')
    ) {
      return res.status(409).json({
        message: 'Transaction failed safely: Concurrency lock active. Your balance is protected from double-spending.'
      });
    }

    res.status(500).json({ message: error.message });
  }
};

const getWalletDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({
      walletBalance: user.walletBalance,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMoney,
  getWalletDetails
};