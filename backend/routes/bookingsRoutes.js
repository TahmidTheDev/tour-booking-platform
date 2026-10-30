// bookingsRoutes.js
import express from 'express';
import {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';

import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// All routes after this middleware are protected
router.use(protect);

// Public route (authenticated users)
router.get('/checkout-session/:tourId', getCheckoutSession);

router.get('/my-tours', (req, res, next) => {
  req.aliasQuery = { ...req.query, user: req.user.id };
  next();
}, getAllBookings);

// Restrict following routes to admin and lead-guide for GET (all), but allow users to POST (simulate checkout)
router.route('/').get(restrictTo('admin', 'lead-guide'), getAllBookings).post(createBooking);

router
  .route('/:id')
  .get(restrictTo('admin', 'lead-guide'), getBooking)
  .patch(restrictTo('admin', 'lead-guide'), updateBooking)
  .delete(restrictTo('admin', 'lead-guide'), deleteBooking);

export default router;
