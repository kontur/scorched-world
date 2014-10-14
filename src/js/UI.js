/**
 * Singleton for managing and reacting to the user interface of the game
 */
var UI = (function () {

    var init = function () {
        $(window).on("resize", onResize);
        onResize();
        $("#ui-reset-scene").on("click", resetScene);
        $("#ui-start-game").on("click", startGame);
    };

    //TODO this resizing doesn't really work yet as intended; it stretches the scene
    function onResize() {
        var w = $(window).width();
        var h = $(window).height();

        $("#gamecanvas").css("width", w + "px");
        $("#gamecanvas").css("height", h + "px");
    }


    function resetScene() {
        Game.reset();
    }

    function startGame() {
        var players = [
            //new HumanPlayer({ color: 0x00ff00, name: "Foobar"}),
            new AIPlayer({ color: 0xff00ff, name: "Foobar" }),
            new AIPlayer({ color: 0xff6600, difficulty: 0, name: "Robert the Robot" })
        ];

        Game.start(players);
    }

    return {
        init: init,
        startGame: startGame
    };

})();
