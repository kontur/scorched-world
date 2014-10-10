
var Scene = (function () {


    var scene,
        camera,
        renderer;

    var cube;


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

        /*
        var geometry = new THREE.BoxGeometry(10, 10, 10);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        cube = new THREE.Mesh( geometry, material );
        scene.add( cube );
        */

        this.terrain = new Terrain();
        this.terrain.init();

        scene.add(this.terrain.mesh);
        scene.add(this.terrain.wires);

        this.terrain.generatePlayerPositions(2, scene);

        camera.position.z = 40;

        setupMouseInteraction();
        setupScrollInteraction();
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
        console.log(playerObj.getMesh().position);
        scene.add(playerObj.getMesh());
    }


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

            //console.log(percentH, percentV);
            
            camera.position.y = 10 + (5 * percentV);
            //camera.rotation.x = -percentV;
            camera.position.x = percentH * 20 - 10;

            camera.lookAt(new THREE.Vector3(0, 0, 0));
            //camera.position.z = 25;
        });
    }


    function render() {
        //cube.rotation.y += 0.01;
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }


    return {
        init: init,
        start: start,
        addPlayer: addPlayer,
        terrain: function () {
            return terrain;
        }
    };

})();
