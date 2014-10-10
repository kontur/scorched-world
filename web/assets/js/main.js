/*!  - v - 2014-10-10
* Copyright (c) 2014 Johannes Neumeier; Licensed  */


function Player() {

}

Player.prototype = {

    position: null, // Vector3
    mesh: null, // Three mesh
    direction: null,

    init: function () {
        var geometry = new THREE.IcosahedronGeometry(1, 0);
        //var material = new THREE.MeshBasicMaterial({ color: 0xff3300, wireframe: true });
        var material = new THREE.MeshPhongMaterial({ ambient: 0xff0000, color: 0xff3300, specular: 0x0099ff, shininess: 30, shading: THREE.FlatShading });
        this.mesh = new THREE.Mesh(geometry, material);
        this.obj = new THREE.Object3D();

        var geo = new THREE.CylinderGeometry(0.25, 0.5, 4);
        var mat = new THREE.MeshPhongMaterial({ ambient: 0xff0000, color: 0x00ffff, specular: 0x0099ff, shininess: 30, shading: THREE.FlatShading });
        this.canon = new THREE.Mesh(geo, mat);

        this.obj.add(this.mesh);
        this.obj.add(this.canon);
    },

    setPosition: function (v3) {
        console.log("Player.setPosition", v3);
        this.position = v3;
        //this.mesh.geometry.position = v3;
        //console.log(this.mesh);

        this.obj.translateX(v3.x);
        this.obj.translateY(v3.y);
        this.obj.translateZ(v3.z);

        //var m = new THREE.Matrix4().makeTranslation(v3);
        //this.mesh.geometry.applyMatrix(m);
        //this.mesh.geometry.verticesNeedUpdate;

        //this.mesh.geometry.position = v3;
        //this.mesh.translateX(this.position.x);
        ////this.mesh.translateY(this.position.y);
        //this.mesh.translateZ(this.position.y);
        //this.mesh.translateY(2);
    },

    getMesh: function () {
        return this.obj;
    }
};



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


Terrain = function() {

    var geometry,
        material,
        width = 100,
        height = 100,
        widthSegments = 10,
        heightSegments = 10;


    //init();

    /**
     * generate a basic level terrain
     *
     * @returns {THREE.Mesh}
     */
    var init = function () {
        geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

        for (var v = 0; v < geometry.vertices.length; v++) {
            geometry.vertices[v].z += Math.random() * 3;
            geometry.vertices[v].x += Math.random() - 0.5;
            geometry.vertices[v].y += Math.random() - 0.5;
        }
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

        geometry.verticesNeedUpdate = true;

        material = new THREE.MeshDepthMaterial();

        this.mesh = new THREE.Mesh(geometry, material);
        this.wires = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff66, wireframe: true, wireframeLinewidth: 2.5 }));
        //this.mesh.rotation.x = -Math.PI / 2;

        //this.playerPositions = generatePlayerPositions(2);

        return this;
    };

    var generatePlayerPositions = function (num, scene) {
        var pos = [];
        for (var i = 0; i < num; i++) {
            pos.push(getRandomPlayerPosition());
        }
        this.playerPositions = pos;
    };

    var getRandomPlayerPosition = function () {
        return geometry.vertices[Math.floor(Math.random() * geometry.vertices.length)];
    }


    return {
        init: init,
        generatePlayerPositions: generatePlayerPositions
    };

}

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
