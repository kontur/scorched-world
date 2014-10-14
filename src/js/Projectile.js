/**
 * Generic projectile base class
 *
 * @constructor
 */
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
