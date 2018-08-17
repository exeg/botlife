const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const axios = require('axios');
const CronJob = require('cron').CronJob;
const configFile = require('../config');

const Fuser = require('../models/Fclient');
const Item = require('../models/Item');
const telegramTemplate = require('../templates/telegramTemplate').telegramTemplate

const TOKEN = configFile.cfg.TELEGRAM_TOKEN;
const bot = new Telegraf(TOKEN)

const operatorModeActive = [];
const connectToOperator = 'Связаться с оператором';
run();

bot.use(Telegraf.log());


bot.start( async ({ reply, from, message }) => {
  createUser(message)
  reply(`Здравствуйте, ${from.first_name} ${from.last_name}! Приветствуем Вас в центре поддержки пользователей ivi.ru!\n
Задайте вопрос оператору или воспользуйтесь меню самообслуживания!`, await keyboard(1));
});

const inlineKeyboardResponse = ['yes', 'no', 'start'];
inlineKeyboardResponse.map((msg) => {
  bot.action(msg, async ({ reply, message, editMessageReplyMarkup }) => {
    editMessageReplyMarkup();
    if (msg !== 'start') {
      const result = msg === 'yes' ? 1 : 0;
      const article = await Item.findOne({ text: message.text })
      const res = {
        article: article._id,
        result,
      };
      const user = await Fuser.findOne({ fid: message.from.id });
      user.votes.push(res);
      user.save();
    }
    reply('Спасибо за отзыв!', await keyboard(1));
  });
});

bot.on('text', async ({ reply, message }) => {
  if (!isUserInOperatorMode(message.from.id) && message.text === connectToOperator) {
    const user = await Fuser.findOne({ fid: message.from.id });
    user.askHelp = user.askHelp + 1;
    user.save();
    operatorModeActive.push(user);
      reply('Добрый день, Какой у вас вопрос?');
  } else if (isUserInOperatorMode(message.from.id)) {
    await sendToHook(message)
  }
  if (!isUserInOperatorMode(message.from.id)) {
    const data = await getMenuByParentText(message.text);
    if (data && data[0].type === 'text') {
      reply(data[0].text);
      reply('Была ли статья полезна?', defaultKeyboard());
    } else if(data && data[0].type === 'button') {
      reply('Ищем ответ...', generateKeyboard(data));
    } else {
      reply('Ничего по вашему запросу не найдено :(', await keyboard(1));
    }
  }
});

async function sendToHook(message) {
  const template = getNewTemplate(message)
  await axios.post('https://api.blinger.ru/telegram_bot_webhook?user_id=1368062', template)
    .then(e => console.log(e))
    .catch(e => console.log(e))
}

function getNewTemplate(message) {
  const t = Object.assign({}, telegramTemplate)
  t.message = message
  return t
}

function isUserInOperatorMode(userId) {
  return operatorModeActive.find(u => Number(u.fid) === userId)
}

async function createUser(data) {
  const user = new Fuser({ 
    fid: data.from.id, 
    first_name: data.from.first_name, 
    last_name: data.from.last_name, 
    timezone: data.date,
    botsys: "telegram" 
  });
  await user.save();
}

async function keyboard(level) {
  const data = await getMenuByLevel(level);
  data.push(connectToOperator)
  return generateKeyboard(data);
}

async function getMenuByLevel(level) {
  return await Item.find({ level });
}

async function getMenuByParentText(text) {
  const parent = await Item.findOne({ text });
  if (parent === null) {
    return undefined;
  }
  return await Item.find({ master: parent._id });
}

function generateKeyboard(data) {
  return Markup
    .keyboard(data)
    .oneTime()
    .resize()
    .extra();
}

function defaultKeyboard() {
  return Markup
    .inlineKeyboard([
      Markup.callbackButton('👍', 'yes'),
      Markup.callbackButton('👎', 'no'),
      Markup.callbackButton('В начало', 'start'),
    ])
    .extra();
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

bot.startPolling();

exports.bot = bot;