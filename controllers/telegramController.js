const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

const configFile = require('../config');

const Fuser = require('../models/Fclient');
const Item = require('../models/Item');


const TOKEN = configFile.TELEGRAM_TOKEN;
const bot = new Telegraf(TOKEN)

// bot.use(Telegraf.log());

bot.start( async ({ reply, from, message }) => {
  createUser(message)
  reply(`Здравствуйте, ${from.first_name} ${from.last_name}! Приветствуем Вас в центре поддержки пользователей ivi.ru!\n
Задайте вопрос оператору или воспользуйтесь меню самообслуживания!`, await keyboard(1));
});

const inlineKeyboardResponse = ['yes', 'no', 'start'];
inlineKeyboardResponse.map((msg) => {
  bot.action(msg, async ({ reply, editMessageReplyMarkup }) => {
    editMessageReplyMarkup();
    reply('Спасибо за отзыв!', await keyboard(1));
  });
});

bot.on('text', async ({ reply, message }) => {
  const data = await getMenuByParentText(message.text);
  if (data && data[0].type === 'text') {
    reply(data[0].text);
    reply('Была ли статья полезна?', defaultKeyboard());
  } else if(data && data[0].type === 'button') {
    reply('Ищем ответ...', generateKeyboard(data));
  } else {
    reply('Ничего по вашему запросу не найдено :(', await keyboard(1));
  }
});

async function createUser(data) {
  const user = new Fuser({ 
    fid: data.from.id, 
    first_name: data.from.first_name, 
    last_name: data.from.last_name, 
    timezone: data.date });
  await user.save();
}

async function keyboard(level) {
  const data = await getMenuByLevel(level);
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

bot.startPolling();

exports.bot = bot;