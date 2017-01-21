var { graphql, buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    players: [Player]
    player(_id: ID!): Player
    lastSnapshot: Snapshot
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

  type Snapshot {
    _id: ID!
    time: String!
    players: [PlayerState]!
  }

  type PlayerState {
    player: Player!
    rank: Int!
    gamesPlayed: Int!
    singlesWon: Int!
    singlesLost: Int!
    doublesWon: Int!
    doublesLost: Int!
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