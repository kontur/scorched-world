/**
 * Class for managing camera animations and interactions
 */
var CameraManager = (function () {

    var camera;
    var cameraDolly;

    var rotationHelper;

    var lastLookAt;

    var targetPosition;
    var targetLookAt;

    var controlsEnabled = false;


    var init = function () {
        cameraDolly = new THREE.Object3D();
        cameraDolly.matrixAutoUpdate = true;
        //cameraDolly.rotation.order = "XZY";
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 150);
        // rotate camera once so that it aligns with the cameraDolly's .lookAt direction
        camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
        camera.translateZ(15);

        var g = new THREE.SphereGeometry(1, 4, 4);
        var m = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        cameraDolly.add(new THREE.Mesh(g, m));

        cameraDolly.add(camera);
        var geom = new THREE.BoxGeometry(10, 10, 10);
        var mat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        cameraDolly.add(new THREE.Mesh(geom, mat));

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
        cameraDolly.lookAt(lookAt);

        lastLookAt = lookAt;

        targetLookAt = lookAt;
        targetPosition = position;
    };


    var update = function () {
        if (cameraDolly.position && targetPosition) {
            var diff = targetPosition.clone().sub(cameraDolly.position.clone());
            diff.multiplyScalar(0.15);
            cameraDolly.applyMatrix(new THREE.Matrix4().setPosition(diff));
            cameraDolly.lookAt(targetLookAt);
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
                rotate(new THREE.Vector3(0, 0, 1), rotationSpeed);
                break;

            // a
            case 65:
                rotate(new THREE.Vector3(0, 0, 1), -rotationSpeed);
                break;

            // w
            case 87:
                rotate(new THREE.Vector3(1, 0, 0), rotationSpeed);
                break;

            // s
            case 83:
                rotate(new THREE.Vector3(1, 0, 0), -rotationSpeed);
                break;

            default:
                break;
        }
    }


    function rotate(worldAxis, rotation) {
        //console.log("camera position", cameraDolly.position, cameraDolly.rotation);
        var before = cameraDolly.position.clone();


        var localOriginToCamera = camera.position.clone();
        console.log("local origin to camera", localOriginToCamera);

        localOriginToCamera.y = 0;
        var globalCameraOriginToCamera = cameraDolly.localToWorld(localOriginToCamera);
        globalCameraOriginToCamera.y = 0;
        console.log("y 0 global camera origin to camera vector", globalCameraOriginToCamera);

        var globalCameraDollyPosition = cameraDolly.position.clone();
        globalCameraDollyPosition.y = 0;
        console.log("y 0 global camera dolly position", globalCameraDollyPosition);

        var angleBetween = globalCameraOriginToCamera.angleTo(globalCameraDollyPosition);
        console.log("angleBetween camera-origin and camera", angleBetween);

        var translatedAxis = worldAxis;
        translatedAxis = translatedAxis.applyMatrix4(new THREE.Matrix4().makeRotationY(angleBetween));
        console.log("translated world rotation axis in global", translatedAxis);

        rotationHelper.add(Utils.HelperLine([new THREE.Vector3(0,0,0), translatedAxis], 0x00ffff, cameraDolly.position.clone()));
        translatedAxis = cameraDolly.worldToLocal(translatedAxis);

        console.log("translated world rotation axis in local space", translatedAxis);

        targetPosition = cameraDolly.position;
        cameraDolly.position = before;

        while (rotationHelper.childen > 5) {
            rotationHelper.removeChild(rotationHelper.children[0]);
        }

        rotationHelper.add(Utils.HelperLine([new THREE.Vector3(0,0,0), translatedAxis.multiplyScalar(10)],
            0xff00ff, cameraDolly.position));
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