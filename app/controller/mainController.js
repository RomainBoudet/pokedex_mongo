const datamapper = require('../datamapper');

const mainController = {

    homepage: async (_, res) => {

        try {

            const pokemonList = await datamapper.getAllPokemon();

            if (pokemonList === null) {
                console.log("Erreur dans le mainController dans la méthode homePage : ", )
                res.status(500).end();
            }

            res.status(200).render('list', {pokemonList})

        } catch (error) {

            console.log("Erreur dans le mainController, dans la méthode homepage : ", error);
            res.status(500).end();

        }

    }


};

module.exports = mainController;