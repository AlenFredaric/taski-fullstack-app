// backend/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const { addMoney, getWalletDetails } = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/add', protect, addMoney);
router.get('/details', protect, getWalletDetails);

module.exports = router;
