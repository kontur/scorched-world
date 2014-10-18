/*!  - v - 2014-10-18
* Copyright (c) 2014 Johannes Neumeier; Licensed  */
var CameraManager = (function () {

    // all the objects for the camera
    // the camera is constructed via several dollies to allow independent axis rotation
    //
    // the main cameraDolly is located at 0,0 of the targetPosition and can be user-rotated around the targetPosition
    //
    // attached to it is a cameraDollyHorizontal, which sets the camera lookAt direction
    //
    // attached to it is a cameraVerticalDolly, which allows for the vertical camera rotation to be set by the user and
    // is situated with an offset behind the targetPosition (so it looks at it)
    //
    // the camera object is the three.js camera itself, which does not move at all and is rotated on init to line up
    // with the other dollies' lookAt along the their z-axis
    var camera;
    var cameraDolly;
    var cameraDollyVertical;
    var cameraDollyHorizontal;

    var targetPosition = null;
    var targetLookAt;
    var targetRotationH = null;

    var controlsEnabled = false;

    // debug helper objects and flags
    var debug = false;
    var arrowHelper;
    var dollyHelper;
    var dollyHorizontalHelper;
    var debugHelper;


    // PUBLIC METHODS
    // **************

    var init = function () {
        cameraDolly = new THREE.Object3D();
        cameraDollyVertical = new THREE.Object3D();
        cameraDollyHorizontal = new THREE.Object3D();

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 150);
        // rotate camera once so that it aligns with the cameraDollyHorizontal's .lookAt direction
        camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);

        cameraDollyVertical.translateZ(-25);
        cameraDollyVertical.add(camera);
        cameraDollyVertical.add(new THREE.AxisHelper(15));

        cameraDollyHorizontal.add(cameraDollyVertical);
        cameraDollyHorizontal.matrixAutoUpdate = true;

        cameraDolly.add(cameraDollyHorizontal);
        cameraDolly.add(new THREE.AxisHelper(25));

        setupCameraControls();

        // listen for events informing of a projectile mid-air so the camera can follow it in its flight path
        $(window).on("PROJECTILE_MOVE", function (e, data) {
            targetLookAt = data.position;
            targetRotationH = 0;
        });

        // init this debugHelper either way
        debugHelper = new THREE.Object3D();

    };


    /**
     * Function to animate to a position, lookAt value and user rotation value
     *
     * @param position
     * @param lookAt
     * @param _targetRotationH
     */
    var animateTo = function (position, lookAt, _targetRotationH) {
        targetPosition = position;
        targetLookAt = lookAt;
        targetRotationH = _targetRotationH !== null ? _targetRotationH : 0;
    };


    /**
     * Function to explicitly set position and lookAt without animation
     *
     * @param position
     * @param lookAt
     */
    var setTo = function (position, lookAt) {
        var diff = position.clone().sub(cameraDolly.position.clone());
        cameraDolly.applyMatrix(new THREE.Matrix4().setPosition(diff));
        cameraDollyHorizontal.lookAt(lookAt);

        targetLookAt = lookAt;
        targetPosition = position;
    };


    /**
     * Update the camera position
     *
     * TODO gradual and tweened rotation changes
     */
    var update = function () {

        // update the cameraDolly position when it's not a targetPosition and the cameraDolly is in the scene
        if (cameraDolly.position && targetPosition !== null) {
            var diff = targetPosition.clone().sub(cameraDolly.position.clone());

            // only update position difference is beyond a certain threshold to avoid minimal decimal precision
            // repositioning
            if (diff.length() > 0.1) {
                // move in 15% steps to the target
                diff.multiplyScalar(0.15);

                cameraDolly.applyMatrix(new THREE.Matrix4().setPosition(diff));
                cameraDolly.updateMatrix();
            } else {
                // set targetPosition to "reached" thus avoid the calculations of this loop altogether until no
                // new targetPosition gets set for better performance
                targetPosition = null;
            }
        }


        // visually highlight the lookAt target in debug mode
        if (debug && targetLookAt) {
            cameraDollyHorizontal.lookAt(targetLookAt);
            debugHelper.remove(arrowHelper);
            arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), targetLookAt.clone(), 10, 0xffff00);
            debugHelper.add(arrowHelper);
        }


        // update the camera rotations if any are set
        if (cameraDolly.rotation && targetRotationH !== null) {
            var rotationDifference = cameraDolly.rotation.y - targetRotationH;
            
            // for values beyond 180 degrees calculate negative (shorter) angle
            if (rotationDifference > Math.PI) {
                rotationDifference = -(Math.PI * 2 - rotationDifference);
            }

            // stop rotation animation when the target angle is as good as reached
            if (Math.abs(rotationDifference) < 0.1) {
                // set null to prevent entering this whole rotation logic on next update()
                targetRotationH = null;
            } else {
                // otherwise approach target rotation angle
                // TODO replace 0.1 with dynamic accelarerated / eased value
                cameraDolly.rotation.y += 0.1;
                //cameraDolly.rotation.y += rotationDifference * 0.15;
            }
        }
    };


    var enableCameraControl = function () {
        controlsEnabled = true;
    };


    var disableCameraControl = function () {
        controlsEnabled = false;
    };


    var debugMode = function (bool) {
        debug = bool;
        if (debug) {
            var g = new THREE.BoxGeometry(2, 2, 2);
            var m = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
            dollyHelper = new THREE.Mesh(g, m);
            cameraDolly.add(dollyHelper);

            var geom = new THREE.BoxGeometry(5, 5, 5);
            var mat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
            dollyHorizontalHelper = new THREE.Mesh(geom, mat);
            cameraDollyHorizontal.add(dollyHorizontalHelper);
        }
    };


    // PRIVATE METHODS
    // ***************


    function setupCameraControls() {
        $(window).on("keydown", onKeyDown);
    }


    function onKeyDown(e) {
        var rotationSpeed = 0.051;
        switch (e.keyCode) {
            // d
            case 68:
                rotate("x", -rotationSpeed);
                break;

            // a
            case 65:
                rotate("x", rotationSpeed);
                break;

            // w
            case 87:
                rotate("y", -rotationSpeed);
                break;

            // s
            case 83:
                rotate("y", rotationSpeed);
                break;

            default:
                break;
        }
    }


    /**
     * Rotate the camera to either look up an down at current focus point or rotate around the current focus point
     * 
     * @param axis
     * @param rotation
     * 
     * TODO speed up / ease in out
     */
    function rotate(axis, rotation) {
        if (axis == "x") {
            // rotate the camera along the local y axis around its focal point
            cameraDolly.rotation.y += rotation;
            
            // clamp assigned value to 0 - Math.PI * 2 
            if (cameraDolly.rotation.y > Math.PI * 2) {
                cameraDolly.rotation.y -= Math.PI * 2;
            } else if (cameraDolly.rotation.y < 0) {
                cameraDolly.rotation.y += Math.PI * 2;
            }
            cameraDolly.updateMatrix();
        } else if (axis == "y") {
            // rotate the camera axis along local x-axis (up/down)
            cameraDollyVertical.rotation.x += rotation;
            cameraDollyVertical.updateMatrix();
        }
    }


    // interface
    return {
        init: init,
        animateTo: animateTo,
        setTo: setTo,
        update: update,

        enableControls: enableCameraControl,
        disableControls: disableCameraControl,

        getCamera: function () {
            return camera;
        },
        getCameraDolly: function () {
            return cameraDolly;
        },
        getDebugHelper: function () {
            return debugHelper;
        },

        debug: debugMode
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

        Scene.init(_players.length);
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

        // TODO instead of x,z -15 those should be behind the player FACING THE DIRECTION of other players (or previous
        // set player camera position
        //pos.x -= 15;
        //pos.z -= 15;
        pos.y = 35;

        // TODO eventually store each player's own last camera rotation and set it here when their turn starts
        CameraManager.animateTo(pos, players[currentTurn].position, 0);

        if (players[currentTurn].isHuman) {
            players[currentTurn].enableControls();
            CameraManager.enableControls();
        } else {
            // TODO plenty of AI and animation logic
            players[currentTurn].autofire();
        }
    }


    function updateDamage() {
        console.log("Game.updateDamage()");
        $(window).off("PROJECTILE_IMPACT", updateDamage);

        var alive = playersAlive();

        // if no winner
        if (alive.length > 1) {
            if (players[currentTurn].isHuman) {
                players[currentTurn].disableControls();
                CameraManager.disableControls();
            }
            currentTurn++;
            if (currentTurn >= players.length) {
                currentTurn = 0;
            }

            setTimeout(nextTurn, 1500);
        } else {
            console.log("WIN FOR PLAYER ", alive[0]);
        }
    }


    function playersAlive() {
        var alivePlayers = [];
        for (var p in players) {
            if (players[p].life > 0) {
                alivePlayers.push(players[p]);
            }
        }
        return alivePlayers;
    }


    return {
        start: start,
        reset: start,
        getPlayers: function () {
            return players;
        }
    };
})();
function AIPlayer(options) {
    Player.call(this, options);

    this.isHuman = false;

    var shots = [];

    this.autofire = function () {
        var that = this;
        setTimeout(function () {

            //console.log("shots", shots);

            var closestDistance = null;
            var closestShot = null;
            if (shots.length) {
                for (shot in shots) {
                    //console.log("SHOT CLOSEST:", shots[shot].distance);
                    if (closestDistance === null || shots[shot].distance < closestDistance) {
                        closestShot = shots[shot];
                    }
                }
            }

            var shot = that.guessShot(closestShot);

            that.animateTo(shot.rotationH, shot.rotationV);

            setTimeout(function () {
                that.fire(shot.force);

                $(window).on("PROJECTILE_IMPACT", function (e, data) {
                    // get closest other player to impact
                    var closest = Scene.getTerrain().closestOtherPlayer(data.point, that.position);
                    //console.log("closest", closest);
                    shot.distance = closest.distance;
                    shot.hit = closest.position;
                    shots.push(shot);
                    //console.log(shot);
                    $(window).off("PROJECTILE_IMPACT");
                });

                that.getIndicator();
            }, 500);

        }, 1000);
    };


    //TODO make this an actual animation, not just a plain set operation
    this.animateTo = function (rotationH, rotationV) {
        this.canon.rotation.x = rotationV;
        this.obj.rotation.y = rotationH;

        this.bbox.update();

        this.checkTangent(Scene.getTerrain().objForHittest);
    };


    //TODO take the distance from this player to target, then cycle through provious shots, take the one with closest distance
    // as a basis and then apply a random factor to the settings of that shot; the closer the distance in percent
    // the less random variation should go into the next shot; i.e. the closer it is already, the more circling to the
    // accurate position will happen
    this.guessShot = function (shot) {
        var rotationH, rotationV, force;

        if (shot !== null) {
            //TODO factor of randomness based on a) difficulty and b) percentual distance to target of previous shot
            // (shot.distance)

            var closestOtherPlayerToBestHit = Scene.getTerrain().closestOtherPlayer(shot.hit, this.position);
            //console.log("player to hit: ", closestOtherPlayerToBestHit);

            var distanceToPlayer = this.position.distanceTo(closestOtherPlayerToBestHit.position);
            console.log("distance to next player", distanceToPlayer);
            console.log("---RATIO shot distance to distance to player", shot.distance / distanceToPlayer);

            var factor = Math.max(shot.distance / distanceToPlayer, 0.01);

            var randomH = Math.random() * Math.PI / 0.5 - Math.PI / 1 * factor * factor;
            var randomV = Math.random() * Math.PI / 2 - Math.PI / 4 * factor * factor;
            console.log("RANDOM", shot, randomH, randomV);
            rotationH = shot.rotationH + randomH;
            rotationV = shot.rotationV + randomV;
            force = shot.force + Math.random() / 4;
            //rotationH = shot.rotationH;
            //rotationV = shot.rotationV;
            //force = shot.force;
        } else {
            //TODO even without a reference shot, the first shot should, depending on difficulty level, still somewhat
            // aim at the direction of another player
            rotationH = Math.random() * Math.PI;
            rotationV = Math.random() * Math.PI / 2 - Math.PI / 4;
            force = Math.random() * 0.5 + 0.5;
        }

        //TODO clamp values to allowed orientations and forces - vertify these work as intended
        rotationH = THREE.Math.clamp(rotationH, 0, Math.PI * 2);
        rotationV = THREE.Math.clamp(rotationV, 0.25, Math.PI / 4); //?!
        force = THREE.Math.clamp(force, 0.1, 1);

        return {
            rotationH: rotationH,
            rotationV: rotationV,
            force: force
        };
    };

};

