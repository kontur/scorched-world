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

    that.rotationStep = 1;
    that.rotationStepMultiplier = 1.1;
    that.rotationStepMax = 10;

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
     *
     */
    function onKeyDown(e) {
        if (!that.controlsEnabled) {
            return false;
        }

        that.rotationStep = Math.min(that.rotationStepMax, that.rotationStep * that.rotationStepMultiplier);

        switch (e.keyCode) {
            // arrow up
            case 40:
                that.addAngle(that.rotationStep * (Math.PI / 180));
                break;

            // arrow down
            case 38:
                that.addAngle(-that.rotationStep * (Math.PI / 180));
                break;

            // arrow left
            case 39:
                that.addRotation(-that.rotationStep * (Math.PI / 180));
                break;

            // arrow right
            case 37:
                that.addRotation(that.rotationStep * (Math.PI / 180));
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

        // reset rotationStep back to 1
        that.rotationStep = 1;

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

