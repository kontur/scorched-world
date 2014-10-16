# Grunt TODO


## src/js/CameraManager.js

-  **TODO** `(line 127)`  this implementation is just broken. period.
-  **TODO** `(line 128)`  initial idea was to translate world Y axis to cameraDolly vector, and use THREE.Matrix4().makeRotationAxis

## src/js/Game.js

-  **TODO** `(line 40)`  instead of x,z -15 those should be behind the player facing the direction of other players
-  **TODO** `(line 50)`  plenty of AI and animation logic

## src/js/Player.AIPlayer.js

-  **TODO** `(line 6)`  player AI
-  **TODO** `(line 7)`  player AI difficulty
-  **TODO** `(line 8)`  automated aiming and firing animations
-  **TODO** `(line 59)`  make this an actual animation, not just a plain set operation
-  **TODO** `(line 70)`  take the distance from this player to target, then cycle through provious shots, take the one with closest distance
-  **TODO** `(line 78)`  factor of randomness based on a) difficulty and b) percentual distance to target of previous shot
-  **TODO** `(line 100)`  even without a reference shot, the first shot should, depending on difficulty level, still somewhat
-  **TODO** `(line 107)`  clamp values to allowed orientations and forces - vertify these work as intended

## src/js/Player.Human.js

-  **TODO** `(line 37)`  improve rotating by adding additive rotation speed when key pressed continuously

## src/js/Player.js

-  **TODO** `(line 24)`  adjust fireForceFactor to ensure the other player is always hitable
-  **TODO** `(line 82)`  prevent multiple simultaneous projectiles in the air
-  **TODO** `(line 83)`  projectile mass has no effect

## src/js/Projectile.js

-  **TODO** `(line 29)`  implement drag factor into update
-  **TODO** `(line 38)`  this is a dirty hack to not get the player hit its immediate surroundings nor its own bounding box
-  **TODO** `(line 72)`  right now this works by shooting a ray down the z axis, but more ideally this would be a ray to the next
-  **TODO** `(line 110)`  this now only checks if the position of the projectile is in the bounding box of the player target

## src/js/Scene.js

-  **NOTE** `(line 101)`  this just emulates the {} hit object, but does not correspond to a similar object as if
-  **TODO** `(line 118)`  low priority: instead of just using the projectile position, aquire a definite terrain
-  **TODO** `(line 126)`  BAD practise to have this event trigger on window :/

## src/js/Terrain.js

-  **TODO** `(line 46)`  make these parameteres and frequencies more random still
-  **TODO** `(line 110)`  and b) make sure there is minimumDistance (percent of main area) between the players

## src/js/UI.js

-  **TODO** `(line 13)`  this resizing doesn't really work yet as intended; it stretches the scene

## src/js/Utils.js

-  **TODO** `(line 16)`  implement recursive search and recursive depth
-  **NOTE** `(line 45)`  There is the similar THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth)
