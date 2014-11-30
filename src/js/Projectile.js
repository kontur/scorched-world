/**
 * Generic projectile base class
 *
 * @constructor
 */
var Projectile = function (options) {

    // some generic defaults that get overwritten by the passed in options
    var defaults = {
        mass: 0.1,
        direction: new THREE.Vector3(0, 0, 0),
        player: null,
        color: 0xff00ff
    };

    var options = $.extend(defaults, options);

    var geometry = new THREE.SphereGeometry(0.25, 4, 4);
    var material = new THREE.MeshBasicMaterial({ color: options.color });
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
        //console.log("Projectile.getPlaneCollision", lastResult);
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
