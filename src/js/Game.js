/**
 * General high-level interface for controlling the game flow and turns
 */
var Game = (function () {

    var players;
    var currentTurn; // int from 0 - players.length identifying the current players turn


    var init = function (maxPlayers) {
        Scene.init(maxPlayers);
        Scene.start();
        CameraManager.disableControls();
    };


    var addPlayers = function (_players) {
        players = _players;

        for (p in players) {
            players[p].init();
            players[p].setPosition(Scene.getTerrain().playerPositions[p]);
            Scene.addPlayer(players[p]);
        }
    };


    var start = function () {
        currentTurn = 0;
        setTimeout(nextTurn, 1500);
    };


    /**
     * Initiate the next turn
     */
    function nextTurn() {
        //console.log("----------------------------------");
        //console.log("Game.nextTurn()", currentTurn, players[currentTurn].isHuman);

        if (players[currentTurn].life <= 0) {
            updateCurrentTurn();
            nextTurn();
            return;
        }

        $(window).on("PROJECTILE_IMPACT", updateDamage);
        var pos = players[currentTurn].position.clone();

        // TODO instead of x,z -15 those should be behind the player FACING THE DIRECTION of other players (or previous
        // set player camera position
        //pos.x -= 15;
        //pos.z -= 15;
        pos.y = 35;

        // TODO eventually store each player's own last camera rotation and set it here when their turn starts
        CameraManager.animateTo(pos, players[currentTurn].position, 0, CameraManager.getCameraDefaults().playerV);

        // When the player is a human, hand over controls until they have fired otherwise make AI player fire automatically
        if (players[currentTurn].isHuman) {
            players[currentTurn].enableControls();
            CameraManager.enableControls();
        } else {
            // TODO plenty of AI and animation logic
            players[currentTurn].autofire();
        }
    }


    /**
     * After this rounds PROJECTILE_IMPACT check the damage done, calculate player life updates and see how the game
     * continues
     */
    function updateDamage() {
        $(window).off("PROJECTILE_IMPACT", updateDamage);

        // check and collect the players that are alive still
        var alive = playersAlive();

        // if no winner yet
        if (alive.length > 1) {
            if (players[currentTurn].isHuman) {
                players[currentTurn].disableControls();
                CameraManager.disableControls();
            }

            updateCurrentTurn();

            setTimeout(nextTurn, 1500);
        } else {
            UI.showWin(alive[0]);
        }
    }

    function updateCurrentTurn() {
        currentTurn++;
        if (currentTurn >= players.length) {
            currentTurn = 0;
        }
    }


    /**
     * Simple helper to collect all alive players into an array
     *
     * @returns {Array} The players alive still
     */
    function playersAlive() {
        var alivePlayers = [];
        for (var p in players) {
            if (players[p].life > 0) {
                alivePlayers.push(players[p]);
            }
        }
        return alivePlayers;
    }


    return {
        init: init,
        addPlayers: addPlayers,
        start: start,
        reset: start,
        getPlayers: function () {
            return players;
        }
    };
})();