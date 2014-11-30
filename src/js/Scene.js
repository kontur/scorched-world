/**
 * Main scene logic for rendering and organizing all the 3D parts of the game
 */
var Scene = (function () {

    var scene,
        renderer,
        projectiles,
        terrain;


    /**
     * entry point for setting up the scene and renderer
     *
     * @param numPlayers int number of player positions to generate (max players)
     */
    var init = function (numPlayers) {
        scene = new THREE.Scene();

        CameraManager.init();
        scene.add(CameraManager.getCameraDolly());

        // debug camera:
        //CameraManager.debug(true);
        //scene.add(CameraManager.getDebugHelper());

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
        terrain.generatePlayerPositions(numPlayers, scene);

        gravity = new Force(new THREE.Vector3(0, -0.055, 0));


        // TMP debug helper
        //scene.add(new THREE.AxisHelper(100));

        projectiles = [];

    };


    /**
     * start rendering the scene
     */
    var start = function () {
        render();
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
    };


    var addProjectile = function (projectile) {
        projectiles.push(projectile);
        scene.add(projectile.obj);
    };


    function render() {
        requestAnimationFrame(render);

        var players = Game.getPlayers();

        if (projectiles && projectiles.length) {
            for (var p in projectiles) {
                projectiles[p].applyForce(gravity);
                projectiles[p].update();

                for (var player in players) {
                    var playerHit = projectiles[p].checkPlayerCollision(players[player]);
                    if (playerHit != false) {
                        scene.remove(projectiles[p].obj);
                        projectiles = [];

                        // NOTE this just emulates the {} hit object, but does not correspond to a similar object as if
                        // returned from raycaster.intersectObject; could use the hit THREE.Vector3 and cast a ray from
                        // y = 100 down to get the actual hit (on the player object)
                        players[player].registerHit();
                        terrain.showImpact(playerHit, 0xff0000);
                        $(window).trigger("PROJECTILE_IMPACT", { point: playerHit });

                        break;
                    }
                }

                if (projectiles[p] && projectiles[p].checkPlaneCollision(terrain.objForHittest)) {

                    var planeHit = projectiles[p].getPlaneCollision();

                    if (!planeHit) {
                        // this can happen when a projectile falls "through" the terrain mesh or is shot from under it

                        //TODO low priority: instead of just using the projectile position, aquire a definite terrain
                        // hit position by taking the projectile position and casting a ray along the y axis to hit
                        // the terrain
                        planeHit = projectiles[p].position;
                    }

                    terrain.showImpact(planeHit, 0x333333);

                    // TODO BAD practise to have this event trigger on window :/
                    // maybe need to make Scene a object after all
                    $(window).trigger("PROJECTILE_IMPACT", { point: planeHit });

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
        },
        setRendererSize: function (w, h) {
            if (renderer) {
                renderer.setSize(w, h);
            }
        }
    };

})();
