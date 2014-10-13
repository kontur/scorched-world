/**
 * Player class prototype
 *
 * @constructor new Player()
 */
function Player(options) {
    console.log("Player()");

    var defaults = {
        color: 0xffffff
    };

    this.options = applyOptions(options);
    function applyOptions(options) {
        console.log("applyOptions", options);
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

        projectile.direction = this.getindicatorector().multiplyScalar(force); //new THREE.Vector3(0.5, 0.5, 0);
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

        //console.log("Player.addAngle()", this.canon.rotation.x);
        this.getindicatorector();
    };


    /**
     * rotates the player canon horizontally
     * @param rotationChange in radians
     */
    this.addRotation = function(rotationChange) {
        // rotate the whole player object, not just the canon
        this.obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationChange);
        //console.log("Player.addRotation", this.obj.rotation.y);
        this.getindicatorector();
    };


    /**
     * Update the internal firing vector of the canon from object and canon rotations
     *
     * @returns {THREE.Vector3}
     */
    this.getindicatorector = function (forceIndicator) {
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

        while (this.indicator.children.length > 1) {
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
    this.controlsEnabled = false;
    this.enableControls = function () {
        this.controlsEnabled = true;
    };
    this.disableControls = function () {
        this.controlsEnabled = false;
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
        that.getindicatorector(Math.min(100, that.fireForce) / 100);
    }
}

HumanPlayer.prototype = new Player();
HumanPlayer.constructor = HumanPlayer;



function AIPlayer(options) {
    Player.call(this, options);

};

AIPlayer.prototype = new Player();
AIPlayer.constructor = AIPlayer;