AIPlayer.prototype = new Player();
AIPlayer.constructor = AIPlayer;
function HumanPlayer(options) {
    console.log("HumanPlayer()");

    Player.call(this, options);
    setupControls();

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


function Player(options) {

    var defaults = {
        color: 0xffffff
    };

    this.options = applyOptions(options);
    function applyOptions(options) {
        return $.extend(defaults, options);
    }

    this.position = null; // Vector3
    this.mesh = null; // Three mesh
    this.bbox = null;
    this.direction = null;
    this.indicator = null;

    // TODO adjust fireForceFactor to ensure the other player is always hitable
    this.fireForceFactor = 2;
    this.fireForce = 0;
    this.fireButtonTimeout = null;

    this.life = 100;


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

        this.bbox = new THREE.BoundingBoxHelper(this.obj, 0xff0000);
        this.bbox.update();
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

        this.bbox.update();
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
        console.log("Player.fire()", force);

        var direction = this.getIndicator().multiplyScalar(force).multiplyScalar(this.fireForceFactor); //new THREE.Vector3(0.5, 0.5, 0);
        var mass = 0.151;
        //projectile.setPosition(this.position.clone());
        var player = this;

        var projectile = new Projectile({
            direction: direction,
            mass: mass,
            player: this
        });

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

        //console.log("Player.addAngle()", this.canon.rotation.x);

        this.getIndicator();
        this.bbox.update();

        this.checkTangent(Scene.getTerrain().objForHittest);
    };


    /**
     * rotates the player canon horizontally
     * @param rotationChange in radians
     */
    this.addRotation = function(rotationChange) {
        // rotate the whole player object, not just the canon
        this.obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationChange);

        //console.log("Player.addRotation", this.obj.rotation.y);

        this.getIndicator();
        this.bbox.update();

        this.checkTangent(Scene.getTerrain().objForHittest);
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
        while (this.indicator.children.length > 5) {
            this.indicator.children.shift();
        }

        var g = new THREE.Geometry();
        g.vertices.push(this.position);
        g.vertices.push(this.position.clone().add(direction.clone().multiplyScalar(1 + forceIndicator * 5)));
        var m = new THREE.LineBasicMaterial({ color: "rgb(" + Math.round(forceIndicator * 255) + ", 0, 0)" });
        this.indicator.add(new THREE.Line(g, m));

        return direction;
    };


    /**
     * helper for checking if the aim hits terrain in immediate surroundings (i.e. projectile will explode next to the
     * player because it hits terrain)
     *
     * @param object
     */
    this.checkTangent = function (object) {
        //var raycaster = new THREE.Raycaster(this.position, this.getIndicator().multiplyScalar(10));
        //console.log("Player.checkTangent", raycaster.intersectObject(object));
    };


    /**
     * this player got hit
     */
    this.registerHit = function () {
        this.life -= 100;

        if (this.life <= 0) {
            this.terminate();
        }
    };


    /**
     * TODO visually signify player having lost
     */
    this.terminate = function () {
        console.log("Player exploded");
    };
}



