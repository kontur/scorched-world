/**
 * Main scene logic for rendering and organizing all the 3D parts of the game
 */
var Scene = (function () {

    var scene,
        camera,
        renderer,
        projectiles,
        player,
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
    var addPlayer = function (playerObj) {
        scene.add(playerObj.obj);

        //camera.translateX(playerObj.position.x + 0);
        //camera.translateZ(playerObj.position.z + 0);
        //camera.position.y = 25;
        //camera.lookAt(playerObj.position);


        $(playerObj).on("PROJECTILE_FIRED", function (e, projectile) {
            addProjectile(projectile);
        });
        player = playerObj;


        // DEBUG
        scene.add(playerObj.indicator);
        console.log("addPlayer", playerObj.indicator);
    };


    var addProjectile = function (projectile) {
        projectiles.push(projectile);
        scene.add(projectile.obj);
    };


    function render() {
        requestAnimationFrame(render);

        if (projectiles && projectiles.length) {
            //TODO projectile terrain / player hit detection
            for (p in projectiles) {
                projectiles[p].applyForce(gravity);
                projectiles[p].update();


                if (projectiles[p].checkPlaneCollision(terrain.objForHittest)) {
                    terrain.showImpact(projectiles[p].getPlaneCollision()[0]);
                    scene.remove(projectiles[p].obj);
                    projectiles = [];
                }

                //TODO more complex projectile delete logic based on terrain bounding box
                //if (projectiles[p].position.y < -10) {
                //    scene.remove(projectiles[p].obj);
                //    //TODO don't just empty the array, but pluck this projectile, in case there later are more than 1
                //    projectiles = [];
                //}
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
