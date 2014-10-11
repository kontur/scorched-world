
Terrain = function() {

    var geometry,
        material,
        width = 100,
        height = 100,
        widthSegments = 30,
        heightSegments = 30;


    //init();

    /**
     * generate a basic level terrain
     *
     * @returns {THREE.Mesh}
     */
    var init = function () {
        geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
        for (var v = 0; v < geometry.vertices.length; v++) {
            geometry.vertices[v].z += Math.random() * 2;
            geometry.vertices[v].x += Math.random() - 0.5;
            geometry.vertices[v].y += Math.random() - 0.5;
        }
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        geometry.verticesNeedUpdate = true;
        material = new THREE.MeshDepthMaterial();

        this.mesh = new THREE.Mesh(geometry, material);
        this.wires = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true, wireframeLinewidth: 2.5 }));

        return this;
    };


    var generatePlayerPositions = function (num, scene) {
        var pos = [];
        for (var i = 0; i < num; i++) {
            pos.push(getRandomPlayerPosition());
        }
        this.playerPositions = pos;
    };


    var getRandomPlayerPosition = function () {
        return geometry.vertices[Math.floor(Math.random() * geometry.vertices.length)];
    };


    return {
        init: init,
        generatePlayerPositions: generatePlayerPositions
    };

};
