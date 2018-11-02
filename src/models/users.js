const { gql } = require('apollo-server');
const db = require('monk')(
    `mongodb://dbComicReadWrite:${
        process.env.DBPW
    }@ds046027.mlab.com:46027/commics`
);


module.exports.userDefs = gql`
    extend type Query {
        userData(userName: String): User @requireAuth
    }
    type User {
        series: [UserSerie]
        ownerId: Int
    }
    type UserSerie {
        comics: [UserComic]
    }
    type UserComic {
        _id: String!
        owned: Boolean
    }
    extend type Mutation {
        addPost(name: String!): Post
    }
`;


module.exports.userResolvers = {
    Query: {
        serie: async (root, args, ctx, info) => {
            console.log(info);
            console.log('***');
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
            let x = await db.get(args.dbName).find({ nr: { $ne: null } });
            x.forEach(com => (com._id = com._id.toString()));
            return x;
        },
        allSeries: async () => {
            let series = await db.get('series').find({});
            return series;
        }
    },
    Serie: {
        comics: async serie => {
            return await db.get(serie.dbName).find({});
        }
    }
};