var Projectile = function (options) {

    // some generic defaults that get overwritten by the passed in options
    var defaults = {
        mass: 0.1,
        direction: new THREE.Vector3(0, 0, 0),
        player: null
    };

    var options = $.extend(defaults, options);

    var geometry = new THREE.SphereGeometry(0.25, 4, 4);
    var material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    var mesh = new THREE.Mesh(geometry, material);

    var offsetY = 1;

    // collision check helpers
    // make reusable raycasting objects so they don't have to be recreated every frame
    var lastResult = null;
    var raycasterDirection = new THREE.Vector3(0, -1, 0);
    var raycaster = new THREE.Raycaster(this.position, raycasterDirection);

    //TODO implement drag factor into update
    this.drag = 0.01;

    this.obj = new THREE.Object3D();
    this.obj.add(mesh);
    this.obj.position = new THREE.Vector3(0, 0, 0);

    this.position = options.player.position.clone();

    // TODO this is a dirty hack to not get the player hit its immediate surroundings nor its own bounding box
    this.position.y += offsetY;


    /**
     * Apply @param force to this projectiles direction
     *
     * @param force
     */
    this.applyForce = function (force) {
        options.direction = options.direction.add(force.direction.clone().multiplyScalar(1 + options.mass));
    };


    /**
     * Move the projectile after applying movement momentum
     */
    this.update = function () {
        this.position = this.position.add(options.direction);
        var move = new THREE.Vector3().subVectors(this.position, this.obj.position);
        this.obj.translateX(move.x);
        this.obj.translateY(move.y);
        this.obj.translateZ(move.z);

        $(window).trigger("PROJECTILE_MOVE", { position: this.position });
    };


    /**
     * Checks if @param plane geometry has been hit yet
     *
     * @param plane
     * @returns {boolean}
     *
     * TODO right now this works by shooting a ray down the z axis, but more ideally this would be a ray to the next
     * closest face of plane with the negative direction of that face's normal
     */
    this.checkPlaneCollision = function (plane) {
        // update the raycaster position to cast a ray straight down from the current projectile position
        raycaster.set(this.position, raycasterDirection);

        // if the ray hit something the projectile is still above the surface, no hit, but store the lastResult
        var test = raycaster.intersectObject(plane);

        if (test.length) {
            lastResult = test;
            return false;
        } else {
            return true;
        }
    };


    /**
     * Helper to access the last triggered plane collision result array (with intersect objects)
     *
     * @returns {boolean|THREE.Vector3}
     */
    this.getPlaneCollision = function () {
        console.log("Projectile.getPlaneCollision", lastResult);
        return lastResult ? lastResult[0].point : false;
    };


    /**
     *
     * @param player Player
     * @returns {boolean|THREE.Vector3}
     */
    this.checkPlayerCollision = function (player) {
        // for now, detect intersection of the player object's bounding sphere

        // TODO this now only checks if the position of the projectile is in the bounding box of the player target
        // ideally, this would be projectile geometry, or projectile bounding box, or projectile position plus radius
        if (Utils.PointInBox(this.position, player.bbox.box)) {
            return this.position;
        } else {
            return false;
        }

    };
};

