

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