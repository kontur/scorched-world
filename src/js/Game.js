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

        setTimeout(nextTurn, 1500);
    };


    function nextTurn() {
        console.log("----------------------------------");
        console.log("Game.nextTurn()", currentTurn, players[currentTurn].isHuman);

        $(window).on("PROJECTILE_IMPACT", updateDamage);
        var pos = players[currentTurn].position.clone();

        //TODO instead of x,z -15 those should be behind the player facing the direction of other players
        pos.x -= 15;
        pos.z -= 15;
        pos.y = 25;
        CameraManager.animateTo(pos, players[currentTurn].position);

        if (players[currentTurn].isHuman) {
            players[currentTurn].enableControls();
        } else {
            // TODO plenty of AI and animation logic
            players[currentTurn].autofire();
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

            setTimeout(nextTurn, 1500);
        }
    }


    return {
        start: start,
        reset: start
    };
})();