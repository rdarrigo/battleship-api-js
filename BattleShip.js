var BattleShip = (function () {

    this.state              = {};
    this.state.SETUP        = 0;
    this.state.COMMENCED    = 1;
    this.state.COMPLETE     = 2;

    this.game               = {};
    this.game.WIDTH         = 10;
    this.game.HEIGHT        = 10;
    this.game.PLAYERS       = 2;
    this.game.player_turn   = undefined;
    this.game.state         = 0;
    this.game.winner        = undefined;

    this.player             = {};
    this.player.ONE         = 0;
    this.player.TWO         = 1;
    this.ship               = {};
    this.ship.CARRIER       = 0;
    this.ship.BATTLESHIP    = 1;
    this.ship.SUBMARINE     = 2;
    this.ship.CRUISER       = 3;
    this.ship.PATROL        = 4;

    this.direction          = {};
    this.direction.NORTH    = "N";
    this.direction.SOUTH    = "S";
    this.direction.EAST     = "E";
    this.direction.WEST     = "W";

    this.fleet              = [];
    this.layout             = [];
    this.shots              = [];

    this.status = {
          "code" : {
              "SUCCESS"                 : 0
            , "GAME_COMMENCED"          : 1
            , "GAME_NOT_COMMENCED"      : 2
            , "GAME_SHIPS_NOT_PLACED"   : 3
            , "PLAYER_INVALID"          : 10
            , "PLAYER_NOT_YOUR_TURN"    : 11
            , "POSITION_OUT_OF_BOUNDS"  : 20
            , "DIRECTION_INVALID"       : 21
            , "SHIP_INVALID"            : 30
            , "SHIP_POSITION_INVALID"   : 31
        }
        , "message" : {
              0     : "Okay."
            , 1     : "Cannot perform this action as the game has already commenced."
            , 2     : "Cannot perform this action as the game has not commenced or is already complete."
            , 3     : "Cannot start the game. Not all player ships have been positioned."
            , 10    : "Player is not valid. Valid players are 0 or 1."
            , 11    : "Please wait for your turn."
            , 20    : "Position is out of bounds"
            , 21    : "Direction is invalid. Please use N, S, E or W."
            , 30    : "Ship is not valid. Valid ships are 0 to 4"
            , 31    : "Ship position is not valid."
        }
    };

    // Ship object
    function Ship (name, width, length) {
        this.name   = name;
        this.width  = width;
        this.length = length;
        this.coords = [];
    };

    // Checks if the game is complete
    var isGameComplete = function () {
        return (this.game.state == this.state.COMPLETE);
    };

    // General game setup
    function newGame() {
        for (var p = 0; p < game.PLAYERS; p++) {
            // Ships must be placed in descending length order to ensure 
            fleet[p]    = [
                  new Ship("carrier"    , 1, 5)
                , new Ship("battleship" , 1, 4)
                , new Ship("submarine"  , 1, 3)
                , new Ship("cruiser"    , 1, 2)
                , new Ship("patrol"     , 1, 1)
            ];
            this.layout[p]          = {};
            this.shots[p]           = [];
            this.game.state         = this.state.SETUP;
            this.game.player_turn   = undefined;
            this.game.winner        = undefined;
        }

        return this.status.code.SUCCESS;
    };

    newGame();

    // Returns an API response with method response, game state and player boards
    function formatAPIResponse(code) {
        var position;
        var response = {
              "success" : (code == this.status.code.SUCCESS) ? true : false
            , "message" : this.status.message[code] || ""
            , "state"   : this.game.state
            , "turn"    : this.game.player_turn
            , "winner"  : this.game.winner
            , "player"  : []
        };

        // Iterate over each player and generate their primary board and tracking board state
        for (var p = 0; p < this.game.PLAYERS; p++) {
            response.player[p] = {
                  "primaryBoard" : {}
                , "trackingBoard" : {}
            };

            // Iterate over each grid co-ordinate
            for (var x = 0; x < game.WIDTH; x++) {
                for (var y = 0; y < game.HEIGHT; y++) {

                    // create lookup coord
                    coord = x.toString() + "," + y.toString();
                    position = indexToChar(x).toUpperCase() + "" + (y+1).toString();

                    // if there is a ship at this coordinate, add it to the primary board along with the hit/miss
                    if (typeof layout[p][coord] != 'undefined') {

                        response.player[p].primaryBoard[position] = {
                              "ship"  : layout[p][coord]
                            , "hit"   : !(shots[getOpposition(p)].indexOf(coord) == -1)
                        };
                    }

                    // generate tracking board of players attacks
                    if (shots[p].indexOf(coord) >= 0) {
                        response.player[p].trackingBoard[position] = (typeof layout[getOpposition(p)][coord] != 'undefined')
                    }

                }
            }
        }
        return response;
    };

    // Check the player is valid 
    function checkValidPlayer(p) {
        return (p >= 0 && p < this.game.PLAYERS);
    };

    // Reset a players layout
    function clearLayout(player) {
        if (!checkValidPlayer(player))              return this.status.code.INVALID_PLAYER;
        if (this.game.state != this.state.SETUP)    return this.status.code.GAME_COMMENCED;
                    
        layout[player] = {};
        for (var s = 0; s < fleet[player].length; s ++) {
            fleet[player][s].coords  = [];
        }

        return this.status.code.SUCCESS;
    };

    // Returns the opposing player 
    function getOpposition(p) {
        return (p+1) % game.PLAYERS;
    };

    // Returns the next player and updates the turn 
    var nextTurn = function () {
        this.game.player_turn=getOpposition(this.game.player_turn);
        return this.game.player_turn;
    };

    // converts numberic index to character 0 = A, 1 = B... 25 = Z
    function indexToChar (i) {
        // 97 = a
        return String.fromCharCode(97 + i); 
    };

    // converts character to numeric index e.g. A = 0, B = 1.. Z = 25
    function charToIndex (c) {
        return parseInt(c.toLowerCase().charCodeAt(0) - 97);
    };

    // Accepts a position in format of A1 and returns coords object
    function positionToCoords (p) {
        var xPattern = /[A-Z]+/;
        var yPattern = /[0-9]+/;
        return coords = {
              "x": charToIndex(p.match(xPattern)[0])
            , "y": parseInt(p.match(yPattern)[0]-1)
        }
    };

    // prints a layout to console for debugging
    function printLayout(player) {
        var marker, coord;

        // print board header
        process.stdout.write("   ");

        for (var y = 0; y < game.HEIGHT; y++) {
            process.stdout.write(y + " "); 
        }
        process.stdout.write("\n");

        //print board body
        for (var x = 0; x < game.WIDTH; x++) {
            process.stdout.write(indexToChar(x) + ": "); 

            for (var y = 0; y < game.HEIGHT; y++) {
                coord = x.toString() + "," + y.toString();
                if (typeof layout[player][coord] == 'undefined') {
                        marker = "~";
                } else {
                        marker = layout[player][coord];
                }
                process.stdout.write(marker + " "); 
            }
            process.stdout.write("\n"); 
        }
    };

    // Place a ship on a players board
    function place(player, ship, x, y, d) {
        if (this.game.state != this.state.SETUP)    return this.status.code.GAME_COMMENCED;
        if (!checkValidPlayer(player))              return this.status.code.INVALID_PLAYER;
        if (ship > fleet[player].length)            return this.status.code.SHIP_INVALID; 
        
        // Calculate bounds of the ship starting from the most North / East co-ordinate - transforming ship direction to South or East 

        var start = {
              "x": parseInt(x)
            , "y": parseInt(y)
        };
        var current = {
              "x": parseInt(x)
            , "y": parseInt(y)
        };
        var end = {
                "x": parseInt(x)
            , "y": parseInt(y)
        };
        
        var coords = [];

        switch (d) {
            case this.direction.SOUTH :
                end.x       = x + fleet[player][ship].length - 1;
                break;
            case this.direction.NORTH :
                // transform North to South
                start.x     = x - fleet[player][ship].length + 1;
                current.x   = x - fleet[player][ship].length + 1;
                d           = this.direction.SOUTH;
                break;
            case this.direction.WEST :
                // transform West to East
                start.y     = y - fleet[player][ship].length + 1;
                current.y   = y - fleet[player][ship].length + 1;
                d           = this.direction.EAST;
                break;
            case this.direction.EAST :
                end.y       = y + fleet[player][ship].length - 1;
                break;
            default :
                return this.status.code.DIRECTION_INVALID;
        }
        
        // out of bounds
        if  (  start.x < 0 
            || start.y < 0 
            || end.x >= game.WIDTH
            || end.y >= game.HEIGHT) { return this.status.code.POSITION_OUT_OF_BOUNDS; }

        var coord;

        switch (d) {
            case this.direction.NORTH :
            case this.direction.SOUTH :

                while (current.x <= end.x) {
                    coord = current.x.toString() + "," + current.y.toString();

                    if (typeof layout[player][coord] == 'undefined'
                        || layout[player][coord] == ship) {
                        coords.push(coord);
                    } else {
                        return this.status.code.SHIP_POSITION_INVALID;
                    }
                    current.x++;
                }
                break;
            case this.direction.EAST :
            case this.direction.WEST :
                while (current.y <= end.y) {
                    coord = current.x.toString() + "," + current.y.toString();

                    if (typeof layout[player][coord] == 'undefined'
                        || layout[player][coord] == ship) {
                        coords.push(coord);
                    } else {
                        return this.status.code.SHIP_POSITION_INVALID;
                    }
                    current.y++;
                }
                break;
        }

        // This isn't a great way to fail, but will do
        if (coords.length == fleet[player][ship].length) {

            // remove the old ships coordinates
            while (fleet[player][ship].coords.length > 0) {
                delete layout[player][ fleet[player][ship].coords.shift() ];
            }

            for (var c = 0; c < coords.length; c++) {
                layout[player][coords[c]] = ship;
            }

            fleet[player][ship].coords = coords;

            return this.status.code.SUCCESS;
        } else {
            return this.status.code.SHIP_POSITION_INVALID;
        };
    };

    // Generate random ship layout for player
    function randomLayout(player) {
            
        if (this.game.state != this.state.SETUP) return this.status.code.GAME_COMMENCED;

        clearLayout(player);
        
        // for each ship find a random and valid position / direction
        
        var x, y, d;

        for (var s = 0; s < fleet[player].length; s ++) {

            do {
                d = Math.floor((Math.random() * 3));
                switch (d) {
                    case 0 : d = this.direction.NORTH; break;
                    case 1 : d = this.direction.SOUTH; break;
                    case 2 : d = this.direction.EAST; break;
                    case 3 : d = this.direction.WEST; break;
                }

                x = Math.floor((Math.random() * game.WIDTH));
                y = Math.floor((Math.random() * game.HEIGHT));
    
            } while (place(player, s, x, y, d) != this.status.code.SUCCESS);
        }

        return this.status.code.SUCCESS;
    };

    
    // Refresh the game state and determine if there has been a winner
    var refreshGameState = function () {
        var player          = this.game.player_turn; 
        var opposingPlayer  = getOpposition(player);

        // check all ship coordinates for the opposing player and if all have been hit by the current player
        for (var s = 0; s < fleet[opposingPlayer].length; s++) {
            for (var c = 0; c < fleet[opposingPlayer][s].coords.length; c++) {
                coords = fleet[opposingPlayer][s].coords[c];
                
                if (shots[player].indexOf(coords) == -1) {
                    return true;   
                };
            }
        }

        this.game.state     = this.state.COMPLETE;
        this.game.turn      = undefined;
        this.game.winner    = player;

        return true;
    };

    // Attempts to fire an attack at a given location
    var fire = function (player, x, y) {
        if (this.game.state != this.state.COMMENCED)    return this.status.code.GAME_NOT_COMMENCED;
        if (!checkValidPlayer(player))                  return this.status.code.PLAYER_INVALID;
        if (this.game.player_turn != player)            return this.status.code.PLAYER_NOT_YOUR_TURN;

        // out of bounds
        if (    x < 0
            ||  y < 0
            ||  x >= game.WIDTH
            ||  y >= game.HEIGHT) return this.status.code.POSITION_OUT_OF_BOUNDS;

        // registers the position of the shot if it hasn't been bombed before
        if (shots[player].indexOf(x.toString() + "," + y.toString()) == -1) {
            shots[player].push(x.toString() + "," + y.toString());
        }

        // refresh game state and update the next turn
        refreshGameState();
        nextTurn();

        return this.status.code.SUCCESS;
    };

    // Check that all player ships have been placed
    function checkAllShipsPlaced() {
        for (var p = 0; p < this.game.PLAYERS; p++) {
            for (var s = 0; s < fleet[p].length; s++) {

                if (fleet[p][s].length != fleet[p][s].coords.length) return false;

                for (var c = 0; c < fleet[p][s].coords.length; c++) {
                    coords = fleet[p][s].coords[c];
                    
                    if (typeof layout[p][coords] == 'undefined') {
                        return false;
                    };
                }

            }
        }
        return true;
    };

    return {
          PLAYER_ONE        : this.player.ONE
        , PLAYER_TWO        : this.player.TWO
        , STATE_SETUP       : this.state.SETUP
        , STATE_COMMENCED   : this.state.COMMENCED
        , STATE_COMPLETE    : this.state.COMPLETE
        , CARRIER           : this.ship.CARRIER
        , BATTLESHIP        : this.ship.BATTLESHIP
        , SUBMARINE         : this.ship.SUBMARINE
        , CRUISER           : this.ship.CRUISER
        , PATROL            : this.ship.PATROL
        , NORTH             : this.direction.NORTH
        , SOUTH             : this.direction.SOUTH
        , EAST              : this.direction.EAST
        , WEST              : this.direction.WEST
        , createBoard:function(player) {
            return  formatAPIResponse(
                clearLayout(player)
            );
        }
        , randomBoard:function(player) {
            return formatAPIResponse(
                randomLayout(player)
            );
        }
        , gameStatus:function() {
            return formatAPIResponse(
                status.code.SUCCESS
            );
        }
        , gameStart:function() {
            switch (game.state) {
                case state.SETUP :
                    // need to validate ships are all placed correctly

                    if (checkAllShipsPlaced()) {
                        game.state          = state.COMMENCED;
                        game.player_turn    = Math.floor((Math.random() * 2));

                        return formatAPIResponse(
                            status.code.SUCCESS
                        );
                    } else {
                        return formatAPIResponse(
                            status.code.GAME_SHIPS_NOT_PLACED
                        );
                    };

                    break;

                case state.COMMENCED :
                case state.COMPLETE :
                    // incorect response
                    return formatAPIResponse(
                        status.code.GAME_NOT_COMMENCED
                    );
                    break;
            }
        }
        , gameReset:function() {
            return formatAPIResponse(
                newGame()
            );
        }
        , placeShip:function(player, ship, position, d) {
            var coords = positionToCoords(position);
            return formatAPIResponse(
                place(player, ship, coords.x, coords.y, d)
            );
        }
        , launchAttack:function(fromPlayer, position) {
            var coords      = positionToCoords(position);
            var response    = formatAPIResponse (
                // need to actually check this response before doing anything further
                fire(fromPlayer, coords.x, coords.y)
            )
            
            if (response.success) {
                var opposingPlayer = getOpposition(fromPlayer); 

                // Add in the status of the attack i.e. hit or miss
                response.hit = typeof layout[opposingPlayer][coords.x.toString() + "," + coords.y.toString()] != 'undefined';
                
                // Custom message if game is complete
                if (isGameComplete()) {
                    response.message = "Well done player " + fromPlayer + ".";
                }
            }

            return response;
        }
    }

}());
