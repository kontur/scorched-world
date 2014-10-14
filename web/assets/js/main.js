/*!  - v - 2014-10-14
* Copyright (c) 2014 Johannes Neumeier; Licensed  */
var CameraManager = (function () {

    var camera;
    var lookAt;

    var targetPosition;
    var targetLookAt;


    var init = function () {
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 150);
    };


    var animateTo = function (position, _lookAt) {
        //console.log("CameraManager.animateTo", position, _lookAt);
        targetPosition = position;
        targetLookAt = _lookAt;
        lookAt = _lookAt;
    };


    var setTo = function (position, _lookAt) {
        var diff = position.clone().sub(camera.position.clone());
        camera.applyMatrix(new THREE.Matrix4().setPosition(diff));
        camera.lookAt(_lookAt);

        lookAt = _lookAt;
    };


    var update = function () {
        if (camera.position && targetPosition) {
            var diff = targetPosition.clone().sub(camera.position.clone());
            diff.multiplyScalar(0.15);
            camera.applyMatrix(new THREE.Matrix4().setPosition(diff));
            camera.lookAt(lookAt);
        }
        if (lookAt != targetLookAt) {
            camera.lookAt(lookAt);
        }
    };


    //function setupScrollInteraction () {
    //    $(window).on('mousewheel', function(e) {
    //        //console.log(e.originalEvent.wheelDelta);
    //        if (e.originalEvent.wheelDelta >= 0) {
    //            camera.position.z += 0.25;
    //        } else {
    //            camera.position.z -= 0.25;
    //        }
    //    });
    //}
    //
    //
    //function setupMouseInteraction() {
    //    $(window).mousemove(function (e) {
    //        var mouseX = e.originalEvent.pageX,
    //            mouseY = e.originalEvent.pageY,
    //            percentH = mouseX / window.innerWidth,
    //            percentV = mouseY / window.innerHeight;
    //
    //        camera.position.y = 10 + (5 * percentV);
    //        camera.position.x = percentH * 20 - 10;
    //        camera.lookAt(new THREE.Vector3(0, 0, 0));
    //    });
    //}
    return {
        init: init,
        animateTo: animateTo,
        setTo: setTo,
        update: update,

        getCamera: function () {
            return camera;
        }
    };

})();
var Force = function (direction) {
    this.direction = direction;
};

