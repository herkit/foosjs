var scoreTeam = function(p1, p2) {
  // Sort team players
  var p = [p1, p2].slice(0);
  p.sort();
  p1 = p[0]; p2 = p[1];

  // Calculate lowest player part
  p1 = p1 - 900;
  if (p1 > 0) p1 = p1/2; else p1 = 0;

  return p1 + p2;
}

module.exports = function(ev) 
{
  this.increasePlayerProperty(ev.data.winner_1, 'doublesWon', 1);
  this.increasePlayerProperty(ev.data.winner_2, 'doublesWon', 1);
  this.increasePlayerProperty(ev.data.loser_1, 'doublesLost', 1);
  this.increasePlayerProperty(ev.data.loser_2, 'doublesLost', 1);

  var totalWinnerRank = scoreTeam(this.getPlayerState(ev.data.winner_1).rank, this.getPlayerState(ev.data.winner_2).rank);
  var totalLoserRank = scoreTeam(this.getPlayerState(ev.data.loser_1).rank, this.getPlayerState(ev.data.loser_2).rank);

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
}