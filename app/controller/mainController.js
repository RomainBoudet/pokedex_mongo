const {
    getOnePokemonByName
} = require('../datamapper');
const datamapper = require('../datamapper');
const {
    formatToast
} = require('../service/date');

const Fuse = require('fuse.js');

let toastDate;
(async () => {
    try {
        toastDate = await formatToast();
    } catch (error) {
        console.log('Erreur dans la recherche de la date pour le toast !', error);
    }
})();


const mainController = {

    homepage: async (req, res) => {

        try {

            let classement;
            if (!req.query.classement) {
                classement = "null";
            } else {
                classement = req.query.classement;
            }
            // req.query.classsement peut valoir : alphacroissant /  alphadecroissant / poidcroissant / 
            // poiddecroissant /  hauteurcroissant / hauteurdecroissant

            // je vérifie que mon input a pas été modifié 
            const trueInput = ['alphacroissant', 'alphadecroissant', 'poidcroissant', 'poiddecroissant', 'hauteurcroissant', 'hauteurdecroissant', 'null'];
            let pokemonList = await datamapper.getAllPokemon({
                name: 1
            });
            if (pokemonList === null || pokemonList === undefined) {
                console.log("Erreur dans le mainController dans la méthode homePage : ", )
                res.status(500).end();
            }

            if (!trueInput.includes(classement)) {
                console.log(`⚠️ Ce type de classement (${classement}) n'existe pas ! ❌ `);
                const toastMessage = `⚠️ Ce type de classement (${classement}) n'existe pas ! ❌ `;
                return res.status(200).render('homepage', {
                    toastDate,
                    toastMessage,
                    pokemonList
                })
            };

             switch (classement) {
                case 'alphacroissant':
                    pokemonList = await datamapper.getAllPokemon({
                        name: 1
                    });

                    return res.status(200).render('homepage', {
                        pokemonList
                    });

                case 'alphadecroissant':
                    pokemonList = await datamapper.getAllPokemon({
                        name: -1
                    });

                    return res.status(200).render('homepage', {
                        pokemonList
                    });

                case 'poidcroissant':

                    pokemonList = await datamapper.getAllPokemon({
                        weight: -1
                    });

                    return res.status(200).render('homepage', {
                        pokemonList
                    });

                case 'poiddecroissant':
                    pokemonList = await datamapper.getAllPokemon({
                        weight: 1
                    });

                    return res.status(200).render('homepage', {
                        pokemonList
                    });
                case 'hauteurcroissant':
                    pokemonList = await datamapper.getAllPokemon({
                        height: -1
                    });

                    return res.status(200).render('homepage', {
                        pokemonList
                    });
                case 'hauteurdecroissant':
                    pokemonList = await datamapper.getAllPokemon({
                        height: 1
                    });

                    return res.status(200).render('homepage', {
                        pokemonList
                    });

                default:
                    // par défault ordre alphabétique croissant !
                    return res.status(200).render('homepage', {
                        pokemonList
                    });
            }

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


            return res.status(200).render('pokemonPage', {

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

            return res.status(200).render('typeList', {
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

            const search = req.body.search;

            //Je récupére ma liste compléte pour l'envoyer a Fuse
            const allPokemons = await datamapper.getAllPokemon({name:1});

            if (allPokemons === null || allPokemons === undefined) {
                console.log("Erreur dans la méthode search, la méthode getallPokemon du datamapper renvoie null !")
                return res.status(500).end();
            }

            const options = {
                isCaseSensitive: false,
                includeScore: true,
                shouldSort: false,
                // includeMatches: false,
                // findAllMatches: false,
                minMatchCharLength: req.body.search.length - 1, //le nombre de caractére min qui doit matcher avec le résultat : je les veux tous ! -1 car j'admet que l'utilisateur puisse faire UNE faute d'orthographe :)
                // location: 0,
                threshold: 0.6,
                // distance: 100,
                // useExtendedSearch: false,
                ignoreLocation: true,
                // ignoreFieldNorm: false,

                // keys ==> ce dans quoi je décide d'autoriser la recherche !
                keys: [
                    "name",
                ]
            };

            const fuse = new Fuse(allPokemons, options);

            // La valeur que l'on veut chercher
            const pattern = search
            const resultat = fuse.search(pattern);

            // je mutualise la date (qui pourrait également être un service..)

            if (resultat.length < 1) {
                console.log(`⚠️ Le nom de ce pokemon (${search}) n'existe pas ! ❌ `);
                const toastMessage = `⚠️ Le nom de ce pokemon (${search}) n'existe pas ! ❌ `;
                const pokemonList = allPokemons;
                return res.status(200).render('homepage', {
                    toastDate,
                    toastMessage,
                    pokemonList
                });
            }

            // je veux uniquement les score inférieurs a 0.4 et pas plus de 20 résultats !
            //! changer la valeur du filtre si on veut plus de résultat ou des résultats moins pertinent (monter le score...)
            const goodResult = (resultat.filter(item => item.score < 0.2)).slice(0, 20);

            // Dans chaque item de ce tableau, je ne veux que la clé "item" pour boucler dessus facilement dans ma vue...
            const pokemonList = [];
            for (const elem of goodResult) {
                pokemonList.push(elem.item)
            }

            let toastMessage;
            if (pokemonList.length > 1) {
                toastMessage = ` ${pokemonList.length} éléments correspondent à votre recherche (${search}) !`;
            } else {
                toastMessage = ` ${pokemonList.length} élément correspond à votre recherche (${search}) !`;
            }

            return res.status(200).render('homepage', {
                toastDate,
                toastMessage,
                pokemonList,

            });


        } catch (error) {
            console.log("Erreur dans le mainController, dans la méthode search : ", error);
            res.status(500).end();
        }

    },


};

module.exports = mainController;