## Get event with match participants

```
{
  events(first:10) {
    _id 
    time
    type
    ... on DoubleMatchEvent { 
      winner_1 { _id name avatar }
      winner_2 { _id name avatar }
      loser_1 { _id name avatar }
      loser_2 { _id name avatar }
    }
    ... on SingleMatchEvent {
      winner_1 { _id name avatar }
      loser_1 { _id name avatar }
    }
  
  }
}
```

## Get player history (for graphs etc)

```
query getPlayerHistory ($playerIds: [ID]!) {
  players(ids: $playerIds) {
    _id
    name
    history {
      time
      rank
    }
  }
}
```
Variables:
```
{
  "playerIds": ["asf-DWf32", "asfACE-SAF"]
}
```
