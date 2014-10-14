/**
 * Terrain class for initializing and generating level terrain
 *
 * @returns {{init: Function, generatePlayerPositions: Function}}
 * @constructor
 */
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
        wire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframeLinewidth: 0.5 }));
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
