#3D mortar game

##Top level to-do's
* generate terrain
* basic UI for player controls
* physics for shooting projectiles
* camera controls (set camera behind player with mouse interaction for mouse angle tilt)
* basic opponent AI
* target hit logic

###Improvement from crude initial implementations
* player position centerish on the map and not too close to each other
* player controls for firing projectiles
* player / AI visual distinction
* better noise based terrain generation

####Low priority cool to have
* seemingly endless terrain around the arena
* player models imported form obj files
* aiming guide vectors / trajectories
* player names / life hovering above player objects


##Game flow
* As long as neither player is below 0 life:
    * Takes turns, a turn consists of:
    * Camera zoom to player
    * Player aims
    * Player fires
        * Calculate player damage, then either:
            * Next players turn
            * End game with winner
            [* Draw if both players have < 0 life]