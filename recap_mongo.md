# MongoDB

## Vocabulaire
- *Document* : un enregistrement. Dans une BDD SQL, cela correspondrait plus ou moins à une ligne dans une table.
- *Collection* : presque équivalent à une table. C'est un ensemble non structuré de documents (c'est-à-dire qu'ils n'ont pas forcément tous le même format).
- *BSON* : _Binary JSON_. Un format développé par et pour MongoDB, basé sur la notation JSON.

## Install 
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

## CRUD 
https://www.mongodb.com/basics/crud#:~:text=The%20basic%20methods%20of%20interacting,the%20data%20in%20your%20databases

## Dump de la collection 
Dans le terminal :
```mongodump --collection winners --db spaceinvader``` => crer un dossier dump la ou se situe qui contient un dossier du nom de notre DBB avec dedans le fichier.bson

## Aggragation et Rank :
https://docs.mongodb.com/manual/reference/operator/aggregation/rank/

## Lancer le serveur

`sudo systemctl start mongod.service`

## Lancer le client (CLI)

`mongosh`

## Quelques commandes

- lister les bases existantes : `show dbs`
- sélectionner une base (crée la base à la volée si elle n'existe pas) : `use maBase`
- lister les collections : `show collections`
- quitter la console : `exit` ( ou ctrl+D )

## Pokedex

### Restaurer les données

Depuis le dossier racine de ce repo : `mongorestore -d pokemon data/`

Pas besoin de créer la base, `mongorestore` va le faire pour nous.

### Analyser les données

1. On se reconnecte : `mongo`
2. `show dbs` : tiens, pokemon est apparu
3. `use pokemon` pour sélectionner la base
4. `show collections` : une seule collection, "samples_pokemon"
5. c'est nul ce nom de collection ! Allez on la renomme : `db.samples_pokemon.renameCollection("pokedex")`

On remarque que les commandes ressemblent à du JS, comme si les collections étaient des objets. C'est normal, c'est le cas !! Toute la CLI de MongoDB est écrite en Javascript :heart: !!

### Premières requêtes

#### Requetes "valeur exacte"

1. `db.pokedex.find()` : "trouve les éléments de la collection pokedex, sans filtre"
2. `db.pokedex.count()` : "compte tous les éléments...."
3. `db.pokedex.find({id: 150})` : "trouve les éléments..., dont la propriété `id` est égale à 150"
4. Attention:  `db.pokedex.find({id: "150"})`, paf ça renvoie rien !! MongoDB est stricte sur les types de données.
5. Bien sur, c'est combinable : `db.pokedex.find({name:"Mewtwo", id: 150})`. C'est un ET, pas un OU !
6. c'est moche? cadeau : `db.pokedex.find({id: 150}).pretty()`

#### Projection

Lorsqu'on ne veut que certaines propriétés des documents, on passe un objet en 2ème paramètre de find() :

`db.pokedex.find({}, {name: 1})`

Par défaut, l'id sera toujours inclus. On peut le désactiver : 

`db.pokedex.find({}, {name: 1, _id:0})`

#### Valeurs incluses

Quand le document contient un array, on peut tester si l'array en question CONTIENT une valeur : 

`db.pokedex.find({type: "Dragon"})`

Quand le document contient un objet, on peut tester les valeurs de cet objet, avec la dot-notation habituelle : 

(pas d'exemple direct dans la base)
`db.example.find({objet.value: "valeur"})`

Et le must du must : on peut combiner les deux ! Quand un document contient un array de sous-document, ça fonctionne tout pareil :

`db.pokedex.find({"prev_evolution.name":"Eevee"});`

#### Modificateurs

- plus grand que : `find({"spawn_chance": {$gte: 2}});`
- plus petit que : `find({"spawn_chance": {$lte: 2}});`
- parmi (sert de OU logique!) : `find({"type": {$in: ["Dragon", "Ice"] } }, {name:1});`
- pas dans : `find({"type": {$nin: ["Water", "Fire"] } }, {name:1});`
- "ET" sur même prop : `find({ "type": {$eq:"Flying", $ne:"Normal"} },{name:1,type:1});`
- regexp ! : `find({"name": /ard/gi})`

#### Tri et limite

- tri simple : `db.pokedex.find({}, {name:1}).sort({name:1})` (1 pour ascendant, -1 pour descendant)
- tri à paramètres multiples: `db.pokedex.find().sort({type:1, name:-1})`. L'ordre de priorité est égal à l'ordre de déclaration (ici, "type ascendant" en premier, puis "name descendant" )
- un exemple plus lisible (avec une projection) : `db.pokedex.find({},{name:1, type:1}).sort({type:1, name:-1})`

- limite : `db.pokedex.find().limit(4)`

#### Insertion
`db.pokedex.insert({nom: "JaiRienAFaireLa"})`

On remarque que le nouvel objet n'a aucune propriété en commun avec les autres. Et pourtant, mongo l'a inséré sans broncher dans la collection...

#### Modification

Modifier un seul document : 

`db.pokedex.updateOne({nom: "JaiRienAFaireLa"},{"$set": {test: "truc"}});`

L'opérateur "$set" est nécessaire. Il en existe un paquet : https://docs.mongodb.com/manual/reference/operator/update/#id1



Modifier plusieurs document : 

`db.collection.updateMany(...)` sur le même format que updateOne

#### Suppression

Supprimer un seul document : 

`db.pokedex.deleteOne({nom: "JaiRienAFaireLa"});`


Supprimer plusieurs document : `db.collection.deleteMany(...)`, sur le même format.

## Aggregate

Techniquement parlant, `aggregate` est _juste_ une méthode des collections de mongo.

Mais ses capacités sont tellement gigantesques qu'on parle souvent du _framework_ aggregate.

Direction [le markdown aggregate](./aggregate.md) pour la suite !

Attention, la syntaxe est pour le moins velue (voire piquante!), et difficile à prendre en main, ce qui vaut à aggregate une réputation de "monstre efficace mais indomptable".

## Express

Pour dialoguer avec une base Mongo, 2 solutions : 
- Faire des requêtes "à la main" avec le package [mongodb](https://www.npmjs.com/package/mongodb).
- Utiliser un ~ORM~ ODM (D pour Document :wink:) comme [mongoose](https://www.npmjs.com/package/mongoose)














# AGGREGATE

Faire de la data avec de la data. Et vice et versa.

## Le principe

Aggregate fonctionne sur un principe de _steps_. Chaque _step_ ne connait que ce que le _step_ précédent lui a donné.

Dans les steps, le caractère `$` représente l'ojet en traitement (un peu comme `this`). Ainsi pour atteindre la propriété "name" de l'objet, on donnera le paramètre "$name".

## Quelques opérateurs

- `$project` fait une projection (fonctionne comme le 2ème paramètre de find)
- `$size` renvoie la taille d'une liste.
- `$unwind` "déroule" une liste, en dupliquant le reste du document au besoin.
  - Ainsi `{name: "Dracaufeu", types: ["Feu", "Vol"]}` devient `[{name: "Dracaufeu", types: "Feu"}, {name:"Dracaufeu", types: "Vol"}]`.
- `$group` est l'équivalent du "GROUP BY" de SQL. C'est un peu comme l'inverse de "unwind", mais on doit définir comment les valeurs sont regroupées (liste, addition/concaténation, moyenne, comptage, ...). A noter que les groupes doivent forcément possèder une propriété "_id", qui sera le discriminant, et qui peut lui aussi être un objet.
- `$sort` fait un tri, de la même manière que la méthode `sort()` dans les requêtes simple.
- `$lookup` permet d'aller chercher une info dans une autre collection (bonjour, associations !)

La (longue) liste complète des opérateurs : https://docs.mongodb.com/manual/reference/operator/aggregation/

## Exemples sur le pokedex

#### Classer et compter les pokémons par type

```js
db.pokedex.aggregate([
    {$unwind: "$type"},
    {$project: {
        _id:0,
        name:1,
        type:1
    }},
    {$group: {
        _id: "$type",
        total: {
            $sum:1
        },
        list: {
            $push: "$name"
        }
    }},
    {$sort:{
        total:-1
    }}
]);
```

Explications du pipeline : 
- étape 1, $unwind : on "déroule" la liste "type".
- étape 2, $project : on ne garde que "name" et "type"
- étape 3, $group : on crée des groupes selon le discriminant "type". Chaque groupe possède une propriété "total" (incrémenté de 1 par document dans le groupe), et une propriété "list" (dans laquelle on a "push" le nom de chaque document du groupe - et qui sera donc automatiquement un array)
- étape 4, on tri les groupes par "total" decroissant.

#### Classer les pokémons par nombre d'évolutions

```js
db.pokedex.aggregate([
  {$project: {
    _id: 0,
    name: 1,
    nbEvol: {
      $cond: {
        if: {$isArray: ["$next_evolution"] },
        then: {$size: "$next_evolution"},
        else: 0
      }
    }
  }},
  {
    $sort: {nbEvol: -1}
  }
]);
```

Explications : 
- etape 1: projection. On garde "name", et on définit une propriété "nbEvol"
  - on rajoute une condition, si "next_evolution" existe et est un array ($isArray), alors on renvoie la taille de la liste
  - sinon, on renvoie 0
- étape 2 : on trie par "nbEvol" décroissant.

#### Grouper les pokemon par tranches de poids

Le traitement est compliqué à cause du fait que les poids sont au format string. On est obligé de commencer par une transformation (on supprime " kg", et on cast en `double` - un nombre à virgule)

```js
db.pokedex.aggregate([
  {
    "$project": {
      _id: 0,
      name: 1,
      poids: {
        $toDouble: {
          $rtrim: {
            input: "$weight",
            chars: " kg"
          }
        }
      }
    } 
  },
  {
    $bucket: {
      groupBy: "$poids",
      boundaries: [0,10,25,50,100,150,200,300,1000],
      default: -1,
      output: {
        total: {$sum: 1},
        list: {$push: "$name"}
      }
    }
  }
]);
```