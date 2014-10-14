/**
 * Player class prototype
 *
 * @constructor new Player()
 */
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
    this.bbox = null;
    this.direction = null;
    this.indicator = null;

    // TODO adjust fireForceFactor to ensure the other player is always hitable
    this.fireForceFactor = 2;
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

        console.log("Player.addAngle()", this.canon.rotation.x);
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

        console.log("Player.addRotation", this.obj.rotation.y);
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
    };


    this.checkTangent = function (object) {
        var raycaster = new THREE.Raycaster(this.position, this.getIndicator().multiplyScalar(10));
        console.log("Player.checkTangent", raycaster.intersectObject(object));
    };
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


    //TODO make this an actual animation, not just a plain set operation
    this.animateTo = function (rotationH, rotationV) {
        this.canon.rotateX(rotationV);
        this.obj.rotateY(rotationH);
        this.bbox.update();

        this.checkTangent(Scene.getTerrain().objForHittest);
    };


    //TODO take the distance from this player to target, then cycle through provious shots, take the one with closest distance
    // as a basis and then apply a random factor to the settings of that shot; the closer the distance in percent
    // the less random variation should go into the next shot; i.e. the closer it is already, the more circling to the
    // accurate position will happen
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