const mongoose = require('mongoose');
const passport = require('passport');
const Fuser = require('../models/Fclient');
const Item = require('../models/Item');
const User = require('../models/User');


exports.getItems = async (req, res) => {
  let items = await Item.find();
  let result = {};
  result.level_1 = [];
  result.level_2 = [];
  result.level_3 = [];
  for (itm of items) {
    if (itm.level === 1) result.level_1.push(itm);
    if (itm.level === 2) result.level_2.push(itm); 	
    if (itm.level === 3) result.level_3.push(itm); 	
 	
  } 

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(result, null, 3));
}


exports.regDefault = async (req, res) => {
  const user = new User({email: 'test@mail.com', name: 'test'});
  await user.setPassword('test');
  await user.save();
  res.redirect('/');
  // const { user } = await DefaultUser.authenticate()('user', 'password');
}

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  // req.flash('success', 'You are now logged out! 👋');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); // carry on! They are logged in!
    return;
  }
  // req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};