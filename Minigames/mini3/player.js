// Importing the THREE.js library and FBXLoader for loading 3D models.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js';


// The player module is encapsulated in an Immediately-Invoked Function Expression (IIFE) and exported.
export const player = (() => {
// The Player class handles the main player character's functionality.
  class Player {
    constructor(params) {
      // Initial position and velocity are set.
      this.position_ = new THREE.Vector3(0, 0, 0);
      this.velocity_ = 0.0;
      
      // A bounding box for collision detection.
      this.playerBox_ = new THREE.Box3();
       // Params typically include a reference to the scene.
      this.params_ = params;

      // Calls the LoadModel method to load the player's 3D model.
      this.LoadModel_();
      // Initializes input handling.
      this.InitInput_();
    }


    // Method to load the player model using FBXLoader.
    LoadModel_() {
      const loader = new FBXLoader();
      loader.setPath('./resources/Men/FBX/');
      loader.load('Smooth_Male_LongSleeve.fbx', (fbx) => {
        // ... (Code to adjust model scale, orientation, and setup materials and shadows)
        fbx.scale.setScalar(0.0050);
        fbx.quaternion.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), Math.PI / 2);

        this.mesh_ = fbx;
        this.params_.scene.add(this.mesh_);

        fbx.traverse(c => {
          let materials = c.material;
          if (!(c.material instanceof Array)) {
            materials = [c.material];
          }
  
          for (let m of materials) {
            if (m) {
              m.specular = new THREE.Color(0x000000);
              m.color.offsetHSL(0, 0, 0.25);
            }
          }    
          c.castShadow = true;
          c.receiveShadow = true;
        });

        const m = new THREE.AnimationMixer(fbx);
        this.mixer_ = m;

        for (let i = 0; i < fbx.animations.length; ++i) {
          if (fbx.animations[i].name.includes('Run')) {
            const clip = fbx.animations[i];
            const action = this.mixer_.clipAction(clip);
            action.play();
          }
        }
      });
    }

    // Sets up event listeners for keyboard input.
    InitInput_() {
      // Stores the state of relevant keys.
      this.keys_ = {
          spacebar: false,
      };
      this.oldKeys = {...this.keys_};

      // Event listeners for keydown and keyup to handle input.
      document.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
      document.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
    }

    // Event handler for when a key is pressed.
    OnKeyDown_(event) {
      // ... (Code to set the state of spacebar key when pressed)
      switch(event.keyCode) {
        case 32:
          this.keys_.space = true;
          break;
      }
    }

    // Event handler for when a key is released.
    OnKeyUp_(event) {
      // ... (Code to reset the state of spacebar key when released)
      switch(event.keyCode) {
        case 32:
          this.keys_.space = false;
          break;
      }
    }

    // Checks for collisions between the player and world colliders.
    // 상자와 부딪혔을때 게임오버
    CheckCollisions_() {
      // ... (Code to get colliders from the world and check if they intersect with the player)
      const colliders = this.params_.world.GetColliders();

      //const score = 
      this.score = this.params_.world.GetScore();
      //console.log("score : "+score);
      this.playerBox_.setFromObject(this.mesh_);

      for (let c of colliders) {
        const cur = c.collider;

        if (cur.intersectsBox(this.playerBox_)) {
          this.gameOver = true;
        } else if (this.score >= 500) {
          this.gameOver = true;
        }
      }
    }

     // Update method called on each frame to update the player's state.
    Update(timeElapsed) {
      // ... (Code handling jumping mechanics based on spacebar input and collision detection)
      if (this.keys_.space && this.position_.y == 0.0) {
        this.velocity_ = 30;
      }

      const acceleration = -75 * timeElapsed;

      this.position_.y += timeElapsed * (
          this.velocity_ + acceleration * 0.5);
      this.position_.y = Math.max(this.position_.y, 0.0);

      this.velocity_ += acceleration;
      this.velocity_ = Math.max(this.velocity_, -100);

      if (this.mesh_) {
        this.mixer_.update(timeElapsed);
        this.mesh_.position.copy(this.position_);
        this.CheckCollisions_();
      }
    }
  };
  
  // The module returns an object containing the Player class, allowing it to be imported and used elsewhere.
  return {
      Player: Player,
  };
})();