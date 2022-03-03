const datamapper = require('../datamapper');

const mainController = {

    homepage: async (_, res) => {

        try {

            const pokemonList = await datamapper.getAllPokemon();

            if (pokemonList === null) {
                console.log("Erreur dans le mainController dans la méthode homePage : ", )
                res.status(500).end();
            }

            res.status(200).render('homepage', {pokemonList})

        } catch (error) {

            console.log("Erreur dans le mainController, dans la méthode homepage : ", error);
            res.status(500).end();

        }

    },

    pokemonPage : async (req, res) => {

        try {

            const id = parseInt(req.params.id, 10);

            const onePokemeon = await datamapper.getOnePokemon(id);

            const pokemonDetail = onePokemeon[0];

            //console.log(" onePokemon => ",onePokemeon);

            res.status(200).render('pokemonPage',  {pokemonDetail});


        } catch (error) {
            console.log("Erreur dans le mainController, dans la méthode pokemonPage : ", error);
            res.status(500).end();
        }



    },


};

module.exports = mainController;