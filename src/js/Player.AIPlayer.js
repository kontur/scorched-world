/**
 *
 * @param options
 * @constructor
 *
 * TODO player AI
 * TODO player AI difficulty
 * TODO automated aiming and firing animations
 */
function AIPlayer(options) {
    Player.call(this, options);

    this.isHuman = false;

    var shots = [];

    this.autofire = function () {
        var that = this;
        setTimeout(function () {

            //console.log("shots", shots);

            var closestDistance = null;
            var closestShot = null;
            if (shots.length) {
                for (shot in shots) {
                    //console.log("SHOT CLOSEST:", shots[shot].distance);
                    if (closestDistance === null || shots[shot].distance < closestDistance) {
                        closestShot = shots[shot];
                    }
                }
            }

            var shot = that.guessShot(closestShot);

            that.animateTo(shot.rotationH, shot.rotationV);

            setTimeout(function () {
                that.fire(shot.force);

                $(window).on("PROJECTILE_IMPACT", function (e, data) {
                    // get closest other player to impact
                    var closest = Scene.getTerrain().closestOtherPlayer(data.point, that.position);
                    //console.log("closest", closest);
                    shot.distance = closest.distance;
                    shot.hit = closest.position;
                    shots.push(shot);
                    //console.log(shot);
                    $(window).off("PROJECTILE_IMPACT");
                });

                that.getIndicator();
            }, 500);

        }, 1000);
    };


    //TODO make this an actual animation, not just a plain set operation
    this.animateTo = function (rotationH, rotationV) {
        this.canon.rotation.x = rotationV;
        this.obj.rotation.y = rotationH;
        this.checkTangent(Scene.getTerrain().objForHittest);
    };


    //TODO take the distance from this player to target, then cycle through provious shots, take the one with closest distance
    // as a basis and then apply a random factor to the settings of that shot; the closer the distance in percent
    // the less random variation should go into the next shot; i.e. the closer it is already, the more circling to the
    // accurate position will happen
    this.guessShot = function (shot) {
        var rotationH, rotationV, force;

        if (shot !== null) {
            //TODO factor of randomness based on a) difficulty and b) percentual distance to target of previous shot
            // (shot.distance)

            var closestOtherPlayerToBestHit = Scene.getTerrain().closestOtherPlayer(shot.hit, this.position);
            //console.log("player to hit: ", closestOtherPlayerToBestHit);

            var distanceToPlayer = this.position.distanceTo(closestOtherPlayerToBestHit.position);
            console.log("distance to next player", distanceToPlayer);
            console.log("---RATIO shot distance to distance to player", shot.distance / distanceToPlayer);

            var factor = Math.max(shot.distance / distanceToPlayer, 0.01);

            var randomH = Math.random() * Math.PI / 0.5 - Math.PI / 1 * factor * factor;
            var randomV = Math.random() * Math.PI / 2 - Math.PI / 4 * factor * factor;
            console.log("RANDOM", shot, randomH, randomV);
            rotationH = shot.rotationH + randomH;
            rotationV = shot.rotationV + randomV;
            force = shot.force + Math.random() / 4;
            //rotationH = shot.rotationH;
            //rotationV = shot.rotationV;
            //force = shot.force;
        } else {
            //TODO even without a reference shot, the first shot should, depending on difficulty level, still somewhat
            // aim at the direction of another player
            rotationH = Math.random() * Math.PI;
            rotationV = Math.random() * Math.PI / 2 - Math.PI / 4;
            force = Math.random() * 0.5 + 0.5;
        }

        //TODO clamp values to allowed orientations and forces - vertify these work as intended
        rotationH = THREE.Math.clamp(rotationH, 0, Math.PI * 2);
        rotationV = THREE.Math.clamp(rotationV, 0.25, Math.PI / 4); //?!
        force = THREE.Math.clamp(force, 0.1, 1);

        return {
            rotationH: rotationH,
            rotationV: rotationV,
            force: force
        };
    };

};

AIPlayer.prototype = new Player();
AIPlayer.constructor = AIPlayer;