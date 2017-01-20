var graphqlHTTP = require('express-graphql');
var schema = require('./schema'),
    root = require('./root');

module.exports = graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
});