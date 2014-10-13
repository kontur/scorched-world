/**
 * General high-level interface for controlling the game
 */
var Game = (function () {

    var players;
    var currentTurn; // int from 0 - players.length identifying the current players turn


    /**
     * Start a new game with given players
     *
     * @param _players array of player objects
     */
    var start = function (_players) {
        players = _players;

        Scene.init();
        Scene.start();

        for (p in players) {
            players[p].init();
            players[p].setPosition(Scene.getTerrain().playerPositions[p]);
            Scene.addPlayer(players[p]);
        }

        currentTurn = 0;


        nextTurn();
    };


    function nextTurn() {
        console.log("Game.nextTurn()", currentTurn, players[currentTurn].isHuman);

        $(window).on("PROJECTILE_IMPACT", updateDamage);

        if (players[currentTurn].isHuman) {
            players[currentTurn].enableControls();
        } else {
            players[currentTurn].fire(1);
        }
    }


    function updateDamage() {
        console.log("Game.updateDamage()");
        $(window).off("PROJECTILE_IMPACT", updateDamage);

        // if no winner
        if (true) {
            if (players[currentTurn].isHuman) {
                players[currentTurn].disableControls();
            }
            currentTurn++;
            if (currentTurn >= players.length) {
                currentTurn = 0;
            }
            nextTurn();
        }
    }


    return {
        start: start,
        reset: start
    };
})();