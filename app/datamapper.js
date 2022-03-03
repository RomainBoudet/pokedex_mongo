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


        // On va chercher chaque pokemon, et pour chacun de ses type on va définir une color 

        // je récupére tous mes type :

        const types = await db.distinct('type');
        const colors = ['aabb22', '7766ee', 'ffbb33', 'bb5544', 'ff4422', '6699ff', '6666bb', '77cc55', 'ddbb55', '77ddff', 'bbaabb', 'aa5599', 'ff5599', 'bbaa66', '3399ff'];
        /*  
               Fighting : 'bb5544'
               Dragon :  '7766ee'
               Water : '3399ff'
               Electric : 'ffbb33'
               Fire : 'ff4422'
               Ice : '77ddff'
               Bug : 'aabb22'
               Normal : 'bbaabb'
               Grass : '77cc55'
               Poison : 'aa5599'
               Psychic : 'ff5599'
               Rock : 'bbaa66'
               Ground : 'ddbb55'
               Ghost : '6666bb'
               Flying : '6699ff'
                   */


        const result = await db.aggregate([{
                $match: {
                    id: idPokemon
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            // Pour ajouter un tableau contenant les type et leur couleur associé :
            {
                $addFields: {
                    arrayColorType: {

                        $zip: {
                            inputs: [types, colors],
                        }


                    }

                }
            },
            // Pour fabriquer un objet type - color, selon les type du Pokemon 
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

                    }
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
            }

        ]).toArray();


        // En JS => 
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

        // resultArray => [ [ 'Rock', 'bbaa66' ], [ 'Flying', '6699ff' ] ]

        // Je récupére un tableau de tableau que je convertit en objet avec deux clés choisis :

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