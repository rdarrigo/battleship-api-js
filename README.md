# battleship-api-js
A battleship API built in JavaScript. Actual game rules can be found at: http://en.wikipedia.org/wiki/Battleship_(game)

The API mainains the state of a game of Battleship and is implemented assuming there are:

* 2 players
* 10 x 10 playing grid (supports up to 26 x 26 grid)
* 5 x Ships (1 x 5, 1 x 4, 1 x 3, 1 x 2 & 1 x 1)

A game can be in three states:

* Setup - players are able to place their ships on their board, no attacks can be launched.
* Commenced - players can launch attacks, based on their turn, ships cannot be repositioned.
* Complete - the game is over and can only be reset to start a new game. 

## Public methods:

- .gameReset();   - resets the game.
- .gameStatus();  - returns the status of the game, including player.
- .gameStart();   - starts the game, only once all players ships have been placed on their grid. NB: the first turn is determined from the toss of a coin, so check the response.

- .placeShip(player, ship, position, direction); place a players ship on their primary board - 
- generate a primary boards with ships randomly placed - .randomBoard(player);
- launch an attack - .attack(fromPlayer, position);

Where: 
- int player/fromPlayer - 
  - 0 for player 1
  - 1 for player 2
- string position - A1, A2 etc.
- int ship - the ID of the ship. Use the following public properties:
  - BattleShip.CARRIER	  - 1 x 5
  - Battleship.BATTLESHIP	- 1 x 4
  - BattleShip.SUBMARINE	- 1 x 3
  - BattleShip.CRUISER	  - 1 x 2
  - BattleShip.PATROL	    - 1 x 1
- string direction - the direction the ship is to be placed:
  - BattleShip.NORTH;
  - BattleShip.SOUTH;
  - BattleShip.EAST;
  - BattleShip.WEST;
  
## Example usage:

g = new BattleShip()

// generates a random board for player 1
g.randomBoard(BattleShip.PLAYER_ONE); 

// manually place ships for player 2
g.placeShip(BattleShip.PLAYER_TWO, BattleShip.CARRIER, "E1", BattleShip.NORTH); // Places player 2's CARRIER in E1 facing NORTH i.e. in positions E1, D1, C1, B1, A1
g.placeShip(BattleShip.PLAYER_TWO, BattleShip.BATTLESHIP, "B2", BattleShip.SOUTH); // Places player 2's BATTLESHIP in E2 facing SOUTH i.e. in positions B2, C2, D2, E2.
g.placeShip(BattleShip.PLAYER_TWO, BattleShip.SUBMARINE, "A2", BattleShip.EAST); // Places player 2's SUBMARINE in A2 facing EAST i.e. in positions A2, A3, A4
g.placeShip(BattleShip.PLAYER_TWO, BattleShip.CRUISER, "J10", BattleShip.WEST); // Places player 2's CRUISER in J10 facing WEST i.e. in positions J10, J9
g.placeShip(BattleShip.PLAYER_TWO, BattleShip.PATROL, "G5", BattleShip.WEST); // Places player 2's PATROL in G5 facing NORTH i.e. in positions G5

// to move a ship already placed
g.placeShip(BattleShip.PLAYER_TWO, BattleShip.CARRIER, "F1", BattleShip.NORTH); // Places player 2's CARRIER in F1 facing NORTH i.e. in positions F1, E1, D1, C1, B1

// check the game status
g.gameStatus()

// start the game now that both players ships have been placed 
g.gameStart()

// check the response of g.gameStart() or g.gameStatus() to determine who's turn is first
// presuming it is player two's turn first, launch the first attack
g.launchAttack(BattleShip.Player_TWO, "H1") // check the hit parameter in the response to determine a hit or miss
g.launchAttack(BattleShip.Player_ONE, "B1") // this will register a hit

// ... continue launching attacks until you have hit all of the opposite players ship locations
// to check the state of a players board at any stage, inspect the corresponding players primaryBoard

g.gameStatus().player[BattleShip.PLAYER_ONE].primaryBoard
g.gameStatus().player[BattleShip.PLAYER_TWO].primaryBoard

// to check the location of previous shots fired by player
g.gameStatus().player[BattleShip.PLAYER_ONE].trackingBoard