Force.prototype = {

};
var Game = (function () {

    var players;
    var currentTurn; // int from 0 - players.length identifying the current players turn


    /**
     * Start a new game with given players
     *
     * @param _players array of player objects
     */
    var start = function (_players) {
        players = _players;

        Scene.init();
        Scene.start();

        for (p in players) {
            players[p].init();
            players[p].setPosition(Scene.getTerrain().playerPositions[p]);
            Scene.addPlayer(players[p]);
        }

        currentTurn = 0;

        setTimeout(nextTurn, 1500);
    };


    function nextTurn() {
        console.log("----------------------------------");
        console.log("Game.nextTurn()", currentTurn, players[currentTurn].isHuman);

        $(window).on("PROJECTILE_IMPACT", updateDamage);
        var pos = players[currentTurn].position.clone();
        pos.x -= 15;
        pos.z -= 15;
        pos.y = 15;
        CameraManager.animateTo(pos, players[currentTurn].position);

        if (players[currentTurn].isHuman) {
            players[currentTurn].enableControls();
        } else {
            // TODO plenty of AI and animation logic
            players[currentTurn].autofire();
        }
    }


    function updateDamage() {
        console.log("Game.updateDamage()");
        $(window).off("PROJECTILE_IMPACT", updateDamage);

        // if no winner
        if (true) {
            if (players[currentTurn].isHuman) {
                players[currentTurn].disableControls();
            }
            currentTurn++;
            if (currentTurn >= players.length) {
                currentTurn = 0;
            }
            nextTurn();
        }
    }


    return {
        start: start,
        reset: start
    };
})();
function Player(options) {

    var defaults = {
        color: 0xffffff
    };

    this.options = applyOptions(options);
    function applyOptions(options) {
        //console.log("applyOptions", options);
        return $.extend(defaults, options);
    }

    this.position = null; // Vector3
    this.mesh = null; // Three mesh
    this.direction = null;
    this.indicator = null;

    this.fireForce = 0;
    this.fireButtonTimeout = null;

    this.init = function () {
        console.log("Player.init()", this.options.color);
        var geometry = new THREE.IcosahedronGeometry(1, 0);
        var material = new THREE.MeshPhongMaterial({ ambient: 0xffffff, color: this.options.color, specular: this.options.color, shininess: 10, shading: THREE.FlatShading });
        this.mesh = new THREE.Mesh(geometry, material);
        this.obj = new THREE.Object3D();

        var canonH = 2;
        var geo = new THREE.CylinderGeometry(0.15, 0.5, canonH);
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(0, canonH / 2, 0));

        var mat = new THREE.MeshPhongMaterial({ ambient: 0xff0000, color: 0x00ffff, specular: 0x0099ff, shininess: 30, shading: THREE.FlatShading });
        this.canon = new THREE.Mesh(geo, mat);

        this.obj.add(this.mesh);
        this.obj.add(this.canon);
        this.canon.rotateX(45 * Math.PI / 180);
        this.canon.rotationAutoUpdate;
    };


    /**
     * set the position of the player
     * @param vector3
     */
    this.setPosition = function (vector3) {
        this.position = vector3;

        this.obj.translateX(vector3.x);
        this.obj.translateY(vector3.y);
        this.obj.translateZ(vector3.z);

        var geom = new THREE.Geometry();
        geom.vertices.push(this.position);
        geom.vertices.push(new THREE.Vector3(this.position.x, 10, this.position.z));
        var mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.indicator = new THREE.Line(geom, mat);
    };


    /**
     * fire a new projectile form the player's current position and rotation
     *
     * triggers PROJECTILE_FIRED event
     *
     * @param force float 0-1
     *
     * TODO prevent multiple simultaneous projectiles in the air
     * TODO projectile mass has no effect
     */
    this.fire = function (force) {
        var projectile = new Projectile();

        console.log("Player.fire()", force);

        projectile.direction = this.getIndicator().multiplyScalar(force); //new THREE.Vector3(0.5, 0.5, 0);
        projectile.mass = 0.151;
        projectile.setPosition(this.position.clone());

        $(this).trigger("PROJECTILE_FIRED", projectile);
    };


    /**
     * manipulate the player's canon vertical angle
     * @param angleChange in radians
     */
    this.addAngle = function(angleChange) {
        // check the proposed change in angle for the canon is still within 90 deg up and 0 deg forward facing
        if (this.canon.rotation.x + angleChange > 0 && this.canon.rotation.x + angleChange < Math.PI / 2) {
            this.canon.rotateX(angleChange);
        }

        console.log("Player.addAngle()", this.canon.rotation.x);
        this.getIndicator();
    };


    /**
     * rotates the player canon horizontally
     * @param rotationChange in radians
     */
    this.addRotation = function(rotationChange) {
        // rotate the whole player object, not just the canon
        this.obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationChange);

        console.log("Player.addRotation", this.obj.rotation.y);
        this.getIndicator();
    };


    /**
     * Update the internal firing vector of the canon from object and canon rotations
     *
     * @returns {THREE.Vector3}
     */
    this.getIndicator = function (forceIndicator) {
        // extracting direction from object matrix: https://github.com/mrdoob/three.js/issues/1606

        if (!forceIndicator) {
            forceIndicator = 1;
        }

        // first extract the horizontal rotation of the main player object
        var rotationH = new THREE.Matrix4();
        rotationH = rotationH.extractRotation(this.obj.matrix);

        // store a separate vector for the horizonal direction x+z
        var directionH = new THREE.Vector3(0, 0, 1);
        directionH = directionH.applyMatrix4(rotationH);

        // get the canon rotation.y in a matrix
        var rotationV = new THREE.Matrix4();
        rotationV = rotationV.extractRotation(this.canon.matrix);

        // fix the rotation offset of the canon rail
        var rotationOffset = new THREE.Matrix4().makeRotationX(-Math.PI/4);
        
        // calculate the final firing position
        var direction = new THREE.Vector3(0, 1, 1);
        // fix the vertical offset
        direction = direction.applyMatrix4(rotationOffset);
        // apply the vertical rotation
        direction = direction.applyMatrix4(rotationV);
        // apply the horizontal rotation
        direction = direction.applyMatrix4(rotationH);


        // dev visualization only:
        var g = new THREE.Geometry();
        g.vertices.push(this.position);
        g.vertices.push(this.position.clone().add(direction.clone().multiplyScalar(1 + forceIndicator * 5)));
        var m = new THREE.LineBasicMaterial({ color: "rgb(" + Math.round(forceIndicator * 255) + ", 0, 0)" });
        this.indicator.add(new THREE.Line(g, m));

        while (this.indicator.children.length > 5) {
            this.indicator.children.shift();
        }

        //directionH = directionH.multiplyScalar(5);
        //var geom = new THREE.Geometry();
        //geom.vertices.push(this.position);
        //geom.vertices.push(this.position.clone().add(directionH));
        //var mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
        //this.indicator.add(new THREE.Line(geom, mat));

        return direction;
    }
}


