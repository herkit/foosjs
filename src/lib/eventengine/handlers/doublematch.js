module.exports = {
  handler: function(ev) 
  {
    this.increasePlayerProperty(ev.data.winner_1, 'doublesWon', 1);
    this.increasePlayerProperty(ev.data.winner_2, 'doublesWon', 1);
    this.increasePlayerProperty(ev.data.loser_1, 'doublesLost', 1);
    this.increasePlayerProperty(ev.data.loser_2, 'doublesLost', 1);

    var totalWinnerRank = this.getPlayerState(ev.data.winner_1).rank + this.getPlayerState(ev.data.winner_2).rank;
    var totalLoserRank = this.getPlayerState(ev.data.loser_1).rank + this.getPlayerState(ev.data.loser_2).rank;

    var scorePerPlayer = 5;
    if (totalWinnerRank > totalLoserRank) {
      scorePerPlayer = 3;
      if (totalWinnerRank > totalLoserRank + 100)
        scorePerPlayer = 0;
    } else {
      if (totalWinnerRank < totalLoserRank - 100)
      {
        scorePerPlayer = 10;
      } 
    }

    this.increasePlayerProperty(ev.data.winner_1, 'rank', scorePerPlayer);
    this.increasePlayerProperty(ev.data.winner_2, 'rank', scorePerPlayer);
    this.increasePlayerProperty(ev.data.loser_1, 'rank', -scorePerPlayer);
    this.increasePlayerProperty(ev.data.loser_2, 'rank', -scorePerPlayer);
  },
  properties: 
  {
    winner_1: { type: 'player' },
    winner_2: { type: 'player' },
    loser_1: { type: 'player' },
    loser_2: { type: 'player' }
  }
} 