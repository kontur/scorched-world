# Scorched World
A simple Threejs / WebGL adaptation of the legendary round based artillery game Scorched Earth for DOS.

# Play now
You can play the current state of the game [online here](http://scorched-world.johannesneumeier.com/).

## About
This adaptation is a learning exercise in using Threejs and WebGL rendering that takes considerable creative freedom. 
 It is by no means complete nor claiming as refined a game play experience as its name sake. This demo was developed by 
 [Johannes Neumeier](http://johannesneumeier.com) and is MIT licensed, which means you can do whatever you want with the
 code as long as you keep a back reference to the original code.

### Compiling locally
* clone the repository: `$ git clone https://github.com/kontur/threejs-ballistics-game .`
* install node task runner dependencies `$ npm install`
* install front end dependencies `$ bower install`
* run grunt to recompile front end assets: `$ grunt watch` or explicitly `$ grunt`

#### Used libraries
* jQuery for UI interactions and events: https://github.com/jquery/jquery
* threejs for 3D scene: https://github.com/mrdoob/three.js/
* noisejs for generating perlin noise (used in terrain generation) https://github.com/xixixao/noisejs
* handlebars for some UI component rendering