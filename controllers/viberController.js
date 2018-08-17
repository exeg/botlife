const ViberBot  = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;
const KeyboardMessage = require('viber-bot').Message.Keyboard;
const axios = require('axios');
const Fuser = require('../models/Fclient');
const Item = require('../models/Item');
const util = require('util');
const CronJob = require('cron').CronJob;
const setTimeoutPromise = util.promisify(setTimeout);
const operatorMessageTemplate = require('../templates/viberTemplate').viberTemplate();
const configFile = require('../config');
const operatorModeActive = [];
const connectToOperator = 'Связаться с оператором';
run();
// const { createLogger, format, transports } = require('winston');

// const logger = createLogger({ 
//   level: "debug", // We recommend using the debug level for development
//   format: format.combine(
//     format.splat(),
//     format.simple()
//   ),
//   transports: [new transports.Console()]
// });
 
const bot = new ViberBot({
  authToken: configFile.cfg.authToken,
  name: configFile.cfg.name,
  avatar: configFile.cfg.avatar,
});

bot.onSubscribe(async (response) => {
  let message = new TextMessage(`Здравствуйте, ${response.userProfile.name}. Приветствуем Вас в центре поддержки пользователей ivi.ru!\nЗадайте вопрос оператору или воспользуйтесь меню самообслуживания!`);
  let tmp = await keyboard(1);
  response.send([message,new KeyboardMessage(tmp)]);
  let newfUser = new Fuser({ fid: response.userProfile.id, first_name: response.userProfile.name, botsys: "viber" });
  await newfUser.save();
});

setTimeoutPromise(80).then(() => { 
  bot.setWebhook('https://fapiexeg.com/api/viber/webhook').then(() => console.log('set webhook')).catch(err => console.log(err));
});

async function likeKeyboard (id) {
  let template = {
    Type: "keyboard",
    Revision: 1,
    Buttons: []
  }
  template.Buttons.push({BgColor: "#2db9b9", Columns: 2, Rows: 1, ActionType: "reply", Text: "Да", ActionBody: "Отзыв Да " + id});
  template.Buttons.push({BgColor: "#2db9b9", Columns: 2, Rows: 1, ActionType: "reply", Text: "Нет", ActionBody: "Отзыв Нет " + id});
  template.Buttons.push({BgColor: "#2db9b9", Columns: 2, Rows: 1, ActionType: "reply", Text: "В Начало", ActionBody: "В Начало"});
  return template;
}

async function keyboard (level=1, items=null) {
  let gitems;	
  let template = {
  	Type: "keyboard",
	  Revision: 1,
	  Buttons: []
  }
  if (!items) {
    gitems = await Item.find({ level: level });
  } else { 
    gitems = items;
  }
  for (let i in gitems) {
  	template.Buttons.push({BgColor: "#2db9b9", Columns: 6, Rows: 1, ActionType: "reply", Text: gitems[i].text, ActionBody: gitems[i].text})
  }
  return template;
}

 
// Perfect! Now here's the key part:
bot.on(BotEvents.MESSAGE_RECEIVED, async (message, response) => {
  const userId = response.userProfile.id;
  const user = await Fuser.findOne({ fid: response.userProfile.id });
  let operatorMode = isUserInOperatorMode(userId);
  if (!operatorMode && message.text === connectToOperator) {
    user.askHelp++;
    user.save();    
    operatorModeActive.push(user);
    response.send(new TextMessage('Добрый день, Какой у вас вопрос?'));
    return;
  }


  if (!operatorMode) {
    const data = await getMenuByParentText(message.text);
    if (data && data[0].type === 'text') {
      let tmp = await likeKeyboard(data[0]._id);
      response.send(new TextMessage(data[0].text));
      setTimeoutPromise(20).then(() => { 
        response.send([new TextMessage('Была ли статья полезна?'), new KeyboardMessage(tmp)]);
      });
    } else if(data && data[0].type === 'button') {
    	let tmp = await keyboard(1,data);
      response.send(new KeyboardMessage(tmp));
    } else {
      if (message.text.includes("Отзыв Да")) {
        let res = {
          article: message.text.slice(9, message.text.length), 
          result: 1 
        }
        user.votes.push(res);
        user.save();
      } 
      if (message.text.includes("Отзыв Нет")) { 
        let res = {
          article: message.text.slice(10, message.text.length),
          result: 0 
        }
        user.votes.push(res);
        user.save();
      }
      let mes = new TextMessage(`Здравствуйте, ${response.userProfile.name}. Приветствуем Вас в центре поддержки пользователей Ivi.ru!\nЗадайте вопрос оператору или воспользуйтесь меню самообслуживания!`);
    	let tmp = await keyboard(1,null);
      response.send([mes, new KeyboardMessage(tmp)]);
    }
  }
  if (operatorMode) {
    operatorMessageTemplate.sender.id = userId;
    operatorMessageTemplate.sender.name = response.userProfile.name;
    operatorMessageTemplate.sender.avatar = response.userProfile.avatar;
    operatorMessageTemplate.sender.language = response.userProfile.language;
    operatorMessageTemplate.sender.country = response.userProfile.country;

    operatorMessageTemplate.message.text = message.text;
    operatorMessageTemplate.message_token = message.token;
    axios.post('https://api.blinger.ru/viber_webhook?user_id=1219144', operatorMessageTemplate)
  }
});

async function getMenuByParentText(text) {
  const parent = await Item.findOne({ text });
  if (parent === null) {
    return undefined;
  }
  return await Item.find({ master: parent._id });
}

function isUserInOperatorMode(userId) {
  return operatorModeActive.find(u => u.fid === userId)
}

function run() {
  const job = new CronJob({
    cronTime: '* * 20 * *',
    onTick: async function () {
      operatorModeActive = [];     
    },
    start: true,
    timeZone: "Atlantic/Azores"
  });
}

exports.vbot = bot;