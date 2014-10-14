/**
 * Class for managing camera animations and interactions
 */
var CameraManager = (function () {

    var camera;
    var lookAt;

    var targetPosition;
    var targetLookAt;


    var init = function () {
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 150);
    };


    var animateTo = function (position, _lookAt) {
        //console.log("CameraManager.animateTo", position, _lookAt);
        targetPosition = position;
        targetLookAt = _lookAt;
        lookAt = _lookAt;
    };


    var setTo = function (position, _lookAt) {
        var diff = position.clone().sub(camera.position.clone());
        camera.applyMatrix(new THREE.Matrix4().setPosition(diff));
        camera.lookAt(_lookAt);

        lookAt = _lookAt;
    };


    var update = function () {
        if (camera.position && targetPosition) {
            var diff = targetPosition.clone().sub(camera.position.clone());
            diff.multiplyScalar(0.15);
            camera.applyMatrix(new THREE.Matrix4().setPosition(diff));
            camera.lookAt(lookAt);
        }
        if (lookAt != targetLookAt) {
            camera.lookAt(lookAt);
        }
    };


    //function setupScrollInteraction () {
    //    $(window).on('mousewheel', function(e) {
    //        //console.log(e.originalEvent.wheelDelta);
    //        if (e.originalEvent.wheelDelta >= 0) {
    //            camera.position.z += 0.25;
    //        } else {
    //            camera.position.z -= 0.25;
    //        }
    //    });
    //}
    //
    //
    //function setupMouseInteraction() {
    //    $(window).mousemove(function (e) {
    //        var mouseX = e.originalEvent.pageX,
    //            mouseY = e.originalEvent.pageY,
    //            percentH = mouseX / window.innerWidth,
    //            percentV = mouseY / window.innerHeight;
    //
    //        camera.position.y = 10 + (5 * percentV);
    //        camera.position.x = percentH * 20 - 10;
    //        camera.lookAt(new THREE.Vector3(0, 0, 0));
    //    });
    //}
    return {
        init: init,
        animateTo: animateTo,
        setTo: setTo,
        update: update,

        getCamera: function () {
            return camera;
        }
    };

})();