const express = require('express');
const router = express.Router();

const mainController  = require('../controller/mainController');


router.get('/', mainController.homepage);
router.get('/pokemon/:id(\\d+)', mainController.pokemonPage);

module.exports = router;

