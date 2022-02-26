const chalk = require('chalk');
const {MongoClient} = require('mongodb');

const client = new MongoClient(process.env.MONGO_URL);

//IIFE
/**
* Module de connection pour la base de donnée Mongo
* Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
* See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
*/
(async () => {

try {

    await client.connect();

    await dataBaseInUse(client);
    
} catch (error) {
    console.log('Erreur dans le connecteur Mongo !', error);
} finally {

    await client.close();
}

})();


/**
* Me permet de savoir si la DB en paramétres est bien trouvé par Mongo et présent..
* @param {MongoClient} client Un MongoClinet qui est connecté au cluster
*/
async function dataBaseInUse (client) {

    const databasesList = await client.db().admin().listDatabases();

    const isDbFound = databasesList.databases.find(bdd => bdd.name === process.env.MONGO_DBNAME);

    if (isDbFound === undefined) {
        console.log(chalk.red.bold("La BDD spécifiée n'a pas été trouvée !"));
    } else {
        console.log(chalk.green("BDD Mngo utilisée => "), isDbFound);
    }
};

module.exports = client;