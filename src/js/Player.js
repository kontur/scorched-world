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
        return $.extend(defaults, options);
    }

    this.position = null; // Vector3
    this.mesh = null; // Three mesh
    this.bbox = null;
    this.direction = null;
    this.indicator = null;
    this.cameraPosition = null;

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

        this.cameraPosition = CameraManager.getLocation();
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


