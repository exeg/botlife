//facebookController
const mongoose = require('mongoose');
const BootBot = require('bootbot');


const bot = new BootBot({
  accessToken:'EAADfSiFZCkfMBAAQC5Rgu8tMr00k1BmQF1WZAgzFVZBO2y2i2nUSAcveimFHaGsGXUk6uMXMDYMJUVeYZC9aX0INZCMBEZCTaCXdwTFf2riPj5asCYx8e8oL1Hcaqd90pP9JkHMSZCGM7UsTME665weCZB5koZAUbOUkgJk8ZAyXSGzQZDZD',
  verifyToken: 'persistent battle',
  appSecret: '77bebd9f917100949057155d8e95a24d'
});

bot.setGreetingText(`Здравствуйте! Приветствуем Вас в центре поддержки пользователей Ivi.ru !
Задайте вопрос оператору или воспользуйтесь меню самообслуживания!`);

bot.setGetStartedButton((payload, chat) => {
  chat.getUserProfile().then((user) => {
    chat.say({ 
      text: `Здравствуйте ${user.first_name}, Задайте вопрос оператору или воспользуйтесь меню самообслуживания!.`, 
      quickReplies: [
      { content_type:"text", title: 'Фильмы на Ivi.ru', payload: 'HELP_SETTINGS' },
      { content_type:"text", title: 'Финансовые вопросы', payload: 'HELP_FAQ' },
      { content_type:"text", title: 'Технические вопросы', payload: 'HELP_HUMAN' }
    ]
    });
  });
});


bot.on('message', (payload, chat) => {
  const text = payload.message.text;
  chat.say(`Echo: ${text}`);
});

bot.on('postback: BOOTBOT_GET_STARTED', (payload, chat) => {
  console.log('The Help Me button was clicked!');
});



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
    console.log(data, "Yee");
    let ress = data.entry;
    for (let i in ress) {
      console.log(ress[i]);
      console.log(ress[i].messaging);
    }
  bot.handleFacebookData(data);
  // Must send back a 200 within 20 seconds or the request will time out.
  res.sendStatus(200);
}
