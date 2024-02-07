
// Import the THREE.js module from jsDelivr CDN, as well as local modules for player, world, and background.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';
import {player} from './player.js';
import {world} from './world.js';
import {background} from './background.js';


// Vertex shader code for creating a gradient sky effect based on the position of vertices in the world space.
const _VS = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

// Fragment shader code for the gradient sky, interpolating colors based on the height of the vertex.
  const _FS = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;
varying vec3 vWorldPosition;
void main() {
  float h = normalize( vWorldPosition + offset ).y;
  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
}`;

// Shader code for Percentage-Closer Soft Shadows (PCSS) for more realistic shadow edges.
const _PCSS = `
#define LIGHT_WORLD_SIZE 0.05
#define LIGHT_FRUSTUM_WIDTH 3.75
#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
#define NEAR_PLANE 1.0

#define NUM_SAMPLES 17
#define NUM_RINGS 11
#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
#define PCF_NUM_SAMPLES NUM_SAMPLES

vec2 poissonDisk[NUM_SAMPLES];

void initPoissonSamples( const in vec2 randomSeed ) {
  float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
  float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

  // jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
  float angle = rand( randomSeed ) * PI2;
  float radius = INV_NUM_SAMPLES;
  float radiusStep = radius;

  for( int i = 0; i < NUM_SAMPLES; i ++ ) {
    poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
    radius += radiusStep;
    angle += ANGLE_STEP;
  }
}

float penumbraSize( const in float zReceiver, const in float zBlocker ) { // Parallel plane estimation
  return (zReceiver - zBlocker) / zBlocker;
}

float findBlocker( sampler2D shadowMap, const in vec2 uv, const in float zReceiver ) {
  // This uses similar triangles to compute what
  // area of the shadow map we should search
  float searchRadius = LIGHT_SIZE_UV * ( zReceiver - NEAR_PLANE ) / zReceiver;
  float blockerDepthSum = 0.0;
  int numBlockers = 0;

  for( int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++ ) {
    float shadowMapDepth = unpackRGBAToDepth(texture2D(shadowMap, uv + poissonDisk[i] * searchRadius));
    if ( shadowMapDepth < zReceiver ) {
      blockerDepthSum += shadowMapDepth;
      numBlockers ++;
    }
  }

  if( numBlockers == 0 ) return -1.0;

  return blockerDepthSum / float( numBlockers );
}

float PCF_Filter(sampler2D shadowMap, vec2 uv, float zReceiver, float filterRadius ) {
  float sum = 0.0;
  for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
    float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + poissonDisk[ i ] * filterRadius ) );
    if( zReceiver <= depth ) sum += 1.0;
  }
  for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
    float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + -poissonDisk[ i ].yx * filterRadius ) );
    if( zReceiver <= depth ) sum += 1.0;
  }
  return sum / ( 2.0 * float( PCF_NUM_SAMPLES ) );
}

