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