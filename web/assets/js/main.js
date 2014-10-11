/*!  - v - 2014-10-11
* Copyright (c) 2014 Johannes Neumeier; Licensed  */

var Force = function (direction) {
    this.direction = direction;
};

Force.prototype = {

};


function Player() {

}

Player.prototype = {

    position: null, // Vector3
    mesh: null, // Three mesh
    direction: null,

    init: function () {
        var geometry = new THREE.IcosahedronGeometry(1, 0);
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

        this.obj.translateX(v3.x);
        this.obj.translateY(v3.y);
        this.obj.translateZ(v3.z);
    },

    getMesh: function () {
        return this.obj;
    },

    fire: function () {
        var projectile = new Projectile();
        console.log("Player.fire()", this.position);
        projectile.direction = new THREE.Vector3(0.5, 0.5, 0);
        projectile.mass = 0.011;
        projectile.setPosition(this.position);
        return projectile;
    }
};

function HumanPlayer() {
    Player.call(this);
}

HumanPlayer.prototype = new Player();
HumanPlayer.constructor = HumanPlayer;


var Projectile = function () {
    var geometry = new THREE.SphereGeometry(0.25, 4, 4);
    var material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    var mesh = new THREE.Mesh(geometry, material);

    this.id = Math.round(Math.random() * 100000);

    this.mass = 0.1;
    this.direction = new THREE.Vector3(0, 0, 0);
    this.position = new THREE.Vector3(0, 0, 0);

    //TODO implement drag factor into update
    this.drag = 0.01;

    this.obj = new THREE.Object3D();
    this.obj.add(mesh);
    this.obj.position = new THREE.Vector3(0, 0, 0);
    console.log("Projectile", this.obj.position);
};

Projectile.prototype = {
    applyForce: function (force) {
        this.direction = this.direction.add(force.direction.multiplyScalar(1 + this.mass));
    },

    setPosition: function (position) {
        this.position = position;
    },

    update: function () {
        this.position = this.position.add(this.direction);

        //console.log("Projectile.update()", this.id, this.position, this.obj.position);

        var move = new THREE.Vector3().subVectors(this.position, this.obj.position);
        this.obj.translateX(move.x);
        this.obj.translateY(move.y);
        this.obj.translateZ(move.z);
    }
};

var Scene = (function () {


    var scene,
        camera,
        renderer,
        projectiles = [];

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

        gravity = new Force(new THREE.Vector3(0, -0.015, 0));

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
        scene.add(playerObj.getMesh());
    };


    var addProjectile = function (projectile) {
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

    var i = 0;
    function render() {
        requestAnimationFrame(render);
        if (projectiles && projectiles.length) {
            for (p in projectiles) {
                projectiles[p].applyForce(gravity);
                projectiles[p].update();
            }
            if (i > 200) {
                projectiles.pop();
            } else {
                i++;
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


Terrain = function() {

    var geometry,
        material,
        width = 100,
        height = 100,
        widthSegments = 30,
        heightSegments = 30;


    //init();

    /**
     * generate a basic level terrain
     *
     * @returns {THREE.Mesh}
     */
    var init = function () {
        geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
        for (var v = 0; v < geometry.vertices.length; v++) {
            geometry.vertices[v].z += Math.random() * 2;
            geometry.vertices[v].x += Math.random() - 0.5;
            geometry.vertices[v].y += Math.random() - 0.5;
        }
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        geometry.verticesNeedUpdate = true;
        material = new THREE.MeshDepthMaterial();

        this.mesh = new THREE.Mesh(geometry, material);
        this.wires = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff66, wireframe: true, wireframeLinewidth: 2.5 }));

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
    };


    return {
        init: init,
        generatePlayerPositions: generatePlayerPositions
    };

};

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

    player1 = new HumanPlayer();
    //player2 = new Player();

    player1.init();
    //player2.init();

    player1.setPosition(Scene.terrain.playerPositions[0]);
    //player2.setPosition(Scene.terrain.playerPositions[1]);

    Scene.addPlayer(player1);
    //Scene.addPlayer(player2);


    setTimeout(function () {

        Scene.addProjectile(player1.fire());

    }, 1000);

});
