// const express = require('express');
// const router = express.Router();
// const { createEvent, getEvents, getEventSeats } = require('../controllers/eventController');
// const { protect, admin } = require('../middlewares/authMiddleware');

// router.get('/', getEvents);
// router.post('/', protect, admin, createEvent);
// router.get('/:id/seats', getEventSeats);

// module.exports = router;




// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();

const { createEvent, getEvents, getEventSeats, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getEvents);
router.post('/', protect, admin, createEvent);
router.get('/:id/seats', getEventSeats);

router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;

