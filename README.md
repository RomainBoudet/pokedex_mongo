# Pokedex_mongo

## Une petite application pour mieux prendre en main le framework aggregate de Mongo, basé un jeu de donnée de pokemons !

### => Pour l'installation de [MongoDB Community Edition](https://docs.mongodb.com/manual/installation/) et le lien direct pour [Ubuntu LTS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

* On oublie pas de lancer le serveur Mongo dans la foulée : `sudo systemctl start mongod.service`

* On créer, puis rempli un fichier .env a la racine du dossier, avec nos infos de connexion a la base de données Mongo:   
PORT=  
MONGO_URL=mongodb://localhost:27017  => si vous travailler en local...
MONGO_DBNAME=  
MONGO_DBCOLLECTION=

* => 
* => `npm i` pour installer les dépendances.
* => `npm start` pour lancer le projet.


 Dans votre navigateur sur l'url `http://localhost:<votre_port>` vous devrez retrouver l'app qui tourne !

 *** 
Plus d'info sur Mongo disponible dans l'autre recap md => recap_mongo.md !

Ce projet est également [en ligne !](https://pokedex.romainboudet.fr)

