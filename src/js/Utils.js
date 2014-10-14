/**
 * General purpose helper singleton
 */
var Utils = (function () {

    // public methods
    return {

        /**
         * Helper to find a specific child of a THREE.Object3D by it's userData.name attribute
         *
         * @param object3d is a THREE.Object3D
         * @param name String
         * @returns THREE.Object3d or false
         *
         * TODO implement recursive search and recursive depth
         */
        Object3DgetChildByName: function(object3d, name) {
            console.log(object3d, name);
            for (child in object3d.children) {
                if (object3d.children[child].userData && object3d.children[child].userData.name &&
                    object3d.children[child].userData.name == name)
                {
                    return object3d.children[child];
                }
            }
            return false;
        },


        PointInBox: function(point, box) {
            var inside = (
                point.x > box.min.x &&
                point.x < box.max.x &&
                point.y > box.min.y &&
                point.y < box.max.y &&
                point.z > box.min.z &&
                point.z < box.max.z
            );

            return inside;
        }
    };
}());