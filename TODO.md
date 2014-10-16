#3D mortar game

##Top level to-do's
* basic UI for player controls
* camera controls (set camera behind player with mouse interaction for mouse angle tilt)
* basic opponent AI

###Improvement from crude initial implementations
* player position centerish on the map and not too close to each other
* player controls for firing projectiles
* player / AI visual distinction
* AI mustn't shoot into immediate surrounding terrain walls (kill itself) > base random rotation on average face normal
* refactor event system and avoid having events on $(window)

####Low priority cool to have
* seemingly endless terrain around the arena
* player models imported form obj files
* aiming guide vectors / trajectories
* player names / life hovering above player objects
* world environment (wind, fog) a) visually and b) affecting ballistics

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