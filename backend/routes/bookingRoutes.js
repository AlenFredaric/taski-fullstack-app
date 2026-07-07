// // backend/routes/bookingRoutes.js
// const express = require('express');
// const router = express.Router();
// const { reserveSeats, bookSeats } = require('../controllers/bookingController');
// const { protect } = require('../middlewares/authMiddleware');

// router.post('/reserve', protect, reserveSeats);
// router.post('/confirm', protect, bookSeats);

// module.exports = router;




// 
// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { reserveSeats, bookSeats, getBookings } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware'); // protect അല്ലെങ്കിൽ നിങ്ങളുടെ authMiddleware പേര് നൽകുക

// 💡 1. POST റൂട്ടുകൾ (നിലവിലുള്ളത്)
router.post('/reserve', protect, reserveSeats);
router.post('/confirm', protect, bookSeats);

// 💡 2. FIXED: നിങ്ങളുടെ ഫ്രണ്ട് എൻഡ് വിളിക്കുന്ന ആ മെയിൻ GET എപിഐ ലിങ്ക് ഇതാണ്!
router.get('/', protect, getBookings); 
// router.get('/', getBookings);

module.exports = router;
