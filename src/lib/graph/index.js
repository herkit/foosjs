var graphqltools = require('graphql-tools');

var graphqlHTTP = require('express-graphql');
var schema = require('./schema'),
    root = require('./root');

var s = graphqltools.makeExecutableSchema({typeDefs: schema, resolvers: root});
graphqltools.addResolveFunctionsToSchema(s, root);


module.exports = graphqlHTTP({
  schema: s,
  graphiql: process.env.NODE_ENV === 'development',
});