var { graphql, buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    players: [Player]
    player(_id: ID!): Player
    lastSnapshot: Snapshot
    events(first: Int, after: ID): [Event]
  }

  type Player {
    _id: ID!
    name: String!
    events: [Event]
    lastEvent: Event
    email: String
    avatar: String
    state: PlayerState
    history: [PlayerState]
  }

  type Event {
    _id: ID!
    time: String!
    seqNo: Int!
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
    event: Event!
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