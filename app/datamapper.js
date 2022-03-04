const {
    getDb,
    connectDb
} = require('./database');


var db; // db est accessible partout sans devoir connecté mongo ni lui indiqué la db ou la collection
connectDb(async () => (db = await getDb(process.env.MONGO_DBCOLLECTION)));

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

    getAllPokemon: async () => {

        const results = await db.find().project({
            _id: 0,
            id: 1,
            name: 1,
            num: 1
        }).sort({
            name: 1
        }).toArray();

        if (!results[0] || results[0] === undefined) {
            return null;
        }
        return results;
    },


    getOnePokemon: async (idPokemon) => {

        // je définis un min et un max pour mes valeurs random calculées par Mongo
        const min = 10;
        const max = 100;

        // On va chercher chaque pokemon, et pour chacun de ses types et weaknesses, on va définir une color 
        // je récupére tous mes types et faiblesses :
        const types = await db.distinct('type'); // comprend un type "normal", qui n'est pas inclut dans les weaknesses !
        const weaknesses = await db.distinct('weaknesses'); /// Comprend trois type de plus que les "types" (dark, fairy, steel)

        // Je dé&finis les couleurs :
        const colorsTypes = ['aabb22', '7766ee', 'ffbb33', 'bb5544', 'ff4422', '6699ff', '6666bb', '77cc55', 'ddbb55', '77ddff', 'bbaabb', 'aa5599', 'ff5599', 'bbaa66', '3399ff'];
        const colorsWeaknesses = ['aabb22', '665544', '7766ee', 'ffbb33', 'd349f2', 'bb5544', 'ff4422', '6699ff', '6666bb', '77cc55', 'ddbb55', '77ddff', 'aa5599', 'ff5599', 'bbaa66', 'aaaabb', '3399ff'];

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
            //
            {
                $addFields: {
                    next_evo: {

                        $map: {
                            input: "$next_evolution",
                            as: "item", // optionel. this par défaut => "$$this"
                            in: {
                                name: "$$item.name",
                                num: {
                                    $convert: {
                                        input: "$$item.num",
                                        to: "int"
                                    }
                                }
                            }  // ce que je demande à chaque itération

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
                            }  // ce que je demande à chaque itération

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



        // next_evolution vaut => [ { num: '064', name: 'Kadabra' }, { num: '065', name: 'Alakazam' } ]

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

    },


};

module.exports = datamapper;