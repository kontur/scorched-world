

function Player() {

}

Player.prototype = {

    position: null, // Vector3
    mesh: null, // Three mesh
    direction: null,

    init: function () {
        var geometry = new THREE.IcosahedronGeometry(1, 0);
        //var material = new THREE.MeshBasicMaterial({ color: 0xff3300, wireframe: true });
        var material = new THREE.MeshPhongMaterial({ ambient: 0xff0000, color: 0xff3300, specular: 0x0099ff, shininess: 30, shading: THREE.FlatShading });
        this.mesh = new THREE.Mesh(geometry, material);
        this.obj = new THREE.Object3D();

        var geo = new THREE.CylinderGeometry(0.25, 0.5, 4);
        var mat = new THREE.MeshPhongMaterial({ ambient: 0xff0000, color: 0x00ffff, specular: 0x0099ff, shininess: 30, shading: THREE.FlatShading });
        this.canon = new THREE.Mesh(geo, mat);

        this.obj.add(this.mesh);
        this.obj.add(this.canon);
    },

    setPosition: function (v3) {
        console.log("Player.setPosition", v3);
        this.position = v3;
        //this.mesh.geometry.position = v3;
        //console.log(this.mesh);

        this.obj.translateX(v3.x);
        this.obj.translateY(v3.y);
        this.obj.translateZ(v3.z);

        //var m = new THREE.Matrix4().makeTranslation(v3);
        //this.mesh.geometry.applyMatrix(m);
        //this.mesh.geometry.verticesNeedUpdate;

        //this.mesh.geometry.position = v3;
        //this.mesh.translateX(this.position.x);
        ////this.mesh.translateY(this.position.y);
        //this.mesh.translateZ(this.position.y);
        //this.mesh.translateY(2);
    },

    getMesh: function () {
        return this.obj;
    }
};

