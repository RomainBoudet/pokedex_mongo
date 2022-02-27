const {
    getDb,
    connectDb
} = require('./database');

var db; // db est accessible partout sans devoir connecté mongo ni lui indiqué la db ou la collection
connectDb(async () => (db = await getDb(process.env.MONGO_DBCOLLECTION)));

const datamapper = {

    getAllPokemon: async () => {

        const results = await db.find().toArray();

        if (!results[0] || results[0] === undefined) {
            return null;
        }
        return results;
    },

    getOnePokemon: async () => {

        const result = await db.findOne({});

        if (!result || result === undefined) {
            return null;
        }
        return result;

    },


};

module.exports = datamapper;