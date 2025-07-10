const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookings');
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn } = require('../middleware');
const  bookingController  = require('../controllers/bookings');

// Route: Book a listing
router.post('/:id/book', isLoggedIn, wrapAsync(bookingController.booking));


//  Route: After payment success
router.get('/success', isLoggedIn, wrapAsync(bookingController.success));

// Show My Bookings
router.get('/mybookings', isLoggedIn, wrapAsync(bookingController.myBookings));

// cancel booking
router.post('/:id/cancel', isLoggedIn, wrapAsync(bookingController.cancelBooking));



module.exports = router;
