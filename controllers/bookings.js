const Listing = require('../models/listing');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookings');

// Route: Book a listing
module.exports.booking=async (req, res) => {
  const { id } = req.params;
  const { fromDate, toDate } = req.body;
  console.log('Booking request received for ID:', id);
  console.log('From:', fromDate, 'To:', toDate);

  const listing = await Listing.findById(id);
  if (!listing) {
    console.log('No listing found');
    return res.redirect('/listings');
  }

  const days = (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24);
  const totalPrice = listing.price * days;
  const gst = 0.18 * totalPrice;
  const finalPrice = Math.round(totalPrice + gst);
  console.log('Total price:', finalPrice);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'inr',
        product_data: { name: listing.title },
        unit_amount: listing.price * 100
      },
      quantity: days
    }],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/bookings/success?listingId=${id}&fromDate=${fromDate}&toDate=${toDate}&totalPrice=${totalPrice}`,
    cancel_url: `${process.env.BASE_URL}/listings/${id}`
  });

  console.log('Stripe session created');
  res.redirect(303, session.url);
}

//  Route: After payment success
module.exports.success=async (req, res) => {
  const { listingId, fromDate, toDate, totalPrice } = req.query;

  const booking = new Booking({
    user: req.user._id,
    listing: listingId,
    fromDate,
    toDate,
    totalPrice,
    paymentStatus: 'success'
  });

  await booking.save();
  res.render('bookings/success');
}

// Show My Bookings
module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('listing');
  res.render('bookings/mybookings', { bookings });
}


// cancel booking
module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id).populate('listing');

  if (!booking) {
    req.flash('error', 'Booking not found');
    return res.redirect('/bookings/mybookings');
  }

  
  
  await Booking.findByIdAndDelete(id);

  req.flash('success', `Booking for ${booking.listing.title} has been cancelled.`);
  res.redirect('/bookings/mybookings');
}
