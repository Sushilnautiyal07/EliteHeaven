const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const WrapAsync = require('../utils/wrapAsync.js');
const { route } = require('./listing');
const passport = require('passport');
const { isLoggedIn, savedRedirect } = require('../middleware.js');
const userController = require('../controllers/users.js');
const user = require('../models/user.js');

router.get('/signup',userController.renderSignupForm);

router.post('/signup', WrapAsync(userController.signup));

router.get('/login',userController.renderLoginForm);

router.post('/login',savedRedirect,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),userController.login);

router.get('/logout',userController.logout);

module.exports = router;