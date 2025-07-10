const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressErrors=require('../utils/ExpressErrors.js');
const {reviewSchema} = require('../schema.js');
const Review=require('../models/review.js');
const Listing=require('../models/listing.js');
const {isLoggedIn} = require('../middleware.js'); // Importing the isLoggedIn middleware
const {validateReview,isReviewAuthor} = require('../middleware.js');  // Importing the validateReview middleware
const reviewController = require('../controllers/reviews.js');


//Review route//
router.post('/',isLoggedIn,validateReview, wrapAsync(reviewController.createReview));
//delete review route
router.delete('/:reviewId',isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;