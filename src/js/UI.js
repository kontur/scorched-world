var UI = (function () {

    var init = function () {
        $(window).on("resize", onResize);
        onResize();
        console.log("hello ui init");
    };

    function onResize(){
        console.log("hello resize");
        var w = $(window).width();
        var h = $(window).height();

        $("#gamecanvas").css("width", w + "px");
        $("#gamecanvas").css("height", h + "px");
    }

    return {
        init: init
    };

})();
