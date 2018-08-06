//facebookController
const mongoose = require('mongoose');
const BootBot = require('bootbot');
const axios = require('axios');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
const Fuser = require('../models/Fclient');
const Item = require('../models/Item');
const operatorMessageTemplate = require('../templates/facebookTemplate').facebookTemplate();

const operatorModeActive = [];


const bot = new BootBot({
  accessToken:'EAADfSiFZCkfMBAIf566aVUQuNMbQa83cJgSF3niurOmu7va3g2Y7Itgi3ZBRsMEzO5FJ3JB54VCAaSYYwjnSS45B638LOMioTlGICFMuZC72WmreoJotJc02QUQcSRsj8tbzvwEshBQL83YDH17AOhG1H4ZBx8KZC2ssk3gxMGQZDZD',
  verifyToken: 'persistent battle',
  appSecret: '77bebd9f917100949057155d8e95a24d'
});

async function mainMenu () {
  let gitems = await Item.find({ level: 1 });
  let buttons = [
      { type: 'postback', title: gitems[0].text, payload: String(gitems[0]._id) },
      { type: 'postback', title: gitems[1].text, payload: String(gitems[1]._id) },
      { type: 'postback', title: gitems[2].text, payload: String(gitems[2]._id) }
    ]
  return buttons;
}

bot.setGreetingText(`Здравствуйте! Приветствуем Вас в центре поддержки пользователей ivi.ru !
Задайте вопрос оператору или воспользуйтесь меню самообслуживания!`);

bot.setGetStartedButton( async (payload, chat) => {
  chat.getUserProfile().then( async (user) => {
    let buttons = await mainMenu();
    chat.say({ 
      text: `Здравствуйте ${user.first_name}, Задайте вопрос оператору или воспользуйтесь меню самообслуживания!.`, 
      buttons: buttons
    });
    chat.say({
          text: `Задайте ваш вопрос после нажатия этой кнопки.`, 
          buttons: [ { type: 'postback', title: 'Связь с оператором', payload: 'BLINGER_HELP' } ]
    })
    const newfUser = new Fuser({ fid: user.id, first_name: user.first_name, last_name: user.last_name, timezone: user.timezone });
    await newfUser.save();
  });
});


bot.on('message', async (payload, chat) => {
  if (payload.message.quick_reply) {
    if (payload.message.text === "Да");
    if (payload.message.text === "Нет");
    if (payload.message.text === "В Начало") {
      let buttons = await mainMenu();
      chat.say({
        text: `Задайте вопрос оператору или воспользуйтесь меню самообслуживания!.`,
        buttons: buttons 
      });
      chat.say({
        text: `Задайте ваш вопрос после нажатия этой кнопки.`, 
        buttons: [ { type: 'postback', title: 'Связь с оператором', payload: 'BLINGER_HELP' } ]
      })
    }
    // console.log(payload.message.quick_reply.payload); 
  }
  const userId = payload.sender.id;
  let operatorMode = isUserInOperatorMode(userId);
  if (operatorMode) {
    operatorMessageTemplate.entry[0].messaging[0].sender.id = userId;
    operatorMessageTemplate.entry[0].messaging[0].message.text = payload.message.text;
    axios.post('https://api.blinger.ru/facebook_webhook', operatorMessageTemplate)
  }
  // const text = payload.message.text;
  // chat.say(`Echo: ${text}`);
});

bot.on('postback', async (payload, chat) => {
  const userId = payload.sender.id;
  if (payload.postback.payload === 'BLINGER_HELP') {
    const user = await Fuser.findOne({ fid: userId });
    operatorModeActive.push(user);
    bot.say(userId, "Добрый день, Какой у вас вопрос?");
    return;
  }
  // if (operatorMode === false) {
    let answers = await Item.find({ master: payload.postback.payload });
    if (answers[0].type === 'button') {
      let message = {};
      message.text = "";
      message.buttons = [];
      for (let i in answers) {
        message.text = answers[i].text
        message.buttons = [];
        message.buttons.push( { type: 'postback', title: "Подробнее", payload: String(answers[i]._id) } );
        bot.say(userId, message);
      };
    }
    if (answers[0].type === 'text') {
      bot.say(userId, answers[0].text);
      setTimeoutPromise(40).then(() => {
        let message = {};
        message.text = "Была ли статья полезна?";
        message.quickReplies = [ {
          content_type: 'text',
          title:'Да',
          payload: String(answers[0]._id)
          },
         {
          content_type: 'text',
          title: "Нет",
          payload: String(answers[0]._id) 
          },
          {
          content_type: 'text',
          title: "В Начало",
          payload: String(answers[0]._id)   
          }];
        bot.say(userId, message);
      });
    }
  // }


   // console.log(answers)

});

function isUserInOperatorMode(userId) {
  return operatorModeActive.find(u => u.fid === userId);
}


// exports.testFacebook = async (req, res) => {
//   const newItem = { type:"button", master: null, level: 1,"text":"Связаться с оператором" };
//   await (new Item(newItem)).save();  
//   let fitems = await Item.find({ level: 1 });
//   console.log(fitems);
// }

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
    // let ress = data.entry;
    // for (let i in ress) {
    //   console.log(ress[i]);
    //   console.log(ress[i].messaging);
    }
  bot.handleFacebookData(data);
  // Must send back a 200 within 20 seconds or the request will time out.
  res.sendStatus(200);
}
