# Grunt TODO


## src/js/CameraManager.js

-  **TODO** `(line 4)`  logic for not allowing the camera to penetrate the terrain, i.e. calculate the actual distance between
-  **TODO** `(line 7)`  keep minimum distance to lookat, for example when a projectile fires past the camera, it rotates too fast
-  **TODO** `(line 126)`  gradual and tweened rotation changes
-  **TODO** `(line 177)`  replace 0.1 with dynamic accelarerated / eased value
-  **TODO** `(line 295)`  speed up / ease in out

## src/js/Game.js

-  **TODO** `(line 51)`  instead of x,z -15 those should be behind the player FACING THE DIRECTION of other players (or previous
-  **TODO** `(line 57)`  eventually store each player's own last camera rotation and set it here when their turn starts
-  **TODO** `(line 65)`  plenty of AI and animation logic

## src/js/Player.AIPlayer.js

-  **TODO** `(line 6)`  player AI
-  **TODO** `(line 7)`  player AI difficulty
-  **TODO** `(line 8)`  automated aiming and firing animations
-  **TODO** `(line 59)`  make this an actual animation, not just a plain set operation
-  **TODO** `(line 67)`  take the distance from this player to target, then cycle through provious shots, take the one with closest distance
-  **TODO** `(line 75)`  factor of randomness based on a) difficulty and b) percentual distance to target of previous shot
-  **TODO** `(line 97)`  even without a reference shot, the first shot should, depending on difficulty level, still somewhat
-  **TODO** `(line 104)`  clamp values to allowed orientations and forces - vertify these work as intended

## src/js/Player.js

-  **TODO** `(line 99)`  prevent multiple simultaneous projectiles in the air
-  **TODO** `(line 100)`  projectile mass has no effect
-  **TODO** `(line 239)`  visually signify player having lost

## src/js/Projectile.js

-  **TODO** `(line 29)`  implement drag factor into update
-  **TODO** `(line 38)`  this is a dirty hack to not get the player hit its immediate surroundings nor its own bounding box
-  **TODO** `(line 72)`  right now this works by shooting a ray down the z axis, but more ideally this would be a ray to the next
-  **TODO** `(line 110)`  this now only checks if the position of the projectile is in the bounding box of the player target

## src/js/Scene.js

-  **NOTE** `(line 99)`  this just emulates the {} hit object, but does not correspond to a similar object as if
-  **TODO** `(line 117)`  low priority: instead of just using the projectile position, aquire a definite terrain
-  **TODO** `(line 125)`  BAD practise to have this event trigger on window :/

## src/js/Terrain.js

-  **TODO** `(line 46)`  make these parameteres and frequencies more random still

## src/js/Utils.js

-  **TODO** `(line 16)`  implement recursive search and recursive depth
-  **NOTE** `(line 45)`  There is the similar THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth)
