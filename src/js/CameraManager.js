/**
 * Class for managing camera animations and interactions
 *
 * TODO logic for not allowing the camera to penetrate the terrain, i.e. calculate the actual distance between
 * camera position (not dolly, but actual camera) and the terrain at that pos, then offset it to a minimum buffer
 */
var CameraManager = (function () {

    var camera;
    var cameraDolly;
    var cameraDollyVertical;
    var cameraDollyHorizontal;

    var targetPosition = null;
    var targetLookAt;
    var targetRotationH = null;

    var controlsEnabled = false;

    var a; // tmp helper
    var rotationHelper; // tmp helper


    var init = function () {
        cameraDolly = new THREE.Object3D();
        cameraDollyVertical = new THREE.Object3D();
        cameraDollyHorizontal = new THREE.Object3D();

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 150);
        // rotate camera once so that it aligns with the cameraDollyHorizontal's .lookAt direction
        camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);

        cameraDollyVertical.translateZ(-25);
        cameraDollyVertical.add(camera);
        cameraDollyVertical.add(new THREE.AxisHelper(15));

        cameraDollyHorizontal.add(cameraDollyVertical);

        cameraDolly.add(cameraDollyHorizontal);
        cameraDolly.add(new THREE.AxisHelper(25));

        var g = new THREE.BoxGeometry(2, 2, 2);
        var m = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        cameraDolly.add(new THREE.Mesh(g, m));

        var geom = new THREE.BoxGeometry(5, 5, 5);
        var mat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        cameraDollyHorizontal.add(new THREE.Mesh(geom, mat));

        //var geom = new THREE.SphereGeometry(7, 8, 8);
        //var mat = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
        //cameraDollyVertical.add(new THREE.Mesh(geom, mat));

        setupCameraControls();


        // listen for events informing of a projectile mid-air so the camera can follow it in its flight path
        $(window).on("PROJECTILE_MOVE", function (e, data) {
            targetLookAt = data.position;
            targetRotationH = 0;
        });

        rotationHelper = new THREE.Object3D();

        cameraDollyHorizontal.matrixAutoUpdate = true;
    };


    var animateTo = function (position, lookAt, _targetRotationH) {
        //console.log("CameraManager.animateTo", position, lookAt);
        targetPosition = position;
        targetLookAt = lookAt;
        targetRotationH = _targetRotationH !== null ? _targetRotationH : 0;
    };


    var setTo = function (position, lookAt) {
        var diff = position.clone().sub(cameraDolly.position.clone());
        cameraDolly.applyMatrix(new THREE.Matrix4().setPosition(diff));
        cameraDollyHorizontal.lookAt(lookAt);

        targetLookAt = lookAt;
        targetPosition = position;
    };


    /**
     * Update the camera position
     */
    var update = function () {

        // update the cameraDolly position when it's not a targetPosition and the cameraDolly is in the scene
        if (cameraDolly.position && targetPosition !== null) {
            var diff = targetPosition.clone().sub(cameraDolly.position.clone());

            // only update position difference is beyond a certain threshold to avoid minimal decimal precision
            // repositioning
            if (diff.length() > 0.1) {
                // move in 15% steps to the target
                diff.multiplyScalar(0.15);

                cameraDolly.applyMatrix(new THREE.Matrix4().setPosition(diff));
                cameraDolly.updateMatrix();
            } else {
                // set targetPosition to "reached" thus avoid the calculations of this loop altogether until no
                // new targetPosition gets set for better performance
                targetPosition = null;
            }
        }


        if (targetLookAt) {
            cameraDollyHorizontal.lookAt(targetLookAt);
            rotationHelper.remove(a);
            a = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), targetLookAt.clone(), 10, 0xffff00);
            rotationHelper.add(a);
        }


        if (cameraDolly.rotation && targetRotationH !== null) {

            // TODO difference should be "shortest" angle, not numerical
            var rotationDifference = cameraDolly.rotation.y - targetRotationH;

            console.log("adjust rotation", cameraDolly.rotation.y, targetRotationH, "difference", rotationDifference);

            if (rotationDifference > Math.PI) {
                console.log("rotation > Math.PI");
                rotationDifference = -(Math.PI * 2 - rotationDifference);
                console.log(rotationDifference);
            }

            //rotationDifference = Math.PI - rotationDifference % Math.PI;

            if (Math.abs(rotationDifference) < 0.1) {
                console.log("stop target rotation animation");
                targetRotationH = null;
            } else {
                console.log("rotate some more ", rotationDifference);
                // TODO replace 0.1 with dynamic accelarerated / eased value
                cameraDolly.rotation.y += 0.1;
                //cameraDolly.rotation.y += rotationDifference * 0.15;
            }
        }
    };


    var enableCameraControl = function () {
        controlsEnabled = true;
    };


    var disableCameraControl = function () {
        controlsEnabled = false;
    };


    function setupCameraControls() {
        $(window).on("keydown", onKeyDown);
    }


    function onKeyDown(e) {
        console.log(e.keyCode);

        var rotationSpeed = 0.051;

        switch (e.keyCode) {
            // d
            case 68:
                rotate("x", -rotationSpeed);
                break;

            // a
            case 65:
                rotate("x", rotationSpeed);
                break;

            // w
            case 87:
                rotate("y", -rotationSpeed);
                break;

            // s
            case 83:
                rotate("y", rotationSpeed);
                break;

            default:
                break;
        }
    }


    /**
     * TODO this implementation is just broken. period.
     * TODO initial idea was to translate world Y axis to cameraDolly vector, and use THREE.Matrix4().makeRotationAxis
     *
     * @param axis
     * @param rotation
     */
    function rotate(axis, rotation) {
        if (axis == "x") {
            console.log("rotate", cameraDolly.rotation.y, Math.PI * 2);
            cameraDolly.rotation.y += rotation;
            if (cameraDolly.rotation.y > Math.PI * 2) {
                cameraDolly.rotation.y -= Math.PI * 2;
            } else if (cameraDolly.rotation.y < 0) {
                cameraDolly.rotation.y += Math.PI * 2;
            }
            console.log("rotate after", cameraDolly.rotation.y);
            cameraDolly.updateMatrix();
        } else if (axis == "y") {
            // rotate the camera axis along local x-axis (up/down)
            cameraDollyVertical.rotation.x += rotation;
            cameraDollyVertical.updateMatrix();
        }
    }


    return {
        init: init,
        animateTo: animateTo,
        setTo: setTo,
        update: update,

        enableControls: enableCameraControl,
        disableControls: disableCameraControl,

        getCamera: function () {
            return camera;
        },
        getCameraDolly: function () {
            return cameraDolly;
        },
        getRotationHelper: function () {
            return rotationHelper;
        }
    };

})();