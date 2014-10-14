/**
 * Player subclass with input interaction for aiming and firing
 *
 * @constructor new HumanPlayer()
 */
function HumanPlayer(options) {
    console.log("HumanPlayer()");

    Player.call(this, options);
    setupControls();

    var that = this;

    this.isHuman = true;
    this.controlsEnabled = false;


    this.enableControls = function () {
        this.controlsEnabled = true;
        console.log("Player controls enabled");
    };


    this.disableControls = function () {
        this.controlsEnabled = false;
        console.log("Player controls disabled");
    };

    function setupControls () {
        console.log("HumanPlayer.setupControls()");
        $(window).on("keydown", onKeyDown);
        $(window).on("keyup", onKeyUp);
    }


    /**
     * TODO improve rotating by adding additive rotation speed when key pressed continuously
     */
    function onKeyDown(e) {
        if (!that.controlsEnabled) {
            return false;
        }

        var rotationStep = 5;

        switch (e.keyCode) {
            // arrow up
            case 40:
                that.addAngle(rotationStep * (Math.PI / 180));
                break;

            // arrow down
            case 38:
                that.addAngle(-rotationStep * (Math.PI / 180));
                break;

            // arrow left
            case 39:
                that.addRotation(-rotationStep * (Math.PI / 180));
                break;

            // arrow right
            case 37:
                that.addRotation(rotationStep * (Math.PI / 180));
                break;

            // space bar
            case 32:
                if (!that.fireButtonTimeout) {
                    that.fireButtonTimeout = setTimeout(fireButtonDown, 5);
                }
                break;

            default:
                break;
        }
    }

    function onKeyUp(e) {
        if (!that.controlsEnabled) {
            return false;
        }

        if (e.keyCode == "32") {
            // spacebar was released

            clearTimeout(that.fireButtonTimeout);
            that.fire(that.fireForce / 100);
            that.fireForce = 0;
            that.fireButtonTimeout = false;
        }
    }


    function fireButtonDown() {
        that.fireForce++;
        if (that.fireForce > 100) {
            that.fireForce = 100;
        }
        that.fireButtonTimeout = setTimeout(fireButtonDown, 5);
        that.getIndicator(Math.min(100, that.fireForce) / 100);
    }
}

HumanPlayer.prototype = new Player();
HumanPlayer.constructor = HumanPlayer;

