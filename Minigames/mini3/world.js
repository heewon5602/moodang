// Import the necessary THREE.js library and the FBXLoader module for loading FBX models.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {math} from './math.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js';
import { player } from './player.js';

// The module is exported as an immediately invoked function expression (IIFE) that encapsulates the WorldManager class.
export const world = (() => {
  // Constants to define starting position and separation between objects.
  const START_POS = 100;
  const SEPARATION_DISTANCE = 20;

  // Class to represent individual world objects.
  class WorldObject {
    constructor(params) {
      // Initialize object position, rotation, scale, and collision bounds.
      this.position = new THREE.Vector3();
      this.quaternion = new THREE.Quaternion();
      this.scale = 1.0;
      this.collider = new THREE.Box3();

      this.params_ = params;
      // Load the 3D model for this object.
      this.LoadModel_();
    }

    LoadModel_() {
      // Loads the 3D model using FBXLoader.
      const loader = new FBXLoader();
      loader.setPath('./resources/FurniturePack/FBX/');
      loader.load('Desk.fbx', (fbx) => {
        // Once loaded, set scale and scene interaction settings.
        fbx.scale.setScalar(0.04);

        this.mesh = fbx;
        this.params_.scene.add(this.mesh);

        fbx.traverse(c => {
          if (c.geometry) {
            c.geometry.computeBoundingBox();
          }

          let materials = c.material;
          if (!(c.material instanceof Array)) {
            materials = [c.material];
          }
  
          for (let m of materials) {
            if (m) {
              // if (texture) {
              //   m.map = texture;
              // }
              m.specular = new THREE.Color(0x000000);
            }
          }    
          c.castShadow = true;
          c.receiveShadow = true;
        });
      });
    }

    // Updates the collision bounds to match the current object transform.
    UpdateCollider_() {
      this.collider.setFromObject(this.mesh);
    }

    // Update is called every frame to keep the object's transform in sync with the physics simulation.
    Update(timeElapsed) {
      // Update the mesh to match the position, rotation, and scale of this object.
      // Update the collider as well.
      if (!this.mesh) {
        return;
      }
      this.mesh.position.copy(this.position);
      this.mesh.quaternion.copy(this.quaternion);
      this.mesh.scale.setScalar(this.scale);
      this.UpdateCollider_();
    }
  }

  // Class to manage all of the world objects.
  class WorldManager {
    constructor(params) {
      // Arrays to store visible and unused objects for recycling.
      this.objects_ = [];
      this.unused_ = [];
      // The speed at which the objects will move towards the player.
      this.speed_ = 12;
      this.params_ = params;
      // Initial score variables.
      this.score_ = 0.0;
      this.scoreText_ = '00000';
      // Distance between objects.
      this.separationDistance_ = SEPARATION_DISTANCE;
    }

    // Returns the list of objects with colliders.
    GetColliders() {
      return this.objects_;
    }

    // Returns game score, check for game clear
    GetScore() {
      return this.score_;
    }

    // Calculate the position of the last object in the world to determine if a new object should spawn.
    LastObjectPosition_() {
      if (this.objects_.length == 0) {
        return SEPARATION_DISTANCE;
      }

      return this.objects_[this.objects_.length - 1].position.x;
    }

    // Spawns a new object at a set distance from the start position with a specific scale.
    SpawnObj_(scale, offset) {
      let obj = null;

      if (this.unused_.length > 0) {
        obj = this.unused_.pop();
        obj.mesh.visible = true;
      } else {
        obj = new WorldObject(this.params_);
      }

      obj.quaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2.0);
      obj.position.x = START_POS + offset;
      obj.scale = scale * 0.01;
      this.objects_.push(obj);
    }

    // Spawns a cluster of objects close to each other.
    SpawnCluster_() {
      const scaleIndex = math.rand_int(0, 1);
      const scales = [1, 0.5];
      const ranges = [2, 3];
      const scale = scales[scaleIndex];
      const numObjects = math.rand_int(1, ranges[scaleIndex]);

      for (let i = 0; i < numObjects; ++i) {
        const offset = i * 1 * scale;
        this.SpawnObj_(scale, offset);
      }
    }

    // Determines whether it's time to spawn a new object or cluster based on their separation distance.
    MaybeSpawn_() {
      const closest = this.LastObjectPosition_();
      if (Math.abs(START_POS - closest) > this.separationDistance_) {
        this.SpawnCluster_();
        this.separationDistance_ = math.rand_range(SEPARATION_DISTANCE, SEPARATION_DISTANCE * 1.5);
      }
    }

    // Update is called every frame and controls the spawning and movement of objects.
    Update(timeElapsed) {
      // Calls the MaybeSpawn_ method to determine if new objects should be spawned.
      // Update all colliders and the score.
      this.MaybeSpawn_();
      this.UpdateColliders_(timeElapsed);
      this.UpdateScore_(timeElapsed);
    }

    // Update the displayed score.
    UpdateScore_(timeElapsed) {

      // Increases the score based on the elapsed time and updates the score display text.
      this.score_ += timeElapsed * 10.0;

      const scoreText = Math.round(this.score_).toLocaleString(
          'en-US', {minimumIntegerDigits: 5, useGrouping: false});

      if (scoreText == this.scoreText_) {
        return;
      }

      document.getElementById('score-text').innerText = scoreText;

      if (this.score_ == 500) {
        player.gameOver = true;
      }
    }

    // Update the position of all colliders and remove any that have moved out of view.
    UpdateColliders_(timeElapsed) {
      const invisible = [];
      const visible = [];

      for (let obj of this.objects_) {
        obj.position.x -= timeElapsed * this.speed_;

        if (obj.position.x < -20) {
          invisible.push(obj);
          obj.mesh.visible = false;
        } else {
          visible.push(obj);
        }

        obj.Update(timeElapsed);
      }

      this.objects_ = visible;
      this.unused_.push(...invisible);
    }
  };
  
// Returns an object containing the WorldManager class for external use.
  return {
      WorldManager: WorldManager,
  };
})();