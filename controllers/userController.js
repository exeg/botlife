const mongoose = require('mongoose');
const passport = require('passport');
const Fuser = require('../models/Fclient');
const Item = require('../models/Item');
const User = require('../models/User');




exports.getStats = async (req, res) => {
  const users = await Fuser.find();

  let result = {};
  result.faceBookUsers = users.filter((e) => e.botsys === 'facebook').length;
  result.viberUsers = users.filter((e) => e.botsys === 'viber').length;
  result.telegramUsers = users.filter((e) => e.botsys === 'telegram').length;
  result.allCount = result.faceBookUsers + result.viberUsers + result.telegramUsers; 

  result.askForHelp = users.filter((e) => e.askHelp > 0 ).length;
  let votes = [];
  for (usr of users) {
    if (usr.votes.length > 0) {
      let vt = usr.votes.map(d => d.toObject());
      votes = votes.concat(vt);
    } 
  }

  let grouped = Array.from(
    votes.reduce((m, { article, result }) => m.set(article, (m.get(article) || 0) + result), new Map)
    .entries(), ([article, result]) => ({ article, result }) );

  grouped = await Promise.all(grouped.map(async d => {
    let tmp = await Item.findOne({ _id: d.article });
    d.text = tmp.text;
    return d;
    }));
   console.log(grouped);
   result.articles = grouped;

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(result, null, 3));
}

exports.editItem = async (req, res) => {
  const item = await Item.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true
   }).exec();
  if (item) {
    res.status(200).json({
      item: item,
      status: 'Update successful!',
    });
  } else {
    throw err;
  }

}

exports.getItems = async (req, res) => {
  let items = await Item.find();

  let result = {};
  result.level_1 = [];
  result.level_2 = [];
  result.level_3 = [];
  result.lines = [];
  for (itm of items) {
    if (itm.level === 1) result.level_1.push(itm);
    if (itm.level === 2) result.level_2.push(itm); 	
    if (itm.level === 3) result.level_3.push(itm); 	
 	
  }
  for (itm of result.level_3) {
    let level2 = result.level_2.filter((e) => String(e._id) === String(itm.master))[0];
    let level1 = result.level_1.filter((e) => String(e._id) === String(level2.master))[0];
    let line = {
      level_1: level1,
      level_2: level2,
      level_3: itm
    }
    result.lines.push(line); 
  } 

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(result.lines, null, 3));
}

exports.regDefault = async (req, res) => {
  const user = new User({email: 'test@mail.com', name: 'test'});
  await user.setPassword('test');
  await user.save();
  res.redirect('/');
  // const { user } = await DefaultUser.authenticate()('user', 'password');
}

exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.status(401).json({
        err: info
      });
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }        
      res.status(200).json({
        status: 'Login successful!',
        success: true
      });

    });
  })(req, res, next);
}

exports.logout = (req, res) => {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
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