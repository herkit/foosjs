module.exports = function(players, ev) 
{
  this.increasePlayerProperty(players, ev.data.winner_1, 'singlesWon', 1);
  this.increasePlayerProperty(players, ev.data.loser_1, 'singlesLost', 1);

  var totalWinnerRank = players[ev.data.winner_1].rank;
  var totalLoserRank = players[ev.data.loser_1].rank;
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

  this.increasePlayerProperty(players, ev.data.winner_1, 'rank', scorePerPlayer, ev._id);
  this.increasePlayerProperty(players, ev.data.loser_1, 'rank', -scorePerPlayer, ev._id);
}