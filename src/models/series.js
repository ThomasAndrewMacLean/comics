const { gql } = require('apollo-server');
const db = require('monk')(
    `mongodb://dbComicReadWrite:${
        process.env.DBPW
    }@ds046027.mlab.com:46027/commics`
);

const mockSeries = [
    { id: 1, title: 'Rode Ridder', dbName: 'roderidder' },
    { id: 2, title: 'Suske & Wiske', dbName: 'suskeenwiske' }
];

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
    }
`;

module.exports.seriesResolvers = {
    Query: {
        serie: (root, args, ctx, info) => {
            console.log(info);
            console.log('***');
            console.log(ctx.req.user);

            const serie = mockSeries.find(s => s.id == args.id);
            return serie;
            //db.get(serie.dbName).find({}).then(s => s.json());
        },
        comic: async (root, args) => {
            let com = await db.get(args.dbName).findOne({ nr: args.nr });
            com._id = com._id.toString();

            return com;
        },
        comics: async (root, args) => {
            let x = await db.get(args.dbName).find({ nr: { $ne: null } });
            x.forEach(com => (com._id = com._id.toString()));

            return x;
        },
        allSeries: () => {
            return mockSeries;
        }
    },
    Serie: {
        comics: async serie => {
            console.log(serie);

            return await db.get(serie.dbName).find({});
        }
    }
};
