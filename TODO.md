# TODOS (manually compiled list - see TODO-compiled.md for remarks left in the code implementations that need improvement)

## Top level to-do's
* basic UI for player controls
* working opponent AI
* working logic for detecting a win in the game

### Improvement from crude initial implementations
* player position centerish on the map and not too close to each other
* player controls for firing projectiles (more than just visual indicators as is atm)
* player / AI visual distinction
* AI mustn't shoot into immediate surrounding terrain walls (kill itself) > base random rotation on average face normal
* refactor event system and avoid having events on $(window) (bad, bad, bad)
* better projectile and hit 3D models as well as animations
* browser resize should not scale the scene but re-format the layout

#### Low priority cool to have (for now)
* seemingly endless terrain around the arena (kinda there, needs proper styling)
* player models imported form obj files
* aiming guide vectors / trajectories (more interactive and styled than current rudimentary implementation)
* player names / life hovering above player objects
* world environment (wind, fog) a) visually and b) affecting ballistics

###### Far future cool ideas
* Online multiplayer
* App packaging for playing on mobile devices
