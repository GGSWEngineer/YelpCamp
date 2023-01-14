if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utilities/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require('connect-mongo');


const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

// line 12 and 13 are just requiring the routes from the route folder


const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";




mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// useCreateIndex is not supported



const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
})

// the code above (from line 15-30) is us connecting to a database

const app = express();
// if you console.dir(app), you get back an app object with a ton of methods(funcitions) in it (the main methods we use are listen, set, get, )


app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// line 37-40 is code to configure our app

app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"))
// we pass in the query string that we want to show in the URL here
app.use(express.static(path.join(__dirname, "public")))

// line 43-47 is middleware

app.use(mongoSanitize({
    replaceWith: '_',
  }));

const secret = process.env.SECRET || 'squirrel';

  const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret 
    }
});
store.on("error", function(error) {
    console.log("SESSION STORE ERROR", error)
})


const sessionConfig = {
    store,
    name:"session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet()); //including this breaks the CSP
 
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dpr2txfer/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dpr2txfer/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dpr2txfer/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dpr2txfer/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dpr2txfer/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dv5vm4sqh/" ],
            childSrc   : [ "blob:" ]
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})


app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews/", reviewRoutes)


app.get("/", (req, res) => {
    res.render("home")
})


app.all("*", (req, res, next)=> {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500, message = "Something went wrong"} = err;
    if(!err.message) err.message = "OH NO, Something went wrong"

    res.status(statusCode).render("error", {err})
})


app.listen(3000, () => {
    console.log("Serving on port 3000")
})