/**
 * Player subclass with input interaction for aiming and firing
 *
 * @constructor new HumanPlayer()
 */
function HumanPlayer(options) {
    console.log("HumanPlayer()");

    var that = this;
    this.isHuman = true;
    this.controlsEnabled = false;
    this.enableControls = function () {
        this.controlsEnabled = true;
        console.log("Player controls enabled");
    };
    this.disableControls = function () {
        this.controlsEnabled = false;
        console.log("Player controls disabled");
    };

    Player.call(this, options);

    setupControls();


    function setupControls () {
        console.log("HumanPlayer.setupControls()");
        $(window).on("keydown", onKeyDown);
        $(window).on("keyup", onKeyUp);
    }


    /**
     * TODO improve rotating by adding additive rotation speed when key pressed continuously
     */
    function onKeyDown(e) {
        if (!that.controlsEnabled) {
            return false;
        }

        var rotationStep = 5;

        switch (e.keyCode) {
            // arrow up
            case 40:
                that.addAngle(rotationStep * (Math.PI / 180));
                break;

            // arrow down
            case 38:
                that.addAngle(-rotationStep * (Math.PI / 180));
                break;

            // arrow left
            case 39:
                that.addRotation(-rotationStep * (Math.PI / 180));
                break;

            // arrow right
            case 37:
                that.addRotation(rotationStep * (Math.PI / 180));
                break;

            // space bar
            case 32:
                if (!that.fireButtonTimeout) {
                    that.fireButtonTimeout = setTimeout(fireButtonDown, 5);
                }
                break;

            default:
                break;
        }
    }

    function onKeyUp(e) {
        if (!that.controlsEnabled) {
            return false;
        }

        if (e.keyCode == "32") {
            // spacebar was released

            clearTimeout(that.fireButtonTimeout);
            that.fire(that.fireForce / 100);
            that.fireForce = 0;
            that.fireButtonTimeout = false;
        }
    }


    function fireButtonDown() {
        that.fireForce++;
        if (that.fireForce > 100) {
            that.fireForce = 100;
        }
        that.fireButtonTimeout = setTimeout(fireButtonDown, 5);
        that.getIndicator(Math.min(100, that.fireForce) / 100);
    }
}

HumanPlayer.prototype = new Player();
HumanPlayer.constructor = HumanPlayer;


/**
 *
 * @param options
 * @constructor
 *
 * TODO player AI
 * TODO player AI difficulty
 * TODO automated aiming and firing animations
 */
function AIPlayer(options) {
    Player.call(this, options);

    this.isHuman = false;

    var shots = [];

    this.autofire = function () {
        var that = this;
        setTimeout(function () {

            var shot = that.guessShot([], [], []);

            that.animateTo(shot.rotationH, shot.rotationV);

            setTimeout(function () {
                that.fire(shot.force);

                $(window).on("PROJECTILE_IMPACT", function (e, data) {
                    // get closest other player to impact
                    console.log("AIPlayer.autofire", data);
                    var closest= Scene.getTerrain().closestOtherPlayer(data.hit.point, that.position);
                    shot.closest = data.hit.point.sub(closest);
                });
                console.log("shot:", shot);

                shots.push(shot);

                that.getIndicator();
            }, 500);

        }, 1000);
    };


    this.animateTo = function (rotationH, rotationV) {
        this.canon.rotateX(rotationV);
        this.obj.rotateY(rotationH);
    };


    this.guessShot = function (rotationHLimits, rotationVLimits, forceLimits) {

        var rotationH = Math.random() * Math.PI;
        var rotationV = Math.random() * Math.PI / 2 - Math.PI / 4;
        var force = Math.random() * 0.5 + 0.5;

        return {
            rotationH: rotationH,
            rotationV: rotationV,
            force: force
        };
    };

};

