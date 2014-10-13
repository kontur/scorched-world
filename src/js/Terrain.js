/**
 * Terrain class for initializing and generating level terrain
 *
 * @returns {{init: Function, generatePlayerPositions: Function}}
 * @constructor
 */
Terrain = function() {

    var width = 100,
        height = 100,
        widthSegments = 30,
        heightSegments = 30,
        geometry, // the main plain

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
        wire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true, wireframeLinewidth: 2.5 }));
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


    //TODO better generation of player positions; minimum distance, centerish positions etc
    this.generatePlayerPositions = function (num, scene) {
        var pos = [];
        for (var i = 0; i < num; i++) {
            pos.push(getRandomPlayerPosition());
        }
        this.playerPositions = pos;
    };

    // private helper function
    function getRandomPlayerPosition() {
        return geometry.vertices[Math.floor(Math.random() * geometry.vertices.length)];
    };


    this.closestOtherPlayer = function (position, excludePosition) {
        //console.log("Terrain.closestOtherPlayer", position, excludePosition);

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
