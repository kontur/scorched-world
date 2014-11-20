/**
 * Singleton for managing and reacting to the user interface of the game
 */
var UI = (function () {

    var playerColors = [0x00ff00, 0xff0000, 0xffff00, 0x00ffff];
    var playerRowTemplate = Handlebars.compile($("#playerRowTemplate").html());
    var $playersTable = $("#start table");
    var maxPlayers = 4;


    var init = function () {
        $(window).on("resize", onResize);
        onResize();
        $("#ui-start-game").on("click", startGame);
        $("#menus [name=numPlayers]").on("change", startUpdatePlayers);
        showMenu("#start");

        Game.init(maxPlayers);
    };


    /**
     * update the rendering size of the scene
     */
    function onResize() {
        var w = window.innerWidth;
        var h = window.innerHeight;

        $("#gamecanvas").css("width", w + "px");
        $("#gamecanvas").css("height", h + "px");

        CameraManager.updateAspect(w / h);
        Scene.setRendererSize(w, h);
    }


    /**
     * start off the game with the entered players
     */
    function startGame(e) {
        console.log("UI.startGame()");

        if ($playersTable.children(".playerRow").length < 1) {
            alert("Select a number of players");
            return false;
        }

        var players = [];

        $playersTable.children(".playerRow").each(function () {
            var $this = $(this),
                playerName = $this.find("input[name=playerName]").val();

            if (!playerName) {
                playerName = "Mr. Random";
            }

            if ($this.find("select").val() == "human") {
                players.push(new HumanPlayer({ color: playerColors[players.length], name: playerName }));
            } else {
                players.push(new AIPlayer({ color: playerColors[players.length], name: playerName }));
            }
        });

        hideMenu();
        Game.addPlayers(players);
        Game.start();
    }


    /**
     * check for valid player name etc input
     *
     * @param e
     */
    function startUpdatePlayers(e) {
        var numPlayers = $(e.target).val();

        while ($playersTable.children(".playerRow").length < numPlayers) {
            var numRows = $playersTable.children(".playerRow").length;
            $playersTable.append(playerRowTemplate({ num: numRows + 1 }));
        }

        while ($playersTable.children(".playerRow").length > numPlayers) {
            $playersTable.children(".playerRow:last").remove();
        }
    }


    function showMenu(menuId) {
        hideMenu();
        $(menuId).show();
    }

    function hideMenu() {
        $("#menus").children().hide();
    }


    return {
        init: init,
        startGame: startGame
    };

})();
