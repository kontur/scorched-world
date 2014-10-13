/**
 * General high-level interface for controlling the game
 */
var Game = (function () {
    var start = function () {
        var player1, player2;
        Scene.init();
        Scene.start();

        player1 = new HumanPlayer({ color: 0x00ff00});
        player2 = new AIPlayer({ color: 0xff6600 });
        player1.enableControls();

        player1.init();
        player2.init();

        player1.setPosition(Scene.getTerrain().playerPositions[0]);
        player2.setPosition(Scene.getTerrain().playerPositions[1]);

        Scene.addPlayer(player1);
        Scene.addPlayer(player2);
    };

    return {
        start: start,
        reset: start
    };
})();