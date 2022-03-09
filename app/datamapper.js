const {
    getDb,
    connectDb
} = require('./database');


var db; // db est accessible partout sans devoir connecté mongo ni lui indiqué la db ou la collection
connectDb(async () => (db = await getDb(process.env.MONGO_DBCOLLECTION)));

const colorsWeaknesses = ['aabb22', '665544', '7766ee', 'ffbb33', 'd349f2', 'bb5544', 'ff4422', '6699ff', '6666bb', '77cc55', 'ddbb55', '77ddff', 'aa5599', 'ff5599', 'bbaa66', 'aaaabb', '3399ff', 'bbaabb'];
const colorsTypes = ['aabb22', '7766ee', 'ffbb33', 'bb5544', 'ff4422', '6699ff', '6666bb', 'ff5599', 'ddbb55', '77ddff', 'bbaabb', 'aa5599', 'ff5599', 'bbaa66', '3399ff'];


/* {
   _id: new ObjectId("58f56171ee9d4bd5e610d6a7"),
   id: 100,
   num: '100',
   name: 'Voltorb',
   img: 'http://www.serebii.net/pokemongo/pokemon/100.png',
   type: [ 'Electric' ],
   height: '0.51 m',
   weight: '10.4 kg',
   candy: 'Voltorb Candy',
   candy_count: 50,
   egg: '5 km',
   spawn_chance: 0.65,
   avg_spawns: 65,
   spawn_time: '04:36',
   multipliers: [ 2.01, 2.02 ],
   weaknesses: [ 'Ground' ],
   next_evolution: [ [Object] ]
 } */

