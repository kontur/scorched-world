/**
 * Player class prototype
 *
 * @constructor new Player()
 */
function Player() {

    this.position = null; // Vector3
    this.mesh = null; // Three mesh
    this.direction = null;

    this.firingV = null;

    this.init = function () {
        var geometry = new THREE.IcosahedronGeometry(1, 0);
        var material = new THREE.MeshPhongMaterial({ ambient: 0xff0000, color: 0xff3300, specular: 0x0099ff, shininess: 30, shading: THREE.FlatShading });
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
        console.log("Player.setPosition", vector3);
        this.position = vector3;

        this.obj.translateX(vector3.x);
        this.obj.translateY(vector3.y);
        this.obj.translateZ(vector3.z);

        var geom = new THREE.Geometry();
        geom.vertices.push(this.position);
        geom.vertices.push(new THREE.Vector3(this.position.x, 10, this.position.z));
        var mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.firingV = new THREE.Line(geom, mat);
    };


    /**
     * fire a new projectile form the player's current position and rotation
     *
     * triggers PROJECTILE_FIRED event
     *
     * TODO power of projectile
     * TODO prevent multiple simultaneous projectiles in the air
     */
    this.fire = function () {
        var projectile = new Projectile();

        projectile.direction = this.getFiringVector(); //new THREE.Vector3(0.5, 0.5, 0);
        projectile.mass = 0.551;
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
        this.getFiringVector();
    };


    /**
     * rotates the player canon horizontally
     * @param rotationChange in radians
     */
    this.addRotation = function(rotationChange) {
        // rotate the whole player object, not just the canon
        this.obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationChange);
        //console.log("Player.addRotation", this.obj.rotation.y);
        this.getFiringVector();
    };


    /**
     * Update the internal firing vector of the canon from object and canon rotations
     *
     * @returns {THREE.Vector3}
     */
    this.getFiringVector = function () {
        // extracting direction from object matrix: https://github.com/mrdoob/three.js/issues/1606

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

        direction = direction.multiplyScalar(5);
        var g = new THREE.Geometry();
        g.vertices.push(this.position);
        g.vertices.push(this.position.clone().add(direction));
        var m = new THREE.LineBasicMaterial({ color: 0x004400 });
        this.firingV.add(new THREE.Line(g, m));

        console.log(this.firingV.children.length);
        while (this.firingV.children.length > 10) {
            this.firingV.children.shift();
        }

        //directionH = directionH.multiplyScalar(5);
        //var geom = new THREE.Geometry();
        //geom.vertices.push(this.position);
        //geom.vertices.push(this.position.clone().add(directionH));
        //var mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
        //this.firingV.add(new THREE.Line(geom, mat));

        return direction;
    }
}


/**
 * Player subclass with input interaction for aiming and firing
 *
 * @constructor new HumanPlayer()
 */
function HumanPlayer() {

    var that = this;
    this.controlsEnabled = false;
    this.enableControls = function () {
        this.controlsEnabled = true;
    };
    this.disableControls = function () {
        this.controlsEnabled = false;
    };

    Player.call(this);

    setupControls();


    function setupControls () {
        console.log("HumanPlayer.setupControls()");
        $(window).on("keydown", onKeyUp);
    }


    /**
     * TODO improve rotating by adding additive rotation speed when key pressed continuously
     */
    function onKeyUp(e) {
        if (!that.controlsEnabled) {
            return false;
        }

        var rotationStep = 5;

        switch (e.keyCode) {
            // arrow up
            case 38:
                that.addAngle(rotationStep * (Math.PI / 180));
                break;

            // arrow down
            case 40:
                that.addAngle(-rotationStep * (Math.PI / 180));
                break;

            // arrow left
            case 37:
                that.addRotation(-rotationStep * (Math.PI / 180));
                break;

            // arrow right
            case 39:
                that.addRotation(rotationStep * (Math.PI / 180));
                break;

            // space bar
            case 32:
                that.fire();
                break;

            default:
                break;
        }
    }
}

HumanPlayer.prototype = new Player();
HumanPlayer.constructor = HumanPlayer;