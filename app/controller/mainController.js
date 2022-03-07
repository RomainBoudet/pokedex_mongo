const datamapper = require('../datamapper');
const {
    formatToast
} = require('../service/date');

const mainController = {

    homepage: async (_, res) => {

        try {

            const pokemonList = await datamapper.getAllPokemon();


            if (pokemonList === null || pokemonList === undefined) {
                console.log("Erreur dans le mainController dans la méthode homePage : ", )
                res.status(500).end();
            }

           return  res.status(200).render('homepage', {
                pokemonList
            })

        } catch (error) {

            console.log("Erreur dans le mainController, dans la méthode homepage : ", error);
            res.status(500).end();

        }

    },

    pokemonPage: async (req, res) => {

        try {

            const id = parseInt(req.params.id, 10);

            const onePokemon = await datamapper.getOnePokemon(id);

            const pokemonDetail = onePokemon[0];


           return  res.status(200).render('pokemonPage', {
                pokemonDetail
            });


        } catch (error) {
            console.log("Erreur dans le mainController, dans la méthode pokemonPage : ", error);
            res.status(500).end();
        }

    },

    typeList: async (req, res) => {

        try {

            const typePokemon = await datamapper.getAllList();
            const allType = typePokemon[0].colorByType;

           return  res.status(200).render('typeList', {
                allType
            });

        } catch (error) {
            console.log("Erreur dans le mainController, dans la méthode typeList : ", error);
            res.status(500).end();
        }

    },

    typeDetail: async (req, res) => {

        try {

            const type = req.params.type;

            // vérification du type et rendu en cas d'insertion d'un mot inconnu !

            const allTypes = await datamapper.getAllTypes();

            const toastDate = await formatToast();

            if (!allTypes.includes(type)) {
                // renvoie de la vue typeList avec un toast
                const toastMessage = `⚠️ Ce type de pokemon (${type}) n'existe pas ! ❌ `;

                const typePokemon = await datamapper.getAllList();
                const allType = typePokemon[0].colorByType;

                console.log(`⚠️ Ce type de pokemon (${type}) n'existe pas ! ❌❌❌`);


                return res.status(200).render('typeList', {
                    allType,
                    toastDate,
                    toastMessage
                })
            }

            // si le type existe mais ne posséde aucun pokemon :
            const pokemons = await datamapper.getPokemonsByType(type);

            if (pokemons === null) {

                const typePokemon = await datamapper.getAllList();
                const allType = typePokemon[0].colorByType;
                const toastMessage = `Ce type existe bien, mais dans cette BDD, aucun pokemon n'existe avec le type ${type} !  ❌ `;
                console.log(`Ce type existe bien, mais dans cette BDD, aucun pokemon n'existe avec le type ${type} !  ❌❌❌ `);
                return res.status(200).render('typeList', {
                    allType,
                    toastDate,
                    toastMessage
                })
            }


            return res.status(200).render('typeDetail', {
                pokemons
            });

        } catch (error) {
            console.log("Erreur dans le mainController, dans la méthode typeList : ", error);
            res.status(500).end();
        }

    },

    search: async (req, res) => {

        try {

            const pokemon = req.body.search;

            console.log("pokemon ==>> ", pokemon);
            // on vérifit que l'utilisateur nous a bien donné un nom de pokemon !

            // je récupére tous les nom de pokemon et je tcheke avec un includes

            // si pas dans l'includes alors le relance la homePage avec un toast !

            // si le nom existe, on renvoie le match 


            // vérification du type et rendu en cas d'insertion d'un mot inconnu !
            const allTypes = await datamapper.getAllTypes();

            const toastDate = await formatToast();

            if (!allTypes.includes(type)) {
                // renvoie de la vue typeList avec un toast
                const toastMessage = `⚠️ Ce type de pokemon (${type}) n'existe pas ! ❌ `;

                const typePokemon = await datamapper.getAllList();
                const allType = typePokemon[0].colorByType;

                console.log(`⚠️ Ce type de pokemon (${type}) n'existe pas ! ❌❌❌`);


                return res.status(200).render('typeList', {
                    allType,
                    toastDate,
                    toastMessage
                })
            }

            // si le type existe mais ne posséde aucun pokemon :
            const pokemons = await datamapper.getPokemonsByType(type);

            if (pokemons === null) {

                const typePokemon = await datamapper.getAllList();
                const allType = typePokemon[0].colorByType;
                const toastMessage = `Ce type existe bien, mais dans cette BDD, aucun pokemon n'existe avec le type ${type} !  ❌ `;
                console.log(`Ce type existe bien, mais dans cette BDD, aucun pokemon n'existe avec le type ${type} !  ❌❌❌ `);
                return res.status(200).render('typeList', {
                    allType,
                    toastDate,
                    toastMessage
                })
            }


            return res.status(200).render('typeDetail', {
                pokemons
            });

        } catch (error) {
            console.log("Erreur dans le mainController, dans la méthode typeList : ", error);
            res.status(500).end();
        }

    },


};

module.exports = mainController;