float PCSS ( sampler2D shadowMap, vec4 coords ) {
  vec2 uv = coords.xy;
  float zReceiver = coords.z; // Assumed to be eye-space z in this code

  initPoissonSamples( uv );
  // STEP 1: blocker search
  float avgBlockerDepth = findBlocker( shadowMap, uv, zReceiver );

  //There are no occluders so early out (this saves filtering)
  if( avgBlockerDepth == -1.0 ) return 1.0;

  // STEP 2: penumbra size
  float penumbraRatio = penumbraSize( zReceiver, avgBlockerDepth );
  float filterRadius = penumbraRatio * LIGHT_SIZE_UV * NEAR_PLANE / zReceiver;

  // STEP 3: filtering
  //return avgBlockerDepth;
  return PCF_Filter( shadowMap, uv, zReceiver, filterRadius );
}
`;
// Helper function to retrieve the calculated shadow for a fragment in the shader.
const _PCSSGetShadow = `
return PCSS( shadowMap, shadowCoord );
`;

// The main class that initializes and runs the demo.
class BasicWorldDemo {
  constructor() {

    // Initial setup function is called.
    this._Initialize();
    // Flag to track if the game has started.
    this._gameStarted = false;
    // Event listener for a UI element that starts the game.
    document.getElementById('game-menu').onclick = (msg) => this._OnStart(msg);
  }

  // Function called when the game is intended to start, hiding the menu and setting the game start flag.
  _OnStart(msg) {
    document.getElementById('game-menu').style.display = 'none';
    this._gameStarted = true;
  }
  // The function where the Three.js environment is set up, including shaders, renderer, camera, lights, etc.
  _Initialize() {
    // Overwrites part of Three.js's shadow map code with custom PCSS shader code.
    let shadowCode = THREE.ShaderChunk.shadowmap_pars_fragment;

    shadowCode = shadowCode.replace(
        '#ifdef USE_SHADOWMAP',
        '#ifdef USE_SHADOWMAP' +
        _PCSS
    );

    shadowCode = shadowCode.replace(
        '#if defined( SHADOWMAP_TYPE_PCF )',
        _PCSSGetShadow +
        '#if defined( SHADOWMAP_TYPE_PCF )'
    );

    THREE.ShaderChunk.shadowmap_pars_fragment = shadowCode;
    // renderer
    // Setup of the WebGLRenderer with antialiasing enabled.
    this.threejs_ = new THREE.WebGLRenderer({
      antialias: true,
    });
    // Set various renderer properties related to color encoding and shadow maps.
    this.threejs_.outputEncoding = THREE.sRGBEncoding;
    this.threejs_.gammaFactor = 2.2;
    // this.threejs_.toneMapping = THREE.ReinhardToneMapping;
    this.threejs_.shadowMap.enabled = true;
    // this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
    this.threejs_.setPixelRatio(window.devicePixelRatio);
    this.threejs_.setSize(window.innerWidth, window.innerHeight);

    // Adding the canvas to the HTML container element and setting up resize event handling.
    document.getElementById('container').appendChild(this.threejs_.domElement);

    window.addEventListener('resize', () => {
      this.OnWindowResize_();
    }, false);

    // Camera setup with perspective projection.
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 20000.0;
    this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera_.position.set(-5, 5, 10);
    this.camera_.lookAt(8, 3, 0);

    // Scene setup including lights, ground, background color, and fog.
    this.scene_ = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        // ... additional light setup, including shadow configuration.
    // Ground plane setup with a standard material.
    light.position.set(60, 100, 10);
    light.target.position.set(40, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.far = 200.0;
    light.shadow.camera.near = 1.0;
    light.shadow.camera.left = 50;
    light.shadow.camera.right = -50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    this.scene_.add(light);

    light = new THREE.HemisphereLight(0x202020, 0x004080, 0.6);
    this.scene_.add(light);

    this.scene_.background = new THREE.Color(0x7F6000);
    this.scene_.fog = new THREE.FogExp2(0x89b2eb, 0.00125);
    // ... additional ground setup.
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20000, 20000, 10, 10),
        new THREE.MeshStandardMaterial({
            color: 0x764d14,
          }));              
    ground.castShadow = false;
    ground.receiveShadow = true;
    ground.rotation.x = -Math.PI / 2;
    this.scene_.add(ground);
    // Setup for the sky using a sphere geometry and custom shaders.
    const uniforms = {
      topColor: { value: new THREE.Color(0x0077FF) },
      bottomColor: { value: new THREE.Color(0x89b2eb) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };
    const skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: _VS,
        fragmentShader: _FS,
        side: THREE.BackSide,
    });
    this.scene_.add(new THREE.Mesh(skyGeo, skyMat));
    // Initializations for world, player, and background entities.
    this.world_ = new world.WorldManager({scene: this.scene_});
    this.player_ = new player.Player({scene: this.scene_, world: this.world_});
    this.background_ = new background.Background({scene: this.scene_});
    // Variables to keep track of the game state and initiate the render loop.
    this.gameOver_ = false;
    this.previousRAF_ = null;
    this.RAF_();
    this.OnWindowResize_();
  }

  // Handle window resizing, adjusting camera aspect ratio and renderer size.
  OnWindowResize_() {
    this.camera_.aspect = window.innerWidth / window.innerHeight;
    this.camera_.updateProjectionMatrix();
    this.threejs_.setSize(window.innerWidth, window.innerHeight);
  }

  // Render loop function that updates the game state and renders the scene.
  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      }

      this.RAF_();

      this.Step_((t - this.previousRAF_) / 1000.0);
      this.threejs_.render(this.scene_, this.camera_);
      this.previousRAF_ = t;
    });
  }

  // Function that handles the updates to the player, world, and background for each frame.
  Step_(timeElapsed) {
    if (this.gameOver_ || !this._gameStarted) {
      return;
    }

    this.player_.Update(timeElapsed);
    this.world_.Update(timeElapsed);
    this.background_.Update(timeElapsed);

    // Game Over
    if (this.player_.gameOver && !this.gameOver_) {

      if (this.player_.score >= 500) {
        this.gameOver_ = true;
        document.getElementById('game-clear').classList.toggle('active');
        alert("Game Clear !!"); 
		window.close();
		

      } else {
        
        this.gameOver_ = true;
        document.getElementById('game-over').classList.toggle('active');
		window.close();
      }
      window.close();
    }
  }
}

// Initialize the application when the DOM content is fully loaded.
let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new BasicWorldDemo();
});
