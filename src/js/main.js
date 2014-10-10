

$(function() {

    var player1, player2;


    UI.init();

    Scene.init();
    Scene.start();

    player1 = new Player();
    player2 = new Player();

    player1.init();
    player2.init();

    player1.setPosition(Scene.terrain.playerPositions[0]);
    player2.setPosition(Scene.terrain.playerPositions[1]);

    Scene.addPlayer(player1);
    Scene.addPlayer(player2);

});
