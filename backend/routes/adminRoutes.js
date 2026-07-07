const express = require('express');
const router = express.Router();
const { getAllBookings, cancelAndRefundBooking,getGlobalLedger } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/bookings', protect, admin, getAllBookings);
router.post('/cancel/:id', protect, admin, cancelAndRefundBooking);
router.get('/global-ledger', protect, admin, getGlobalLedger);

module.exports = router;
