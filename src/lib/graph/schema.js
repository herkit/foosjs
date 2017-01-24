"use strict";

var schema = `
  type Query {
    players(ids: [ID] exclude: [ID]): [Player]
    player(_id: ID!): Player
    scoreboard: Snapshot
    events(first: Int, after: ID): [Event]
  }

  type Player {
    _id: ID!
    name: String!
    email: String
    avatar: String
    avatarIsSet: Boolean
    lastEvent: Event
    state: PlayerState
    events: [Event]
    history: [PlayerState]
  }

  interface Event {
    _id: ID!
    time: String!
    seqNo: Int!
    type: String!
    what: String
  }

  type FoosEvent implements Event {
    _id: ID!
    time: String!
    seqNo: Int!
    type: String!
    what: String
  }

  type DoubleMatchEvent implements Event {
    _id: ID!
    time: String!
    seqNo: Int!
    type: String!
    what: String
    winner_1: Player!
    winner_2: Player!
    loser_1: Player!
    loser_2: Player!   
  }

  type SingleMatchEvent implements Event {
    _id: ID!
    time: String!
    seqNo: Int!
    type: String!
    what: String
    winner_1: Player!
    loser_1: Player!
  }

  type Snapshot {
    _id: ID!
    time: String!
    players: [PlayerState]!
  }

  type PlayerState {
    time: String!
    player: Player!
    event: Event!
    rank: Int!
    gamesPlayed: Int!
    singlesWon: Int!
    singlesLost: Int!
    doublesWon: Int!
    doublesLost: Int!
  }

`;

module.exports = schema;

/* type SingleMatchEvent implements Event {
    time: String!
    _id: ID!
    type: String!
    what: String
    winner_1: Player
    loser_1: Player
  }*/