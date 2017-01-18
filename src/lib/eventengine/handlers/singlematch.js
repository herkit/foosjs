module.exports = {
  handler: function(ev) 
  {
    this.increasePlayerProperty(ev.data.winner_1, 'singlesWon', 1);
    this.increasePlayerProperty(ev.data.loser_1, 'singlesLost', 1);

    var totalWinnerRank = this.getPlayerState(ev.data.winner_1).rank;
    var totalLoserRank = this.getPlayerState(ev.data.loser_1).rank;
    var scorePerPlayer = 10;
    if (totalWinnerRank > totalLoserRank) {
      scorePerPlayer = 5;
      if (totalWinnerRank > totalLoserRank + 100)
        scorePerPlayer = 0;
    } else {
      if (totalWinnerRank < totalLoserRank - 100)
      {
        scorePerPlayer = 20;
      } 
    }

    this.increasePlayerProperty(ev.data.winner_1, 'rank', scorePerPlayer);
    this.increasePlayerProperty(ev.data.loser_1, 'rank', -scorePerPlayer);
  },
  properties: 
  {
    winner_1: { type: 'player' },
    loser_1: { type: 'player' }
  }
}