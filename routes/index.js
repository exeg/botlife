const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
// const Item = require('../models/Item');
const facebookController = require('../controllers/facebookController');
const userController = require('../controllers/userController');
// const telegramController = require('../controllers/telegramController');
const viberController = require('../controllers/viberController');
const { catchErrors } = require('../handlers/errorHandlers');

// const urlParser = bodyParser.urlencoded({extended: true});
const jsonParser = bodyParser.json();
const textParser = bodyParser.text({ type: "*/*" });


router.use('/viber/webhook', textParser, viberController.vbot.middleware());

router.get('/items', jsonParser, userController.getItems);

router.get('/stats', jsonParser, userController.getStats);

router.put('/item/:id', jsonParser, userController.isLoggedIn, userController.editItem);

router.get('/regtest', jsonParser, userController.regDefault);

router.post('/login', jsonParser, userController.login);

router.get('/logout', jsonParser, userController.logout);

router.get('/', function(req, res) {
  res.send("hey there boi")
})

//router.get('/info', jsonParser, catchErrors(facebookController.testFacebook)); 
	//async function(req, res) {
	// let result = {};
	// result.mainMenu = [];
	// result.level2 = [];
 //  const items = await Item.find().populate('master');
 //  for (let i in items) {
 //  	if (items[i].level === 1) result.mainMenu.push(items[i].text);
 //  	if (items[i].level === 2 ) result.level2.push(items[i].master.text + ' --> ' + items[i].text);

 //  }
  // console.log(result);
  
  // const newItem = {level: 1, master: "5b0cb0182a7fc51c7807b341", text: 'В Ivi.ru фильмы делятся на три группы: блокбастеры, фильмы по подписке "Ivi.ru", бесплатные. Блокбастеры отмечены значком кошелька.  Фильмы из этого раздела можно приобрести навсегда или взять в аренду. Фильмы из каталога "Ivi.ru"  отмечены значком плюса. Данные фильмы доступны только при оформлении подписки "Ivi".ru. Фильмы, не отмеченные значком плюса или кошелька доступны для просмотра бесплатно. Их воспроизведение сопровождается рекламой, которую можно отключить, оформив подписку "Ivi.ru".'};

// }) /viber/webhook", bot.middleware());


router.get('/webhook/', jsonParser, catchErrors(facebookController.verifyFacebook)); 
router.post('/webhook/', jsonParser, catchErrors(facebookController.processFacebook));



module.exports = router;