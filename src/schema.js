const { gql } = require('apollo-server');
const _ = require('lodash');
const { postDefs, postResolvers } = require('./models/post.js');
const { seriesDefs, seriesResolvers } = require('./models/series.js');

module.exports.typeDefs = gql`
    directive @requireAuth on FIELD_DEFINITION

    enum Role {
        ADMIN
        USER
    }
    type Query {
        _empty: String
    }
    type Mutation {
        _empty: String
    }
    ${postDefs}
    ${seriesDefs}
`;

module.exports.resolvers = _.merge(postResolvers, seriesResolvers);
