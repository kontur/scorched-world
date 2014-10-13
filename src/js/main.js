
$(function() {

    UI.init();

    var players = [
        new HumanPlayer({ color: 0x00ff00, name: "Foobar"}),
        new AIPlayer({ color: 0xff6600, difficulty: 0, name: "Robert the Robot" })
    ];
    Game.start(players);

});
