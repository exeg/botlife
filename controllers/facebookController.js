//facebookController
const mongoose = require('mongoose');
const BootBot = require('bootbot');
const Fuser = require('../models/Fclient');
const Item = require('../models/Item');



const bot = new BootBot({
  accessToken:'EAADfSiFZCkfMBAAQC5Rgu8tMr00k1BmQF1WZAgzFVZBO2y2i2nUSAcveimFHaGsGXUk6uMXMDYMJUVeYZC9aX0INZCMBEZCTaCXdwTFf2riPj5asCYx8e8oL1Hcaqd90pP9JkHMSZCGM7UsTME665weCZB5koZAUbOUkgJk8ZAyXSGzQZDZD',
  verifyToken: 'persistent battle',
  appSecret: '77bebd9f917100949057155d8e95a24d'
});

bot.setGreetingText(`Здравствуйте! Приветствуем Вас в центре поддержки пользователей Ivi.ru !
Задайте вопрос оператору или воспользуйтесь меню самообслуживания!`);

bot.setGetStartedButton( async (payload, chat) => {
  chat.getUserProfile().then( async (user) => {
    let gitems = await Item.find({ level: 1 });
    chat.say({ 
      text: `Здравствуйте ${user.first_name}, Задайте вопрос оператору или воспользуйтесь меню самообслуживания!.`, 
      buttons: [
      { type: 'postback', title: gitems[0].text, payload: String(gitems[0]._id) },
      { type: 'postback', title: gitems[1].text, payload: String(gitems[1]._id) },
      { type: 'postback', title: gitems[2].text, payload: String(gitems[2]._id) }
    ]
    });
    const newfUser = new Fuser({ fid: user.id, first_name: user.first_name, last_name: user.last_name, timezone: user.timezone });
    await newfUser.save();
  });
});


bot.on('message', (payload, chat) => {
  const text = payload.message.text;
  chat.say(`Echo: ${text}`);
});

bot.on('postback', async (payload, chat) => {
  const userId = payload.sender.id;
  // chat.userId = userId;
  // console.log(payload, 'The Help Me button was clicked!');
  let answers = await Item.find({ master: payload.postback.payload });
  if (answers[0].type === 'button') {
    let message = {};
    message.text = "";
    message.buttons = [];    
    for (let i in answers) {
      message.text = answers[i].text
      message.buttons = [];
      message.buttons.push( { type: 'postback', title: "Ok", payload: String(answers[i]._id) } );
      bot.say(userId, message);
    };
  }
  if (answers[0].type === 'text') {
    bot.say(userId, answers[0].text);

  }

   // console.log(answers)

});


exports.testFacebook = async () => {
  let fitems = await Item.find({ level: 1 });
  console.log(fitems);
}

exports.verifyFacebook = async (req,res) => {
  if (req.query['hub.verify_token'] === 'persistent battle'){
    return res.send(req.query['hub.challenge'])
  }
  res.send('wrong token')
}

exports.processFacebook = async (req, res) => {
  let data = req.body;
    if (data.object !== 'page') {
      return;
    }
    // console.log(data, "Yee");
    let ress = data.entry;
    for (let i in ress) {
      // console.log(ress[i]);
      // console.log(ress[i].messaging);
    }
  bot.handleFacebookData(data);
  // Must send back a 200 within 20 seconds or the request will time out.
  res.sendStatus(200);
}
