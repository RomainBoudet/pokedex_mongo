const express = require('express');
const router = express.Router();

const {clean} = require('../middleware/sanitizer');

const mainController  = require('../controller/mainController');


router.get('/', mainController.homepage);
router.get('/pokemon/:id(\\d+)', mainController.pokemonPage);
router.get('/type', mainController.typeList);
router.get('/type/:type', mainController.typeDetail);
router.post('/pokemon/search', clean, mainController.search);


module.exports = router;