const datamapper = {

    /* getAllPokemon: async (data) => {

        try {

            const results = await db.find().project({
                _id: 0,
                id: 1,
                name: 1,
                num: 1,
                next_evolution: 1,
                prev_evolution: 1,
            }).sort(
                data
            ).toArray();

            if (!results[0] || results[0] === undefined || results.length < 1) {
                return null;
            }

            return results;

        } catch (error) {
            console.log("Erreur dans le Datamapper, dans la méthode getAllPokemon : ", error);

        }
    }, */

    getAllPokemon: async (data) => {

        // je dois convertir le poid et la hauteur (en string) en float comparable que l'on peut classer.  

        try {

            const results = await db.aggregate([{
                    $project: {
                        id: 0,
                        id: 1,
                        name: 1,
                        height: {
                            $convert: {
                                input: { // je prend du premier caractéres au 4ieme.. car tous les même format
                                    $substr: ['$height', 0, 4]
                                },
                                to: "double",
                            }

                        },
                        // Pour le weight, je dois splitter la string avec l'espace car les poids n'on pas tous le même format ('235.0 kg' // '8.0 kg') ! 
                        // et pour selectionner le premier item du tabelau qui contient mon poid, je unwind et match !
                        weight: {
                            $split: ['$weight', " "]
                        },
                        num: 1,
                        next_evolution: 1,
                        prev_evolution: 1,

                    }
                },
                // je recrée de nouveau enregistrement pour chaque valeur dans weight (donc X2 pour les records ici)
                {
                    $unwind: '$weight'
                },
                // Je prend uniquement les items avec un poid qui correspond a un float !
                {
                    $match: {
                        weight: /[+-]?([0-9]*[.])?[0-9]+/
                    }
                },
                { // je reconvertit ce nouvel enregistrement choisie (le float), en double et non en string !
                    $set: {
                        weight: {
                            $convert: {
                                input: '$weight',
                                to: "double",
                            }
                        }
                    }
                },
                { // j'applique le choix ascendant ou descendant du classement !
                    $sort: data
                }

            ]).toArray();

            if (!results[0] || results[0] === undefined || results.length < 1) {
                return null;
            }

            return results;

        } catch (error) {
            console.log("Erreur dans le Datamapper, dans la méthode getAllPokemon : ", error);

        }
    },


    getOnePokemon: async (idPokemon) => {

        try {


            // je définis un min et un max pour mes valeurs random calculées par Mongo
            const min = 10;
            const max = 100;

            // On va chercher chaque pokemon, et pour chacun de ses types et weaknesses, on va définir une color 
            // je récupére tous mes types et faiblesses :
            const types = await db.distinct('type'); // comprend un type "normal", qui n'est pas inclut dans les weaknesses !
            const weaknesses = await db.distinct('weaknesses'); /// Comprend trois type de plus que les "types" (dark, fairy, steel)
            weaknesses.push("Normal");
            // Je dé&finis les couleurs :

            const result = await db.aggregate([{
                    // Je ne prend qu'un enregistrement
                    $match: {
                        id: idPokemon
                    }
                },
                // Je ne veux pas du field _id en sortie
                {
                    $project: {
                        _id: 0
                    }
                },
                // Pour ajouter un tableau contenant les type et leur couleur associé, en vue de l'utilisé pour construire un objet :
                {
                    $addFields: {
                        arrayColorType: {

                            $zip: {
                                inputs: [types, colorsTypes],
                            }


                        },
                        arrayColorWeaknesses: {

                            $zip: {
                                inputs: [weaknesses, colorsWeaknesses],
                            }


                        }

                    }
                },
                // Pour fabriquer un objet type - color, selon les types du Pokemon :
                {
                    $addFields: {
                        colorByType: {

                            $function:

                            {
                                body: `function (type, arrayColorType) {
                                let resultArray = [];
                            for (const item of type) {

                            const arrayFiltered = arrayColorType.filter(([key]) => key === item);
                                const flat = arrayFiltered.reduce((acc, val) => acc.concat(val), [])
                                resultArray.push(flat);
                            }

                            let myObj = {};
                            let array = [];
                            for (let i = 0; i < resultArray.length; i++) {

                                myObj[i] = {
                                    type: resultArray[i][0],
                                    color: resultArray[i][1]
                                }
                                array.push(myObj[i]);
                            }
                            return array;

                                }`,
                                args: ["$type", "$arrayColorType"],
                                lang: "js",
                            }

                        },
                        colorByWeaknesses: {
                            $function:

                            {
                                body: `function (weaknesses, arrayColorWeaknesses) {
                                let resultArray = [];
                            for (const item of weaknesses) {

                            const arrayFiltered = arrayColorWeaknesses.filter(([key]) => key === item);
                                const flat = arrayFiltered.reduce((acc, val) => acc.concat(val), [])
                                resultArray.push(flat);
                            }

                            let myObj = {};
                            let array = [];
                            for (let i = 0; i < resultArray.length; i++) {

                                myObj[i] = {
                                    type: resultArray[i][0],
                                    color: resultArray[i][1]
                                }
                                array.push(myObj[i]);
                            }
                            return array;

                                }`,
                                args: ["$weaknesses", "$arrayColorWeaknesses"],
                                lang: "js",
                            }
                        }
                    }
                },
                // Pour convertir le field num en integer
                {
                    $set: {
                        num: {
                            $convert: {
                                input: "$num",
                                to: "int"
                            }
                        }

                    }
                },
                // Pour fabriquer tableau d'objet, avec deux clés - valeur, name et num
                {
                    $addFields: {
                        next_evo: {

                            $map: {
                                input: "$next_evolution",
                                as: "item", // optionel. this par défaut => "$$this"
                                in: { // je construit un objet a chaque itération, en convertisssant le num en format string en integer !   [ { name: 'Kadabra', num: 64 } ]
                                    name: "$$item.name",
                                    num: {
                                        $convert: {
                                            input: "$$item.num",
                                            to: "int"
                                        }
                                    }
                                } // ce que je demande à chaque itération

                            }

                        }

                    }

                },
                {
                    $addFields: {
                        prev_evo: {

                            $map: {
                                input: "$prev_evolution",
                                as: "item", // optionel. this par défaut => "$$this"
                                in: { // je construit un objet a chaque itération, en convertisssant le num en format string en integer !   [ { name: 'Kadabra', num: 64 } ]
                                    name: "$$item.name",
                                    num: {
                                        $convert: {
                                            input: "$$item.num",
                                            to: "int"
                                        }
                                    }
                                }

                            }

                        }

                    }

                },
                {
                    $addFields: { // je construit un random entre 10 et 100 via mongo ! Peu import les valeurs réelles...
                        defense: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        attaque: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        pv: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        attaque_spe: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        defense_spe: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        vitesse: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },

                    }
                },
                // on supprime les champs non nécéssaire.
                {
                    $unset: ["arrayColorType", "arrayColorWeaknesses", "next_evolution", "prev_evolution"]
                }

            ]).toArray();

            // console.log("result[0].next_evo ==> ", result[0].next_evo);
            // console.log("result ==> ", result);

            // Rappel random en JS => 
            /* const random = (min, max) => {
				return Math.floor(Math.random() * (max - min)) + min;
		    }; 
        */


            // Rappel en JS => 
            // Je veux filtrer un tableau d'objet avec un autre tableau et récupérer des clés-valeur selon ce deuxiéme tableau !
            //result1.type = mon tableau pour filtrer
            //result1.arrayColorType = mon tableau d'objet que je veux filtrer

            // ici l'entrée a filtrer est un tableau de tableau [clé, valeur]. Si on a un objet, je le convertie en tableau de tableau [clé - valeur] = Object.entries(obj);

            /* let resultArray = [];
            for (const item of result[0].type) {

                const arrayFiltered = result[0].arrayColorType.filter(([key]) => key === item);
                const flat = arrayFiltered.reduce((acc, val) => acc.concat(val), [])
                resultArray.push(flat);
            }

             resultArray => [ [ 'Rock', 'bbaa66' ], [ 'Flying', '6699ff' ] ]

             Je récupére un tableau de tableau que je convertit en objet avec deux clés choisis :

            let myObj = {};
            let array = [];
            for (let i = 0; i < resultArray.length; i++) {

                myObj[i] = {
                    type: resultArray[i][0],
                    color: resultArray[i][1]
                }
                array.push(myObj[i]);
            } */

            //array =>
            /* [
              { type: 'Rock', color: 'bbaa66' },
              { type: 'Flying', color: '6699ff' }
            ] */


            // si je veux aplatir le tableau d'un niveau et le retransformer le tableau en objet !
            //const objetResult = Object.fromEntries(resultArray.flat(1)); // dans mongodb $function .flat() n'est pas reconnu !


            if (!result || result === undefined) {
                return null;
            }
            return result;

        } catch (error) {
            console.log("Erreur dans le Datamapper, dans la méthode getOnePokemon : ", error);

        }

    },

    getAllList2: async () => {

        try {



            const allTypes = await db.distinct('weaknesses'); /// Comprend trois type de plus que le field "type" (dark, fairy, steel)
            allTypes.push('Normal');

            const result = await db.aggregate([
                // un seul résultat
                {
                    $match: {
                        id: 1
                    }
                },
                // Je ne veux pas du field _id en sortie
                {
                    $project: {
                        _id: 0,
                        colorByType: 1,
                    }
                },

                {
                    $addFields: {
                        arrayColorType: {

                            $zip: {
                                inputs: [allTypes, colorsWeaknesses],

                            }

                        }

                    }

                },
                {
                    $addFields: {
                        colorByType: {

                            $function:

                            {
                                body: `function (arrayColorType) {
                                

                            let myObj = {};
                            let array = [];
                            for (let i = 0; i < arrayColorType.length; i++) {

                                myObj[i] = {
                                    type: arrayColorType[i][0],
                                    color: arrayColorType[i][1]
                                }
                                array.push(myObj[i]);
                            }
                            return array;

                                }`,
                                args: ["$arrayColorType"],
                                lang: "js",
                            }

                        },

                    }
                },
                {
                    $unset: ["arrayColorType"],
                },


            ]).toArray();

            if (!result || result[0] === undefined) {
                return null;
            }
            return result;




        } catch (error) {
            console.log("Erreur dans le Datamapper, dans la méthode getAllList : ", error);
        }
    },

    getPokemonsByType: async (myType) => {
        try {

            //const pokemons = await db.find({type: myType}).toArray();
            // besoin d'aggregate pour modifier les num en integer...

            const pokemons = await db.aggregate([{
                    $match: {
                        type: myType
                    }
                },
                {
                    $project: {
                        _id: 0,
                        typeAsked: 1,
                        num: 1,
                        name: 1,
                        id: 1,
                    }
                },
                {
                    $set: {
                        num: {
                            $convert: {
                                input: "$num",
                                to: "int"
                            }
                        }

                    }
                },
                {
                    $addFields: {
                        typeAsked: myType
                    }
                },

            ]).toArray();


            if (!pokemons || pokemons.length < 1) {
                return null;
            }

            return pokemons;


        } catch (error) {
            console.log("Erreur dans le Datamapper, dans la méthode getAllList : ", error);

        }

    },

    getAllTypes: async () => {
        try {


            const result = await db.distinct('weaknesses');
            //const result = result1.map(item => item.toLowerCase());
            result.push('Normal'); // je rajoute le type Normal

            if (!result || result === undefined) {
                return null;
            }

            return result;

        } catch (error) {
            console.log("Erreur dans le Datamapper, dans la méthode getAllList : ", error);

        }

    },

    getAllPokemonName: async () => {

        try {
            const result = await db.distinct('name');

            console.log('result ==> ', result);

            if (!result || result === undefined || result.length < 1) {
                return null;
            }

            return result;

        } catch (error) {
            console.log("Erreur dans le Datamapper, dans la méthode getAllList : ", error);

        }

    },

    getOnePokemonByName: async (pokemonName) => {

        try {


            // je définis un min et un max pour mes valeurs random calculées par Mongo
            const min = 10;
            const max = 100;

            // On va chercher chaque pokemon, et pour chacun de ses types et weaknesses, on va définir une color 
            // je récupére tous mes types et faiblesses :
            const types = await db.distinct('type'); // comprend un type "normal", qui n'est pas inclut dans les weaknesses !
            const weaknesses = await db.distinct('weaknesses'); /// Comprend trois type de plus que les "types" (dark, fairy, steel)
            weaknesses.push("Normal");
            // Je dé&finis les couleurs :
            const colorsTypes = ['aabb22', '7766ee', 'ffbb33', 'bb5544', 'ff4422', '6699ff', '6666bb', '77cc55', 'ddbb55', '77ddff', 'bbaabb', 'aa5599', 'ff5599', 'bbaa66', '3399ff'];

            const result = await db.aggregate([{
                    // Je ne prend qu'un enregistrement
                    $match: {
                        name: pokemonName
                    }
                },
                // Je ne veux pas du field _id en sortie
                {
                    $project: {
                        _id: 0
                    }
                },
                // Pour ajouter un tableau contenant les type et leur couleur associé, en vue de l'utilisé pour construire un objet :
                {
                    $addFields: {
                        arrayColorType: {

                            $zip: {
                                inputs: [types, colorsTypes],
                            }


                        },
                        arrayColorWeaknesses: {

                            $zip: {
                                inputs: [weaknesses, colorsWeaknesses],
                            }


                        }

                    }
                },
                // Pour fabriquer un objet type - color, selon les types du Pokemon :
                {
                    $addFields: {
                        colorByType: {

                            $function:

                            {
                                body: `function (type, arrayColorType) {
                                let resultArray = [];
                            for (const item of type) {

                            const arrayFiltered = arrayColorType.filter(([key]) => key === item);
                                const flat = arrayFiltered.reduce((acc, val) => acc.concat(val), [])
                                resultArray.push(flat);
                            }

                            let myObj = {};
                            let array = [];
                            for (let i = 0; i < resultArray.length; i++) {

                                myObj[i] = {
                                    type: resultArray[i][0],
                                    color: resultArray[i][1]
                                }
                                array.push(myObj[i]);
                            }
                            return array;

                                }`,
                                args: ["$type", "$arrayColorType"],
                                lang: "js",
                            }

                        },
                        colorByWeaknesses: {
                            $function:

                            {
                                body: `function (weaknesses, arrayColorWeaknesses) {
                                let resultArray = [];
                            for (const item of weaknesses) {

                            const arrayFiltered = arrayColorWeaknesses.filter(([key]) => key === item);
                                const flat = arrayFiltered.reduce((acc, val) => acc.concat(val), [])
                                resultArray.push(flat);
                            }

                            let myObj = {};
                            let array = [];
                            for (let i = 0; i < resultArray.length; i++) {

                                myObj[i] = {
                                    type: resultArray[i][0],
                                    color: resultArray[i][1]
                                }
                                array.push(myObj[i]);
                            }
                            return array;

                                }`,
                                args: ["$weaknesses", "$arrayColorWeaknesses"],
                                lang: "js",
                            }
                        }
                    }
                },
                // Pour convertir le field num en integer
                {
                    $set: {
                        num: {
                            $convert: {
                                input: "$num",
                                to: "int"
                            }
                        }

                    }
                },
                // Pour fabriquer tableau d'objet, avec deux clés - valeur, name et num
                {
                    $addFields: {
                        next_evo: {

                            $map: {
                                input: "$next_evolution",
                                as: "item", // optionel. this par défaut => "$$this"
                                in: { // je construit un objet a chaque itération, en convertisssant le num en format string en integer !   [ { name: 'Kadabra', num: 64 } ]
                                    name: "$$item.name",
                                    num: {
                                        $convert: {
                                            input: "$$item.num",
                                            to: "int"
                                        }
                                    }
                                } // ce que je demande à chaque itération

                            }

                        }

                    }

                },
                {
                    $addFields: {
                        prev_evo: {

                            $map: {
                                input: "$prev_evolution",
                                as: "item", // optionel. this par défaut => "$$this"
                                in: { // je construit un objet a chaque itération, en convertisssant le num en format string en integer !   [ { name: 'Kadabra', num: 64 } ]
                                    name: "$$item.name",
                                    num: {
                                        $convert: {
                                            input: "$$item.num",
                                            to: "int"
                                        }
                                    }
                                }

                            }

                        }

                    }

                },
                {
                    $addFields: { // je construit un random entre 10 et 100 via mongo ! Peu import les valeurs réelles...
                        defense: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        attaque: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        pv: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        attaque_spe: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        defense_spe: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },
                        vitesse: {
                            $add: [{
                                $floor: [{
                                    $multiply: [{
                                        $rand: {}
                                    }, {
                                        $subtract: [max, min]
                                    }]
                                }]
                            }, min]
                        },

                    }
                },
                // on supprime les champs non nécéssaire.
                {
                    $unset: ["arrayColorType", "arrayColorWeaknesses", "next_evolution", "prev_evolution"]
                }

            ]).toArray();


            if (!result || result === undefined) {
                return null;
            }
            return result;

        } catch (error) {
            console.log("Erreur dans le Datamapper, dans la méthode getOnePokemonByName : ", error);

        }

    },

    getAllList: async () => {

        /* {
    total: 12,
    list: [
      'Caterpie',   'Metapod',
      'Butterfree', 'Weedle',
      'Kakuna',     'Beedrill',
      'Paras',      'Parasect',
      'Venonat',    'Venomoth',
      'Scyther',    'Pinsir'
    ],
    name: 'Bug'
  }, */

        try {

            const result = await db.aggregate([{
                    $unwind: "$type"
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        type: 1
                    }
                },
                {
                    $group: {
                        _id: "$type",
                        total: {
                            $sum: 1
                        },
                        list: {
                            $push: {
                                name: "$name",
                                id: "$id"
                            }
                        }
                    }
                },
                {
                    $set: {
                        name: '$_id'
                    }
                },
                {
                    $unset: '_id'
                },
                {
                    $sort: {
                        total: -1
                    }
                }
            ]).toArray();

            // et pour chaque type, j'insére un valeur color !
            const colorSortByTotalType = ['aa5599', '3399ff', 'bbaabb', '6699ff', 'ff5599', 'ff5599', 'ddbb55', 'aabb22', 'ff4422', 'bbaa66', 'ffbb33', 'bb5544', '77ddff', '6666bb', '7766ee'];

            for (let i = 0; i < colorSortByTotalType.length; i++) {
                result[i].color = colorSortByTotalType[i];
            };

            console.log(result);
            console.log(result[0]);

            if (!result || result === undefined) {
                return null;
            }

            return result;

        } catch (error) {
            console.log("Erreur dans le Datamapper, dans la méthode test : ", error);

        }

    },



};

module.exports = datamapper;