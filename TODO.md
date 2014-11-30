# TODOS (manually compiled list - see TODO-compiled.md for remarks left in the code for implementations that need improvement)

## Top level to-do's
* working opponent AI

## Important playability improvements
* when there is only AI players left alive, the UI should probably suggest a rematch
* differentiate projectile damage to not be just a plain binary 100 on hit or 0 on miss
* refactor some hit test and physics calculations to get better in-flight projectile performance  

### Improvement from crude initial implementations
* add different types of projectiles
* add feature detection and browser support information to UI
* camera control optionally with mouse
* player controls for firing projectiles (more than just visual indicators as is atm)
* player / AI visual distinction
* player name labels in the 3D world / life bars
* AI mustn't shoot into immediate surrounding terrain walls (kill itself) > base random rotation on average face normal
* refactor event system and avoid having events on $(window) (bad, bad, bad)
* better projectile and hit 3D models as well as animations
* visual indicator of dead players (when there is more than 2 players)

#### Low priority cool to have (for now)
* seemingly endless terrain around the arena (kinda there, needs proper styling)
* player models imported form obj files
* aiming guide vectors / trajectories (more interactive and styled than current rudimentary implementation)
* player names / life hovering above player objects
* world environment (wind, fog) a) visually and b) affecting ballistics

###### Far future cool ideas
* Online multiplayer
* App packaging for playing on mobile devices

## Bugs
- sometimes even a shot straight up that clearly should be a hit is not registered as such