AIPlayer.prototype = new Player();
AIPlayer.constructor = AIPlayer;
var Projectile = function () {
    var geometry = new THREE.SphereGeometry(0.25, 4, 4);
    var material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    var mesh = new THREE.Mesh(geometry, material);

    // collision check helpers
    // make reusable raycasting objects so they don't have to be recreated every frame
    var lastResult = null;
    var raycasterDirection = new THREE.Vector3(0, -1, 0);
    var raycaster = new THREE.Raycaster(this.position, raycasterDirection);

    this.mass = 0.1;
    this.direction = new THREE.Vector3(0, 0, 0);
    this.position = new THREE.Vector3(0, 0, 0);

    //TODO implement drag factor into update
    this.drag = 0.01;

    this.obj = new THREE.Object3D();
    this.obj.add(mesh);
    this.obj.position = new THREE.Vector3(0, 0, 0);



    /**
     * Apply @param force to this projectiles direction
     *
     * @param force
     */
    this.applyForce = function (force) {
        this.direction = this.direction.add(force.direction.clone().multiplyScalar(1 + this.mass));
    };


    /**
     * Explicitly set the projectiles position
     *
     * NOTE: only after adding mesh to scene
     *
     * @param position
     */
    this.setPosition = function (position) {
        this.position = position;
    };


    /**
     * Move the projectile after applying movement momentum
     */
    this.update = function () {
        this.position = this.position.add(this.direction);
        var move = new THREE.Vector3().subVectors(this.position, this.obj.position);
        this.obj.translateX(move.x);
        this.obj.translateY(move.y);
        this.obj.translateZ(move.z);
    };


    this.checkPlaneCollision = function (plane) {
        // update the raycaster position to cast a ray straight down from the current projectile position
        raycaster.set(this.position, raycasterDirection);

        // if the ray hit something the projectile is still above the surface, no hit, but store the lastResult
        var test = raycaster.intersectObject(plane);

        console.log("check", test, lastResult);

        if (test.length) {
            lastResult = test;

            if (lastResult[0].point.x == NaN) {
                console.log("--overwriting NaN point");
                lastResult[0].point = this.position;
            }
            return false;
        } else {
            console.log("checkPlaneCollision no intersect", lastResult);
            if (!lastResult) {
                lastResult = [{ point: this.position }];
            }
            return true;
        }
    };


    this.getPlaneCollision = function () {
        console.log("Projectile.getPlaneCollision", lastResult);
        return lastResult ? lastResult : false;
    };
};

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

                    // TODO BAD practise to have this event trigger on window :/
                    // maybe need to make Scene a object after all
                    $(window).trigger("PROJECTILE_IMPACT", { hit: projectiles[p].getPlaneCollision()[0] });

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

