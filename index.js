'use strict';
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const BootBot = require('bootbot');
const User = require('./models/User');
const Item = require('./models/Item');
 // console.log(Item);

mongoose.connect('mongodb://localhost:27017/testbot');
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});







const app = express();


// const bot = new BootBot({
//   accessToken:'EAADfSiFZCkfMBAAQC5Rgu8tMr00k1BmQF1WZAgzFVZBO2y2i2nUSAcveimFHaGsGXUk6uMXMDYMJUVeYZC9aX0INZCMBEZCTaCXdwTFf2riPj5asCYx8e8oL1Hcaqd90pP9JkHMSZCGM7UsTME665weCZB5koZAUbOUkgJk8ZAyXSGzQZDZD',
//   verifyToken: 'persistent battle',
//   appSecret: '77bebd9f917100949057155d8e95a24d'
// });

// bot.on('message', (payload, chat) => {
//   const text = payload.message.text;
//   chat.say(`Echo: ${text}`);
// });



app.set('port', (process.env.PORT || 3000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())



app.get('/', function(req, res) {
  res.send("hey there boi")
})

app.get('/info', async function(req, res) {
	let result = {};
	result.mainMenu = [];
	result.level2 = [];
  const items = await Item.find().populate('master');
  for (let i in items) {
  	if (items[i].level === 1) result.mainMenu.push(items[i].text);
  	if (items[i].level === 2 ) result.level2.push(items[i].master.text + ' --> ' + items[i].text);

  }
  console.log(result);
  // const newItem = {level: 3, master: "5b0cb0182a7fc51c7807b341", text: 'В Ivi.ru фильмы делятся на три группы: блокбастеры, фильмы по подписке "Ivi.ru", бесплатные. Блокбастеры отмечены значком кошелька.  Фильмы из этого раздела можно приобрести навсегда или взять в аренду. Фильмы из каталога "Ivi.ru"  отмечены значком плюса. Данные фильмы доступны только при оформлении подписки "Ivi".ru. Фильмы, не отмеченные значком плюса или кошелька доступны для просмотра бесплатно. Их воспроизведение сопровождается рекламой, которую можно отключить, оформив подписку "Ivi.ru".'};
  // const itttt = await (new Item(newItem)).save();

})


app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === 'persistent battle'){
    return res.send(req.query['hub.challenge'])
  }
  res.send('wrong token')
})


// app.post('/webhook/', (req, res) => {
//   let data = req.body;
//     if (data.object !== 'page') {
//       return;
//     }
//     console.log(data, "Yee");
//   bot.handleFacebookData(data);
//   // Must send back a 200 within 20 seconds or the request will time out.
//   res.sendStatus(200);
// })
 
app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
})