var Scene = (function () {

    var scene,
        camera,
        renderer,
        projectiles,
        terrain;


    /**
     * entry point for setting up the scene and renderer
     */
    var init = function (numPlayers) {
        console.log("Scene.init()");

        scene = new THREE.Scene();

        CameraManager.init();
        scene.add(CameraManager.getCameraDolly());

        // debug camera:
        CameraManager.debug(true);
        scene.add(CameraManager.getDebugHelper());

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
        scene.add(new THREE.AxisHelper(100));

        projectiles = [];

    };


    /**
     * start rendering the scene
     */
    var start = function () {
        render();
        CameraManager.animateTo(new THREE.Vector3(-30, 15, 0), new THREE.Vector3(0, 0, 0), 0);
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
                        $(window).trigger("PROJECTILE_IMPACT", { point: playerHit });
                        players[player].registerHit();
                        terrain.showImpact(playerHit, 0xff0000);

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
        }
    };

})();

Terrain = function() {

    var width = 400,
        height = 400,
        widthSegments = 400,
        heightSegments = 400,
        geometry, // the main plain

        // area of the main plain that has actual game stuff happening in it
        widthArea = 80,
        heightArea = 80,

        shaded,
        wire,
        effects,

        noise,
        playerOffsetY = 1;


    //init();

    /**
     * generate a basic level terrain
     *
     * @returns {THREE.Mesh}
     */
    this.init = function () {

        noise = new Noise(Math.random());
        //console.log("NOISE", noise);


        geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
        for (var v = 0; v < geometry.vertices.length; v++) {

            var x = geometry.vertices[v].x;
            var y = geometry.vertices[v].y;

            // TODO make these parameteres and frequencies more random still
            // layer different frequency noise link suggested here: http://stackoverflow.com/a/12627930/999162
            geometry.vertices[v].z += noise.perlin2(x, y) + noise.perlin2(x / 2, y / 2) + 4 * noise.perlin2(x / 8, y / 8) +
                16 * noise.perlin2(x / 32, y / 32);
            geometry.vertices[v].x += noise.perlin2(x, y);
            geometry.vertices[v].y += noise.perlin2(x, y);
        }
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        geometry.verticesNeedUpdate = true;
        var material = new THREE.MeshDepthMaterial();

        this.obj = new THREE.Object3D();

        shaded = new THREE.Mesh(geometry, material);
        shaded.userData = { name: "shaded" };
        wire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true, wireframeLinewidth: 0.5 }));
        wire.userData.name = "wire";
        effects = new THREE.Object3D();
        effects.userData.name = "effects";

        this.obj.add(shaded);
        //this.obj.add(wire);
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
            position.y += playerOffsetY;
            pos.push(position);
        }
        this.playerPositions = pos;

        return this.playerPositions;
    };

    // private helper function
    function getRandomPlayerPosition() {
        return geometry.vertices[Math.floor(Math.random() * geometry.vertices.length)];
    };


    /**
     * Find the next closest player from @param position (while ignoring @param excludePosition)
     *
     * @param position THREE.Vector3
     * @param excludePosition THREE.Vector3
     * @returns {{position: THREE.Vector3, distance: number}}
     */
    this.closestOtherPlayer = function (position, excludePosition) {
        console.log("Terrain.closestOtherPlayer()", position, excludePosition);
        var closest = null;
        var closestPos = null;
        for (pos in this.playerPositions) {
            if (this.playerPositions[pos] != excludePosition) {
                var distance = position.distanceTo(this.playerPositions[pos]);
                if (closest === null || distance < closest) {
                    closestPos = this.playerPositions[pos];
                    closest = distance;
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
    this.showImpact = function (point, color) {
        var geometry = new THREE.SphereGeometry(1, 4, 4);
        geometry.applyMatrix(new THREE.Matrix4().setPosition(point));
        var material = new THREE.MeshBasicMaterial({ color: color });
        var mesh = new THREE.Mesh(geometry, material);
        Utils.Object3DgetChildByName(this.obj, "effects").add(mesh);
    }

};

var UI = (function () {

    var playerColors = [0x00ff00, 0xff0000, 0xffff00, 0x00ffff];
    var playerRowTemplate = Handlebars.compile($("#playerRowTemplate").html());
    var $playersTable = $("#start table");

    var init = function () {
        $(window).on("resize", onResize);
        onResize();
        $("#ui-start-game").on("click", startGame);
        $("#menus [name=numPlayers]").on("change", startUpdatePlayers);
        showMenu("#start");
    };


    //TODO this resizing doesn't really work yet as intended; it stretches the scene
    function onResize() {
        var w = $(window).width();
        var h = $(window).height();

        $("#gamecanvas").css("width", w + "px");
        $("#gamecanvas").css("height", h + "px");
    }


    //function resetScene() {
    //    Game.reset();
    //}

    function startGame() {
        var players = [];

        $playersTable.children(".playerRow").each(function () {
            var $this = $(this),
                playerName = $this.find("input[name=playerName]").val();

            if (!playerName) {
                playerName = "Mr. Random";
            }

            if ($this.find("select").val() == "human") {
                players.push(new HumanPlayer({ color: playerColors[players.length], name: playerName }));
            } else {
                players.push(new AIPlayer({ color: playerColors[players.length], name: playerName }));
            }
        });


        // lazy dev mode
        while (players.length < 2) {
            players.push(new HumanPlayer({ color: playerColors[players.length], name: "Foobar" }));
            hideMenu();
        }


        //new HumanPlayer({ color: 0xff0000, name: "Barfoo" })
        //new AIPlayer({ color: 0xff00ff, name: "Foobar" }),
        //new AIPlayer({ color: 0xff6600, difficulty: 0, name: "Robert the Robot" })

        console.log(players);

        hideMenu();
        Game.start(players);
    }


    function startUpdatePlayers(e) {
        console.log($(e.target).val());

        var numPlayers = $(e.target).val();

        while ($playersTable.children(".playerRow").length < numPlayers) {
            var numRows = $playersTable.children(".playerRow").length;
            $playersTable.append(playerRowTemplate({ num: numRows + 1 }));
        }

        while ($playersTable.children(".playerRow").length > numPlayers) {
            $playersTable.children(".playerRow:last").remove();
        }
    }


    function showMenu(menuId) {
        hideMenu();
        $(menuId).show();
    }

    function hideMenu() {
        $("#menus").children().hide();
    }


    return {
        init: init,
        startGame: startGame
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
        Object3DgetChildByName: function(object3d, name) {
            for (child in object3d.children) {
                if (object3d.children[child].userData && object3d.children[child].userData.name &&
                    object3d.children[child].userData.name == name)
                {
                    return object3d.children[child];
                }
            }
            return false;
        },


        PointInBox: function(point, box) {
            var inside = (
                point.x > box.min.x &&
                point.x < box.max.x &&
                point.y > box.min.y &&
                point.y < box.max.y &&
                point.z > box.min.z &&
                point.z < box.max.z
            );

            return inside;
        },


        /**
         * NOTE There is the similar THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth)
         *
         * @param vectorPoints
         * @param color
         * @param offset
         * @returns {THREE.Line}
         * @constructor
         */
        HelperLine: function (vectorPoints, color, offset) {
            var geometry = new THREE.Geometry();
            for (i in vectorPoints) {
                geometry.vertices.push(vectorPoints[i]);
            }
            if (offset) {
                geometry.applyMatrix(new THREE.Matrix4().setPosition(offset));
            }
            var material = new THREE.LineBasicMaterial({ color: color ? color : 0xff0000 });

            return new THREE.Line(geometry, material);
        }
    };
}());

$(function() {

    UI.init();
    UI.startGame();

});