Terrain = function() {

    var width = 400,
        height = 400,
        widthSegments = 60,
        heightSegments = 60,
        geometry, // the main plain

        // area of the main plain that has actual game stuff happening in it
        widthArea = 80,
        heightArea = 80,

        shaded,
        wire,
        effects;


    //init();

    /**
     * generate a basic level terrain
     *
     * @returns {THREE.Mesh}
     */
    this.init = function () {
        geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
        for (var v = 0; v < geometry.vertices.length; v++) {
            geometry.vertices[v].z += Math.random() * 2;
            geometry.vertices[v].x += Math.random() - 0.5;
            geometry.vertices[v].y += Math.random() - 0.5;
        }
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        geometry.verticesNeedUpdate = true;
        var material = new THREE.MeshDepthMaterial();

        this.obj = new THREE.Object3D();

        shaded = new THREE.Mesh(geometry, material);
        shaded.userData = { name: "shaded" };
        wire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true, wireframeLinewidth: 0.5 }));
        wire.userData.name = "wire";
        effects = new THREE.Object3D();
        effects.userData.name = "effects";

        this.obj.add(shaded);
        this.obj.add(wire);
        this.obj.add(effects);

        // provide public reference to an object to be used for hittests
        // this could conceivably be a simplified geometry of the rendered geometry but for now is just a reference
        // to var shaded
        //this.objForHittest = Utils.Object3DgetChildByName(this.obj, "shaded");
        this.objForHittest = shaded;
    };


    /**
     * Generates new possible positions for the players to be placed at
     *
     * @param num
     * @returns {Array|*|Terrain.playerPositions}
     */
    this.generatePlayerPositions = function (num) {
        var pos = [];

        // generate new positions for num players
        for (var i = 0; i < num; i++) {
            var found = false,
                position;

            // until we found a suitable position, generate new ones
            while (!found) {
                position = getRandomPlayerPosition();

                // check the player is in the main area of the level
                if (position.x > -widthArea / 2 && position.x < widthArea / 2 &&
                    position.z > -heightArea / 2 && position.z < heightArea / 2)
                {
                    // asume this is an ok position, but
                    found = true;

                    // a) check there is no duplicates, i.e. the position has not yet been assigned for another player
                    for (var p = 0; p < pos.length; p++) {
                        if (pos[p] == position) {
                            found = false;
                        }
                    }

                    //TODO and b) make sure there is minimumDistance (percent of main area) between the players
                }
            }
            pos.push(position);
        }
        this.playerPositions = pos;

        return this.playerPositions;
    };

    // private helper function
    function getRandomPlayerPosition() {
        return geometry.vertices[Math.floor(Math.random() * geometry.vertices.length)];
    };


    this.closestOtherPlayer = function (position, excludePosition) {
        console.log("Terrain.closestOtherPlayer", position, excludePosition, position.x);

        if (isNaN(position.x)) {
            return false;
        }

        // TODO work around this magic number
        var closest = 99999999;
        var closestPos = null;
        for (pos in this.playerPositions) {
            if (this.playerPositions[pos] != excludePosition) {
                var distance = position.distanceTo(this.playerPositions[pos]);
                if (distance < closest) {
                    closestPos = this.playerPositions[pos];
                }
            }
        }

        if (!closestPos) {
            throw(new Error("Terrain.closestOtherPlayer() could not determine closest player to ", position));
        }

        return {
            position: closestPos,
            distance: closest
        };
    };


    /**
     * Visualize the impact made by a projectile hitting the ground at @param intersectResult
     *
     * @param intersectResult - Object returned by THREE.Raycaster.intersectObject
     */
    this.showImpact = function (intersectResult) {
        var geometry = new THREE.SphereGeometry(1, 4, 4);
        geometry.applyMatrix(new THREE.Matrix4().setPosition(intersectResult.point));
        var material = new THREE.MeshBasicMaterial({ color: 0xff3300 });
        var mesh = new THREE.Mesh(geometry, material);
        Utils.Object3DgetChildByName(this.obj, "effects").add(mesh);
    }

};

var UI = (function () {

    var init = function () {
        $(window).on("resize", onResize);
        onResize();
        $("#ui-reset-scene").on("click", resetScene);
        $("#ui-start-game").on("click", startGame);
    };

    //TODO this resizing doesn't really work yet as intended; it stretches the scene
    function onResize() {
        var w = $(window).width();
        var h = $(window).height();

        $("#gamecanvas").css("width", w + "px");
        $("#gamecanvas").css("height", h + "px");
    }


    function resetScene() {
        Game.reset();
    }

    function startGame() {
        var players = [
            //new HumanPlayer({ color: 0x00ff00, name: "Foobar"}),
            new AIPlayer({ color: 0xff00ff, name: "Foobar" }),
            new AIPlayer({ color: 0xff6600, difficulty: 0, name: "Robert the Robot" })
        ];

        Game.start(players);
    }

    return {
        init: init
    };

})();

var Utils = (function () {

    // public methods
    return {

        /**
         * Helper to find a specific child of a THREE.Object3D by it's userData.name attribute
         *
         * @param object3d is a THREE.Object3D
         * @param name String
         * @returns THREE.Object3d or false
         *
         * TODO implement recursive search and recursive depth
         */
        Object3DgetChildByName: function (object3d, name) {
            console.log(object3d, name);
            for (child in object3d.children) {
                if (object3d.children[child].userData && object3d.children[child].userData.name &&
                    object3d.children[child].userData.name == name)
                {
                    return object3d.children[child];
                }
            }
            return false;
        }
    };
}());

$(function() {

    UI.init();

});
