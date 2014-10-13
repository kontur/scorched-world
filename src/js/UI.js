/**
 * Singleton for managing and reacting to the user interface of the game
 */
var UI = (function () {

    var init = function () {
        $(window).on("resize", onResize);
        onResize();
        $("#ui-reset-scene").on("click", resetScene);
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

    return {
        init: init
    };

})();
