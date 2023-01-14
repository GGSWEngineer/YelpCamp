const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utilities/catchAsync")
const User = require("../models/user");
const { checkReturnTo } = require('../middleware');
// this object descruturing makes sense because in our middleware file -> there is a function called checkReturnTo -> whats happening is.. when we require the file, we are looking at it and looking for the function "checkReturnTo"..............instead of writing "const checkReturnTo = require('../middleware').checkReturnTo", what we have above is much shorter in code
const users = require("../controllers/users");


router.route("/register")
.get(users.renderRegister)
.post(catchAsync(users.register));

router.route("/login")
.get(users.renderUserLogin)
.post(passport.authenticate("local", {failureFlash: true, failureRedirect:"/login", failureMessage:true, keepSessionInfo: true}), users.login)

router.get('/logout', users.logout)


module.exports = router;