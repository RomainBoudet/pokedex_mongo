# Pokedex_mongo

## Une petite application pour mieux prendre en main le framework aggregate de Mongo, basé un jeu de donnée de pokemons !

### => Pour l'installation de [MongoDB Community Edition](https://docs.mongodb.com/manual/installation/) et le lien direct pour [Ubuntu LTS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

* On oublie pas de lancer le serveur Mongo dans la foulée : `sudo systemctl start mongod.service`

* On créer, puis rempli un fichier .env a la racine du dossier, avec nos infos de connexion a la base de données Mongo:   
PORT=  
MONGO_URL=mongodb://localhost:27017  => si vous travailler en local...
MONGO_DBNAME=pokemon 
MONGO_DBCOLLECTION=samples_pokemon

* => On import la DB : depuis le dossier racine de ce repo : `mongorestore -d pokemon data/` (Cela créer la db pour nous !)
* => On peut vérifier que tout c'est bien passé : `mongosh` => `show dbs` : on devrait voir la db "pokemon". `use pokemon` => `show collections` : On devrait voir la collection "samples_pokemon". Si ont veut renommer cette collection : `db.samples_pokemon.renameCollection("mon_nouveau_nom-de_collection")` (On oublie pas de mettre a jout le .env avec le nouveau nom...)
* => `npm i` pour installer les dépendances.
* => `npm start` pour lancer le projet.


 Dans votre navigateur sur l'url `http://localhost:<votre_port>` vous devrez retrouver l'app qui tourne !

 *** 

Ce projet est également [en ligne !](https://pokedex.romainboudet.fr)

