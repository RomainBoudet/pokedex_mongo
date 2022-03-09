
require('dotenv').config();
const chalk = require('chalk'); // version 4 sinon need ESM
const express = require('express');
const helmet = require('helmet');
const crypto =require('crypto');
const app = express ();

const router = require ('./app/router/router');

//Configuration de notre moteur de vue ejs
app.set('view engine', 'ejs');
app.set('views', 'app/views');

// Envoyer des fichiers static
app.use(express.static('./app/public'));

//Pour récupérer les données du body si nécéssaire 
app.use(express.urlencoded({extended:true}));

//Config du port de notre app
const port = process.env.PORT;

// Si je veux récupérer l'ip dérriere le proxy NGINX
app.set('trust proxy', true); // L'adresse ip du client est intéerprétés comme celle la plus a gauche dans l'en tête X-Forwarded-* https://expressjs.com/fr/guide/behind-proxies.html 

app.use(helmet());

// Config for sub-resources integrity 
app.use((_, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("hex");
  next();
});

// CSP configuration and headers security
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [`'self'`,], 
      "script-src": [(_, res) => `'nonce-${res.locals.nonce}'`],
      "img-src": [`'self'` ], // "data:" nonce ne fonctionne pas avec les img car pas d'attribut nonce 
      
      "style-src": [ `'self'`,"'unsafe-inline'", 'https://fonts.googleapis.com/css?family=Bree+Serif&display=swap'], //
      "base-uri": ["'none'"],
      "object-src":["'none'"],
    
      upgradeInsecureRequests: [] 
    }
  }));

// quelques configuration de headers...
app.use((req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), fullscreen=(), autoplay=(), camera=(), display-capture=(), document-domain=(), fullscreen=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), screen-wake-lock=(), xr-spatial-tracking=()"
    );
      res.setHeader("X-XSS-Protection", "1; mode=block");
      next();
    });
  
  app.set('x-powered-by', false);

app.locals.pageTitle = `PokeDex`;
app.locals.pageDescription = `Attrapez les tous !`;

app.use(router);


app.listen(port, () => {console.log(chalk.magenta(`APP running on port ${port } !`))});



