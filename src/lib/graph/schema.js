var { graphql, buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    players: [Player]
    player(id): Player
  }

  type Player {
    name: String!
    _id: ID!
    events: [Event]
    lastEvent: Event,
    email: String,
    avatar: String
  }

  type Event {
    time: String!
    _id: ID!
    type: String!
    what: String
  }

`);

module.exports = schema;

/* type SingleMatchEvent implements Event {
    time: String!
    _id: ID!
    type: String!
    what: String
    winner_1: Player
    loser_1: Player
  }*/