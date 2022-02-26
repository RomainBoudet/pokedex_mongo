
const db = require('../database');

const mainController = {

homepage: async (_, res) => {

    try {

        res.status(200).send("Hello world !");
        
    } catch (error) {
        console.log("Erreur dans le mainController, dans la méthode homepage : ", error);
        res.status(500).end();
    }

}


};

module.exports = mainController;
