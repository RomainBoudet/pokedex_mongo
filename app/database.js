/* const chalk = require('chalk');
const {MongoClient} = require('mongodb');

const client = new MongoClient(process.env.MONGO_URL); */

//IIFE
/**
 * Module de connection pour la base de donnée Mongo
 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
 */
/* (async () => {

try {

    await client.connect();

    await dataBaseInUse(client);
    
} catch (error) {
    console.log('Erreur dans le connecteur Mongo !', error);
 } finally {

    await client.close();
}

})(); */


/**
 * Me permet de savoir si la DB en paramétres est bien trouvé par Mongo et présent..
 * @param {MongoClient} client Un MongoClinet qui est connecté au cluster
 */
/* async function dataBaseInUse (client) {

    const databasesList = await client.db().admin().listDatabases();

    const isDbFound = databasesList.databases.find(bdd => bdd.name === process.env.MONGO_DBNAME);

    if (isDbFound === undefined) {
        console.log(chalk.red.bold("La BDD spécifiée n'a pas été trouvée !"));
    } else {
        console.log(chalk.green("BDD Mongo utilisée => "), isDbFound);
    }
};


module.exports = client; */

//! TEST 2 : Nouveau connecteur pour ne plus avoir a connecté a chaque fois --------------------------------------------------------------------

const chalk = require('chalk');
const MongoClient = require("mongodb").MongoClient

var db // pas le choix ici, je veux une portée globale..

const connectDb = (callback) => {
    if (db) return callback()
    MongoClient.connect(process.env.MONGO_URL,
        (err, database) => {
            if (err) return console.log(chalk.red.bold('Erreur dans le connecteur Mongo :'), err)

            db = database.db(process.env.MONGO_DBNAME);

            console.log(chalk.green("Connecté a la BDD Mongo !"));
            callback();
        }
    )
};

const getDb = (collectionToGet) => {
    return db.collection(collectionToGet);
};

// Un petit module qui se lance à la lecture du fichier pour indiquée sur quel bdd est branchée Mongo !
(async () => {
    let client;
    try {

        client = await MongoClient.connect(process.env.MONGO_URL);
        const databasesList = await client.db().admin().listDatabases();
        const isDbFound = databasesList.databases.find(bdd => bdd.name === process.env.MONGO_DBNAME);

        if (isDbFound === undefined) {
            console.log(chalk.red.bold("La BDD spécifiée n'a pas été trouvée !"));
        } else {
            console.log(chalk.green("BDD Mongo utilisée => "), isDbFound);
        }

    } catch (error) {
        console.log('Erreur dans le connecteur Mongo !', error);
    } finally {
        await client.close();
    }

})();

// a utiliser dans les modeles ou datamapper :
// var db;
// connectDb(async() => ( db = await getDb(process.env.MONGO_DBCOLLECTION) ))

module.exports = {
    connectDb,
    getDb,
}