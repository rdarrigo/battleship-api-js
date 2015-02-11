# battleship-api-js
A battleship API built in JavaScript. Actual game rules can be found at: http://en.wikipedia.org/wiki/Battleship_(game)

The API mainains the state of a game of Battleship and is implemented assuming there are:

* 2 players
* 10 x 10 playing grid (supports up to 26 x 26 grid)
* 5 x Ships (Carrier: 1 x 5, BattleShip: 1 x 4, Submarine: 1 x 3, Cruiser: 1 x 2, Patrol: 1 x 1)

All public methods return a consistent base response containing:

- success: Indicates the successful completion of the request.
- message: A description of the API response
- state: The state of the game. See the public property for Game State below.
- turn: The player who's turn is next, undefined = not determined yet, integer = the player identifier. See the public property for Player identifiers below.  
- winner: The eventual winner of the game, undefined = not determined yet, integer = the player who won. See the public property for Player identifiers below.
- player: An array of player identifiers containing the state of their primaryBoard & trackingBoard 
  - primaryBoard: An object literal of positions where the player has placed their ships only i.e. "A1", "F1" containing:
    - ship: the ship identifier that is in this position. See the public property for Ship identifiers below.
    - hit: Boolean whether this position hit by the opposite player, true = hit, false = miss
  - trackingBoard: An object literal of positions containinga boolean, true = hit, false = miss.
  
A game can be in three states:

* SETUP - players are able to place their ships on their board, no attacks can be launched.
* COMMENCED - players can launch attacks, based on their turn, ships cannot be repositioned.
* COMPLETE - the game is over and can only be reset to start a new game. 

To determine the state of the game, check the state property returned by the API.

## Public methods:

- .gameReset();   - resets the game returning to a setup state.
- .gameStatus();  - returns the status of the game, including player.
- .gameStart();   - starts the game, only once all players ships have been placed on their grid. NB: the first turn is determined from the toss of a coin, so check the response.

- .placeShip(player, ship, position, direction); place a players ship on their primary board - 
- generate a primary boards with ships randomly placed - .randomBoard(player);
- .launchAttack(fromPlayer, position) - launch an attack - 

Where: 
- int player/fromPlayer - the player identifier. Use the Player identifier properties provided in Public properties below.
- string position - A1, A2 etc.
- int ship - the ship identifier. Use the Ship identifier properties provided in Public properties below.
- string direction - the direction a ship is to be placed. Use the Direction properties provided in Public properties below.
  
## Public properties:
- Player identifier
  - BattleShip.PLAYER_ONE = 0
  - BattleShip.PLAYER_TWO = 1
- Ship identifier
  - BattleShip.CARRIER	  = 0   (1 x 5 ship)
  - Battleship.BATTLESHIP	= 1   (1 x 4 ship)
  - BattleShip.SUBMARINE	= 2   (1 x 3 ship)
  - BattleShip.CRUISER	  = 3   (1 x 2 ship)
  - BattleShip.PATROL	    = 4   (1 x 1 ship)
- Direction
  - BattleShip.NORTH      = "N"
  - BattleShip.SOUTH      = "S"
  - BattleShip.EAST       = "E"
  - BattleShip.WEST       = "W"
- Game state
  - BattleShip.SETUP      = 0
  - BattleShip.COMMENCED  = 1
  - BattleShip.COMPLETE   = 2

## Example usage

The below can be executed in node.js by running the following commands:
```
  node
  .load BattleShip.js
```

Example interactions with the API's public methods:
```
  var g = BattleShip;
  
  // generates a random board for player 1
  g.randomBoard(BattleShip.PLAYER_ONE);
  
  // manually place ships for player 2
  // place player 2's CARRIER in E1 facing NORTH i.e. in positions E1, D1, C1, B1, A1
  g.placeShip(BattleShip.PLAYER_TWO, BattleShip.CARRIER, "E1", BattleShip.NORTH); 
  
  // place player 2's BATTLESHIP in E2 facing SOUTH i.e. in positions B2, C2, D2, E2.
  g.placeShip(BattleShip.PLAYER_TWO, BattleShip.BATTLESHIP, "B2", BattleShip.SOUTH);
  
  // place player 2's SUBMARINE in A2 facing EAST i.e. in positions A2, A3, A4
  g.placeShip(BattleShip.PLAYER_TWO, BattleShip.SUBMARINE, "A2", BattleShip.EAST);

  // places player 2's CRUISER in J10 facing WEST i.e. in positions J10, J9
  g.placeShip(BattleShip.PLAYER_TWO, BattleShip.CRUISER, "J10", BattleShip.WEST);
  
  // places player 2's PATROL in G5 facing NORTH i.e. in positions G5
  g.placeShip(BattleShip.PLAYER_TWO, BattleShip.PATROL, "G5", BattleShip.WEST);
  
  // to move a ship already placed
  // places player 2's CARRIER in F1 facing NORTH i.e. in positions F1, E1, D1, C1, B1
  g.placeShip(BattleShip.PLAYER_TWO, BattleShip.CARRIER, "F1", BattleShip.NORTH); 
  
  // check the game status
  g.gameStatus();
  
  // start the game now that both players ships have been placed 
  g.gameStart();
  
  // check the response of g.gameStart() or g.gameStatus() to determine who's turn is first
  // presuming it is player two's turn first, launch the first attack
  g.launchAttack(BattleShip.PLAYER_TWO, "H1") // check the hit parameter in the response to determine a hit or miss
  g.launchAttack(BattleShip.PLAYER_ONE, "B1") // this will register a hit
  
  // ... continue launching attacks until you have hit all of the opposite players ship locations
  // to check the state of a players board at any stage, inspect the corresponding players primaryBoard
  g.gameStatus().player[BattleShip.PLAYER_ONE].primaryBoard
  g.gameStatus().player[BattleShip.PLAYER_TWO].primaryBoard
  
  // to check the location of previous shots fired by player
  g.gameStatus().player[BattleShip.PLAYER_ONE].trackingBoard

  // to restart the game again
  g.gameReset();
```
