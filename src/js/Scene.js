/**
 * Main scene logic for rendering and organizing all the 3D parts of the game
 */
var Scene = (function () {

    var scene,
        camera,
        renderer,
        projectiles = [],
        player;

    /**
     * entry point for setting up the scene and renderer
     */
    var init = function () {
        console.log("Scene.init()");

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 150);
        renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gamecanvas") });
			renderer.setSize(window.innerWidth, window.innerHeight);

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        directionalLight.position.set( 0, 1, 0 );
        scene.add( directionalLight );

        this.terrain = new Terrain();
        this.terrain.init();

        scene.add(this.terrain.mesh);
        scene.add(this.terrain.wires);

        this.terrain.generatePlayerPositions(2, scene);

        camera.position.z = 60;
        camera.position.y = 15;

        gravity = new Force(new THREE.Vector3(0, -0.015, 0));

        //setupMouseInteraction();
        //setupScrollInteraction();

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
    var addPlayer = function (playerObj) {
        scene.add(playerObj.getMesh());
        camera.lookAt(playerObj.position);

        $(playerObj).on("PROJECTILE_FIRED", function (e, projectile) {
            console.log("addPlayer, onPROJECTILE_FIRED", e, projectile);
            addProjectile(projectile);
        });
        player = playerObj;
    };


    var addProjectile = function (projectile) {
        console.log("Scene.addProjectile()", projectile);
        projectiles.push(projectile);
        scene.add(projectile.obj);
        console.log("Scene.addProjectile", projectiles.length);
    };


    function setupScrollInteraction () {
        $(window).on('mousewheel', function(e) {
            //console.log(e.originalEvent.wheelDelta);
            if (e.originalEvent.wheelDelta >= 0) {
                camera.position.z += 0.25;
            } else {
                camera.position.z -= 0.25;
            }
        });
    }


    function setupMouseInteraction() {
        $(window).mousemove(function (e) {
            var mouseX = e.originalEvent.pageX,
                mouseY = e.originalEvent.pageY,
                percentH = mouseX / window.innerWidth,
                percentV = mouseY / window.innerHeight;
            
            camera.position.y = 10 + (5 * percentV);
            camera.position.x = percentH * 20 - 10;
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        });
    }


    function render() {
        requestAnimationFrame(render);
        if (projectiles && projectiles.length) {
            for (p in projectiles) {
                projectiles[p].applyForce(gravity);
                projectiles[p].update();

                //TODO more complex projectile delete logic based on terrain bounding box
                if (projectiles[p].position.y < -10) {
                    scene.remove(projectiles[p].obj);
                    //TODO don't just empty the array, but pluck this projectile, in case there later are more than 1
                    projectiles = [];
                }
            }
        }
        renderer.render(scene, camera);
    }


    return {
        init: init,
        start: start,
        addPlayer: addPlayer,
        terrain: function () {
            return terrain;
        },
        addProjectile: addProjectile
    };

})();
