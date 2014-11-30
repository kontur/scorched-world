/**
 * Singleton for managing and reacting to the user interface of the game
 */
var UI = (function () {

    var playerColors = ["#66d78b", "#1c5ed7", "#b0116f", "#ffd800"];

    var playerRowTemplate = Handlebars.compile($("#playerRowTemplate").html());
    var $playersTable = $("#start table");

    var playerHUDTemplate = Handlebars.compile($("#playerHUDTemplate").html());
    var $playersHUD = $("#hud table");

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
                options = {
                    name: $this.find("input[name=playerName]").val(),
                    color: playerColors[players.length]
                },
                p = null;

            if (!options.name) {
                options.name = "Mr. Random";
            }

            if ($this.find("select").val() == "human") {
                p = new HumanPlayer(options);
            } else {
                p = new AIPlayer(options);
            }


            //options.color = "" + options.color.toString(16);
            $playersHUD.append(playerHUDTemplate(options));
            $(p).on("CHANGE_LIFE", updatePlayerLife);
            players.push(p);

        });

        hideMenu();
        Game.addPlayers(players);
        Game.start();
        showHUD();
    }


    function updatePlayerLife(e) {
        console.log("UI.updatePlayerLife", e);
    }


    /**
     * check for valid player name etc input
     *
     * @param e
     */
    function startUpdatePlayers(e) {
        var numPlayers = $(e.target).val();
        $playersTable.show();
        $("#start button").removeAttr("disabled");

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
        $("#menus").fadeIn();
        $(menuId).show();
    }

    function hideMenu() {
        $("#menus").hide().children().hide();
    }

    function showHUD() {
        $("#hud").show();
    }


    return {
        init: init,
        startGame: startGame
    };

})();
