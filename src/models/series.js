const { gql } = require('apollo-server');
const db = require('monk')(
    `mongodb://dbComicReadWrite:${
        process.env.DBPW
    }@ds046027.mlab.com:46027/commics`
);
const user = 'thomas.maclean@gmail.com';
module.exports.seriesDefs = gql`
    extend type Query {
        serie(id: Int!): Serie! @requireAuth
    }
    extend type Query {
        allSeries: [Serie]! @requireAuth
    }
    extend type Query {
        comics(dbName: String!): [Comic] @requireAuth
    }
    extend type Query {
        comic(dbName: String!, nr: Int!): Comic @requireAuth
    }
    type Serie {
        id: Int!
        title: String!
        dbName: String!
        comics: [Comic]!
    }
    type Comic {
        _id: String!
        title: String!
        nr: Int!
        owned: Boolean
    }
    extend type Mutation {
        toggleOwned(serie: String!, comicid: String!, owned: Boolean!): Boolean
    }
`;

module.exports.seriesResolvers = {
    Query: {
        serie: async (root, args, ctx) => {
            console.log(ctx.req.user);
            let series = await db.get('series').find({});
            const serie = series.find(s => s.id == args.id);
            return serie;
            //db.get(serie.dbName).find({}).then(s => s.json());
        },
        comic: async (root, args) => {
            let com = await db.get(args.dbName).findOne({ nr: args.nr });
            com._id = com._id.toString();

            return com;
        },
        comics: async (root, args) => {
            let comicsInSerie = await db
                .get(args.dbName)
                .find({ nr: { $ne: null } });
            let userData = await db
                .get('thomas.maclean@gmail.com')
                .find({ serie: args.dbName, owned: true });

            const comicsOwned = userData.map(x => x.comicid);
            comicsInSerie.forEach(com => {
                com._id = com._id.toString();
                com.owned = comicsOwned.includes(com._id);
            });

            //console.log(comicsInSerie);

            return comicsInSerie;
        },
        allSeries: async () => {
            let series = await db.get('series').find({});
            return series;
        }
    },
    Serie: {
        comics: async serie => {
            let comicsInSerie = await db
                .get(serie.dbName)
                .find({ nr: { $ne: null } });
            let userData = await db
                .get(user)
                .find({ serie: serie.dbName, owned: true });

            const comicsOwned = userData.map(x => x.comicid);
            comicsInSerie.forEach(com => {
                com._id = com._id.toString();
                com.owned = comicsOwned.includes(com._id);
            });
            return comicsInSerie;
        }
    },
    Mutation: {
        toggleOwned: (root, args) => {
            const { serie, comicid, owned } = args;
            const query = { serie, comicid };
            console.log('trigger');

            db.get(user).update(
                query,
                { serie, comicid, owned },
                { upsert: true }
            );
            return owned;
        }
    }
};
