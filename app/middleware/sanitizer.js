const validator = require('validator');

/**
 * sanitizer Middleware
 * @module middleware/clean
 * 
 */
const clean = (req, res, next) => {

    try {
        //On boucle sur chaque propriétées du body et on supprime tous caractéres interdit ! 
        // blacklist porte bien son nom et trim supprime les espaces avant et apres.https://www.npmjs.com/package/validator
        // on aurait pu utiliser la méthode escape plutot que blacklist mais escape enléve aussi les apostrophes et je veux les garder... et je préfére une suppression des caractéres plutot que leur conversion en entité HTML...
        // j'aurais bien mis un tableau de caractéres comme ceci: ['>','<', '&', '"', '/', '|', '#', '{', '}','='] mais blacklist me prend aussi la virgule que je veux garder...
        //a l'avenir, une regex serait peut être préférable plutot qu'un module entrainant un package en plus avec ses potentielles failles...
        //a l'avenir il faudrait également logger les cas ou on a tenté d'insérer des caractéres spéciaux.

        const theBody = req.body;

        for (let prop in theBody) {
            theBody[prop] = validator.blacklist(theBody[prop], ['>']);
            theBody[prop] = validator.blacklist(theBody[prop], ['<']);
            theBody[prop] = validator.blacklist(theBody[prop], ['&']);
            theBody[prop] = validator.blacklist(theBody[prop], ['"']);
            theBody[prop] = validator.blacklist(theBody[prop], ['/']);
            theBody[prop] = validator.blacklist(theBody[prop], ['|']);
            theBody[prop] = validator.blacklist(theBody[prop], ['#']);
            theBody[prop] = validator.blacklist(theBody[prop], ['{']);
            theBody[prop] = validator.blacklist(theBody[prop], ['}']);
            theBody[prop] = validator.blacklist(theBody[prop], ['[']);
            theBody[prop] = validator.blacklist(theBody[prop], [']']);
            theBody[prop] = validator.blacklist(theBody[prop], ['=']);
            theBody[prop] = validator.blacklist(theBody[prop], ['*']);
            theBody[prop] = validator.blacklist(theBody[prop], ['$']);
            theBody[prop] = validator.blacklist(theBody[prop], ['%']);
            theBody[prop] = validator.blacklist(theBody[prop], ['_']);
            theBody[prop] = validator.blacklist(theBody[prop], ['@']);
            theBody[prop] = validator.blacklist(theBody[prop], ['(']);
            theBody[prop] = validator.blacklist(theBody[prop], [')']);
            theBody[prop] = validator.blacklist(theBody[prop], ['+']);
            theBody[prop] = validator.blacklist(theBody[prop], ['~']);


            theBody[prop] = validator.trim(theBody[prop]);
        }

        next();

    } catch (err) {

        console.trace(
            'Erreur dans la méthode clean du sanitizer :',
            err);

        return res.status(500).end();

    }

}

const cleanQuery = (req, res, next) => {

    try {
        //On boucle sur chaque propriétées du body et on supprime tous caractéres interdit ! 
        // blacklist porte bien son nom et trim supprime les espaces avant et apres.https://www.npmjs.com/package/validator
        // on aurait pu utiliser la méthode escape plutot que blacklist mais escape enléve aussi les apostrophes et je veux les garder... et je préfére une suppression des caractéres plutot que leur conversion en entité HTML...
        // j'aurais bien mis un tableau de caractéres comme ceci: ['>','<', '&', '"', '/', '|', '#', '{', '}','='] mais blacklist me prend aussi la virgule que je veux garder...
        //a l'avenir, une regex serait peut être préférable plutot qu'un module entrainant un package en plus avec ses potentielles failles...
        //a l'avenir il faudrait également logger les cas ou on a tenté d'insérer des caractéres spéciaux.

        const theQuery = req.query;

        for (let prop in theBody) {
            theQuery[prop] = validator.blacklist(theQuery[prop], ['>']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['<']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['&']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['"']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['/']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['|']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['#']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['{']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['}']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['[']);
            theQuery[prop] = validator.blacklist(theQuery[prop], [']']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['=']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['*']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['$']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['%']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['_']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['@']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['(']);
            theQuery[prop] = validator.blacklist(theQuery[prop], [')']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['+']);
            theQuery[prop] = validator.blacklist(theQuery[prop], ['~']);


            theQuery[prop] = validator.trim(theQuery[prop]);
        }

        next();

    } catch (err) {

        console.trace(
            'Erreur dans la méthode cleanQuery du sanitizer :',
            err);

        return res.status(500).end();

    }

}


module.exports = {
    clean,
    cleanQuery,
};