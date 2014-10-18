/**
 * Class for managing camera animations and interactions
 *
 * TODO logic for not allowing the camera to penetrate the terrain, i.e. calculate the actual distance between
 * camera position (not dolly, but actual camera) and the terrain at that pos, then offset it to a minimum buffer
 */
var CameraManager = (function () {

    // all the objects for the camera
    // the camera is constructed via several dollies to allow independent axis rotation
    //
    // the main cameraDolly is located at 0,0 of the targetPosition and can be user-rotated around the targetPosition
    //
    // attached to it is a cameraDollyHorizontal, which sets the camera lookAt direction
    //
    // attached to it is a cameraVerticalDolly, which allows for the vertical camera rotation to be set by the user and
    // is situated with an offset behind the targetPosition (so it looks at it)
    //
    // the camera object is the three.js camera itself, which does not move at all and is rotated on init to line up
    // with the other dollies' lookAt along the their z-axis
    var camera;
    var cameraDolly;
    var cameraDollyVertical;
    var cameraDollyHorizontal;

    var targetPosition = null;
    var targetLookAt;
    var targetRotationH = null;

    var controlsEnabled = false;

    // debug helper objects and flags
    var debug = false;
    var arrowHelper;
    var dollyHelper;
    var dollyHorizontalHelper;
    var debugHelper;


    // PUBLIC METHODS
    // **************

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
        cameraDollyHorizontal.matrixAutoUpdate = true;

        cameraDolly.add(cameraDollyHorizontal);
        cameraDolly.add(new THREE.AxisHelper(25));

        setupCameraControls();

        // listen for events informing of a projectile mid-air so the camera can follow it in its flight path
        $(window).on("PROJECTILE_MOVE", function (e, data) {
            targetLookAt = data.position;
            targetRotationH = 0;
        });

        // init this debugHelper either way
        debugHelper = new THREE.Object3D();

    };


    /**
     * Function to animate to a position, lookAt value and user rotation value
     *
     * @param position
     * @param lookAt
     * @param _targetRotationH
     */
    var animateTo = function (position, lookAt, _targetRotationH) {
        targetPosition = position;
        targetLookAt = lookAt;
        targetRotationH = _targetRotationH !== null ? _targetRotationH : 0;
    };


    /**
     * Function to explicitly set position and lookAt without animation
     *
     * @param position
     * @param lookAt
     */
    var setTo = function (position, lookAt) {
        var diff = position.clone().sub(cameraDolly.position.clone());
        cameraDolly.applyMatrix(new THREE.Matrix4().setPosition(diff));
        cameraDollyHorizontal.lookAt(lookAt);

        targetLookAt = lookAt;
        targetPosition = position;
    };


    /**
     * Update the camera position
     *
     * TODO gradual and tweened rotation changes
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


        // visually highlight the lookAt target in debug mode
        if (debug && targetLookAt) {
            cameraDollyHorizontal.lookAt(targetLookAt);
            debugHelper.remove(arrowHelper);
            arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), targetLookAt.clone(), 10, 0xffff00);
            debugHelper.add(arrowHelper);
        }


        // update the camera rotations if any are set
        if (cameraDolly.rotation && targetRotationH !== null) {
            var rotationDifference = cameraDolly.rotation.y - targetRotationH;
            
            // for values beyond 180 degrees calculate negative (shorter) angle
            if (rotationDifference > Math.PI) {
                rotationDifference = -(Math.PI * 2 - rotationDifference);
            }

            // stop rotation animation when the target angle is as good as reached
            if (Math.abs(rotationDifference) < 0.1) {
                // set null to prevent entering this whole rotation logic on next update()
                targetRotationH = null;
            } else {
                // otherwise approach target rotation angle
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


    var debugMode = function (bool) {
        debug = bool;
        if (debug) {
            var g = new THREE.BoxGeometry(2, 2, 2);
            var m = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
            dollyHelper = new THREE.Mesh(g, m);
            cameraDolly.add(dollyHelper);

            var geom = new THREE.BoxGeometry(5, 5, 5);
            var mat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
            dollyHorizontalHelper = new THREE.Mesh(geom, mat);
            cameraDollyHorizontal.add(dollyHorizontalHelper);
        }
    };


    // PRIVATE METHODS
    // ***************


    function setupCameraControls() {
        $(window).on("keydown", onKeyDown);
    }


    function onKeyDown(e) {
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
     * Rotate the camera to either look up an down at current focus point or rotate around the current focus point
     * 
     * @param axis
     * @param rotation
     * 
     * TODO speed up / ease in out
     */
    function rotate(axis, rotation) {
        if (axis == "x") {
            // rotate the camera along the local y axis around its focal point
            cameraDolly.rotation.y += rotation;
            
            // clamp assigned value to 0 - Math.PI * 2 
            if (cameraDolly.rotation.y > Math.PI * 2) {
                cameraDolly.rotation.y -= Math.PI * 2;
            } else if (cameraDolly.rotation.y < 0) {
                cameraDolly.rotation.y += Math.PI * 2;
            }
            cameraDolly.updateMatrix();
        } else if (axis == "y") {
            // rotate the camera axis along local x-axis (up/down)
            cameraDollyVertical.rotation.x += rotation;
            cameraDollyVertical.updateMatrix();
        }
    }


    // interface
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
        getDebugHelper: function () {
            return debugHelper;
        },

        debug: debugMode
    };

})();