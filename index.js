
require('dotenv').config();
const chalk = require('chalk'); // version 4 sinon need ESM
const express = require('express');
const app = express ();

const router = require ('./app/router/router');

//Configuration de notre moteur de vue ejs
app.set('view engine', 'ejs');
app.set('views', 'app/views');

// Envoyer des fichiers static
app.use(express.static('public'));

//Pour récupérer les données du body si nécéssaire 
app.use(express.urlencoded({extended:true}));

//Config du port de notre app
const port = process.env.PORT;

// Si je veux récupérer l'ip dérriere le proxy NGINX
app.set('trust proxy', true); // L'adresse ip du client est intéerprétés comme celle la plus a gauche dans l'en tête X-Forwarded-* https://expressjs.com/fr/guide/behind-proxies.html 

// Petite défense contre les xss par défault
app.use((req, res, next) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});
// Personne ne sait que l'app tourne sous express dans les en tête http !
app.set('x-powered-by', false);

app.use(router);


app.listen(port, () => {console.log(chalk.magenta(`APP running on port ${port } !`))});



