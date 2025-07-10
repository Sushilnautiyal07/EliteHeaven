if(process.env.NODE_ENV !== 'production') {
require('dotenv').config()
}
const express=require('express');
const mongoose=require('mongoose');
const app=express();
const path=require('path');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const ExpressErrors=require('./utils/ExpressErrors.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash'); 
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js'); 
const listingRouter=require('./routes/listing.js');
const reviewRouter=require('./routes/review.js');
const userRouter=require('./routes/user.js');
const multer  = require('multer')
const {storage} = require('./cloudConfig.js'); // Assuming you have a cloudConfig.js file for cloudinary storage
const upload = multer({ storage })
const bookingRoutes = require('./routes/bookings.js');

const dburl= process.env.ATLASDB_URL;
main().then(() => {
    console.log("Connected to MongoDB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dburl);

}
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());  
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,'public')));



const store = MongoStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 3600, // time period in seconds after which session will be updated
    crypto: {
        secret: process.env.SECRET 
    }
}); 

store.on('error', function(e) {
    console.log("Session store error:", e);
});

const sessionOptions = {
    store: store, // Use MongoStore to store sessions in MongoDB
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }

};

// app.get('/',(req,res)=>{
//     res.send("hello world");
// });

app.use(session(sessionOptions));
app.use(flash());//lisitng wali route se pehle use krnge kyuki listing  page par flash messages show krni hai

app.use(passport.initialize());// Initialize Passport
app.use(passport.session());// Use sessions to keep track of logged-in users
passport.use(new LocalStrategy(User.authenticate()));// Use LocalStrategy for authentication for user login
// User.authenticate() is a method provided by passport-local-mongoose to handle username and password authentication
passport.serializeUser(User.serializeUser());// Serialize user information into the session
passport.deserializeUser(User.deserializeUser());// Deserialize user information from the session


// Middleware to make flash messages available in all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user; // Make current user available in all views
    res.locals.isLoggedIn = req.isAuthenticated(); // Check if user is logged in
    next();
});

app.get('/', (req, res) => {
    res.redirect('/listings'); // Or res.render('home.ejs') if you have a custom homepage
});

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);
app.use('/bookings', bookingRoutes);



app.use((req,res,next)=>{
    next(new ExpressErrors(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    res.render('error.ejs',{message});
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("Server is running on port 8080");
});