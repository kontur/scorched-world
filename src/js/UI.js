/**
 * Singleton for managing and reacting to the user interface of the game
 */
var UI = (function () {

    var playerColors = [0x00ff00, 0xff0000, 0xffff00, 0x00ffff];
    var playerRowTemplate = Handlebars.compile($("#playerRowTemplate").html());
    var $playersTable = $("#start table");

    var init = function () {
        $(window).on("resize", onResize);
        onResize();
        $("#ui-start-game").on("click", startGame);
        $("#menus [name=numPlayers]").on("change", startUpdatePlayers);
        showMenu("#start");
    };


    //TODO this resizing doesn't really work yet as intended; it stretches the scene
    function onResize() {
        var w = $(window).width();
        var h = $(window).height();

        $("#gamecanvas").css("width", w + "px");
        $("#gamecanvas").css("height", h + "px");
    }


    //function resetScene() {
    //    Game.reset();
    //}

    function startGame() {
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


        // lazy dev mode
        while (players.length < 2) {
            players.push(new HumanPlayer({ color: playerColors[players.length], name: "Foobar" }));
            hideMenu();
        }


        //new HumanPlayer({ color: 0xff0000, name: "Barfoo" })
        //new AIPlayer({ color: 0xff00ff, name: "Foobar" }),
        //new AIPlayer({ color: 0xff6600, difficulty: 0, name: "Robert the Robot" })

        console.log(players);

        hideMenu();
        Game.start(players);
    }


    function startUpdatePlayers(e) {
        console.log($(e.target).val());

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
