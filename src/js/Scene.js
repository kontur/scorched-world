/**
 * Main scene logic for rendering and organizing all the 3D parts of the game
 */
var Scene = (function () {

    var scene,
        camera,
        renderer,
        projectiles,
        terrain;


    /**
     * entry point for setting up the scene and renderer
     */
    var init = function () {
        console.log("Scene.init()");

        scene = new THREE.Scene();

        CameraManager.init();

        renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gamecanvas") });
			renderer.setSize(window.innerWidth, window.innerHeight);

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        directionalLight.position.set( 0, 1, 0 );
        scene.add( directionalLight );

        // create new terrain and player positions
        // order matters
        terrain = new Terrain();
        terrain.init();
        scene.add(terrain.obj);
        terrain.generatePlayerPositions(2, scene);

        //camera.position.z = 60;
        //camera.position.y = 15;

        gravity = new Force(new THREE.Vector3(0, -0.055, 0));

        projectiles = [];

    };


    /**
     * start rendering the scene
     */
    var start = function () {
        render();
        CameraManager.setTo(new THREE.Vector3(-100, 50, 0), new THREE.Vector3(50, 10, 50));
        setTimeout(function () {
            CameraManager.animateTo(new THREE.Vector3(-30, 15, 0), new THREE.Vector3(0, 0, 0));
        }, 250);
    };


    /**
     * adding player object representations to the scene
     */
    var addPlayer = function (player) {
        scene.add(player.obj);

        $(player).on("PROJECTILE_FIRED", function (e, projectile) {
            addProjectile(projectile);
        });

        // DEBUG / visual helper
        scene.add(player.indicator);
        scene.add(player.bbox);
    };


    var addProjectile = function (projectile) {
        projectiles.push(projectile);
        scene.add(projectile.obj);
    };


    function render() {
        requestAnimationFrame(render);

        var players = Game.getPlayers();

        if (projectiles && projectiles.length) {
            //TODO projectile terrain / player hit detection
            for (var p in projectiles) {
                projectiles[p].applyForce(gravity);
                projectiles[p].update();


                console.log("Players", players);
                for (var player in players) {
                    var hit = projectiles[p].checkPlayerCollision(players[player]);
                    if (hit != false) {
                        scene.remove(projectiles[p].obj);
                        projectiles = [];

                        // NOTE this just emulates the {} hit object, but does not correspond to a similar object as if
                        // returned from raycaster.intersectObject; could use the hit THREE.Vector3 and cast a ray from
                        // y = 100 down to get the actual hit (on the player object)
                        $(window).trigger("PROJECTILE_IMPACT", { hit: { point: hit } });
                        terrain.showImpact(hit, 0xff0000);

                        break;
                    }
                }

                if (projectiles[p] && projectiles[p].checkPlaneCollision(terrain.objForHittest)) {
                    terrain.showImpact(projectiles[p].getPlaneCollision()[0].point, 0x333333);

                    // TODO BAD practise to have this event trigger on window :/
                    // maybe need to make Scene a object after all
                    $(window).trigger("PROJECTILE_IMPACT", { hit: projectiles[p].getPlaneCollision()[0] });

                    scene.remove(projectiles[p].obj);
                    projectiles = [];

                    break;
                }
            }
        }

        CameraManager.update();
        renderer.render(scene, CameraManager.getCamera());
    }


    return {
        init: init,
        start: start,
        addPlayer: addPlayer,
        addProjectile: addProjectile,
        getTerrain: function () {
            return terrain;
        }
    };

})();
