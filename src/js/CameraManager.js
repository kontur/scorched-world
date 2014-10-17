/**
 * Class for managing camera animations and interactions
 */
var CameraManager = (function () {

    var camera;
    var cameraDolly;
    var cameraDollyVertical;
    var cameraDollyHorizontal;

    var rotationHelper;

    var lastLookAt;

    var targetPosition;
    var targetLookAt;

    var controlsEnabled = false;

    var a;


    var init = function () {
        cameraDolly = new THREE.Object3D();
        cameraDollyVertical = new THREE.Object3D();
        cameraDollyHorizontal = new THREE.Object3D();

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 150);
        // rotate camera once so that it aligns with the cameraDolly's .lookAt direction
        camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);

        cameraDollyVertical.translateZ(-55);
        cameraDollyVertical.add(camera);
        cameraDollyVertical.add(new THREE.AxisHelper(15));

        cameraDollyHorizontal.add(cameraDollyVertical);

        cameraDolly.add(cameraDollyHorizontal);
        cameraDolly.add(new THREE.AxisHelper(25));

        //var g = new THREE.SphereGeometry(1, 4, 4);
        //var m = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        //cameraDolly.add(new THREE.Mesh(g, m));
        //var geom = new THREE.BoxGeometry(10, 10, 10);
        //var mat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        //cameraDolly.add(new THREE.Mesh(geom, mat));

        setupCameraControls();

        $(window).on("PROJECTILE_MOVE", function (e, data) {
            cameraDolly.lookAt(data.position);
            lastLookAt = data.position;
        });


        rotationHelper = new THREE.Object3D();
    };


    var animateTo = function (position, lookAt) {
        //console.log("CameraManager.animateTo", position, lookAt);
        targetPosition = position;
        targetLookAt = lookAt;
        lastLookAt = lookAt;
    };


    var setTo = function (position, lookAt) {
        var diff = position.clone().sub(cameraDolly.position.clone());
        cameraDolly.applyMatrix(new THREE.Matrix4().setPosition(diff));
        cameraDollyHorizontal.lookAt(lookAt);

        lastLookAt = lookAt;

        targetLookAt = lookAt;
        targetPosition = position;
    };


    var update = function () {
        //return;
        if (cameraDolly.position && targetPosition) {
            var diff = targetPosition.clone().sub(cameraDolly.position.clone());

            // move in 15% steps to the target
            diff.multiplyScalar(0.15);

            cameraDolly.applyMatrix(new THREE.Matrix4().setPosition(diff));
            cameraDolly.updateMatrix();
            //cameraDollyHorizontal.lookAt(targetLookAt);
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
            cameraDolly.rotation.y += rotation;
            //console.log(cameraDolly.rotation);
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