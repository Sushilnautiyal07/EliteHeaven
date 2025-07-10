const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressErrors=require('../utils/ExpressErrors.js');
const { isLoggedIn, isOwner, savedRedirect, validateListing } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudConfig.js'); // Assuming you have a cloudConfig.js
const upload = multer({ storage });
const Listing=require('../models/listing.js');
const ListingController = require('../controllers/listings.js');
const listings = require('../controllers/listings');




//index route
router.get('/',wrapAsync(ListingController.index));
//search route
router.get("/search", wrapAsync(listings.search));
// new route
router.get('/new',isLoggedIn,ListingController.renderNewForm);
//show route
router.get('/:id',wrapAsync(ListingController.showListing));
//create route
router.post('/',isLoggedIn,upload.single('image'),validateListing,wrapAsync(ListingController.createListing));

//edit route
router.get('/:id/edit',isLoggedIn,isOwner,wrapAsync(ListingController.renderEditForm));

//update route
router.put('/:id',isLoggedIn,isOwner,upload.single('image'),validateListing, wrapAsync(ListingController.updateListing));


// delete route
router.delete('/:id',isLoggedIn,isOwner,wrapAsync(ListingController.destroyListing));
//search route



module.exports = router;

