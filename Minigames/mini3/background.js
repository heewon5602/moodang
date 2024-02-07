
// Importing necessary modules and loaders
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.122/build/three.module.js';

import {math} from './math.js';

import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.122/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js';

// Defines a background module using an IIFE (Immediately Invoked Function Expression)
export const background = (() => {

  // Class for creating background clouds in the scene
  class BackgroundCloud {
    constructor(params) {
      // Parameters and properties for the cloud
      this.params_ = params;
      this.position_ = new THREE.Vector3();
      this.quaternion_ = new THREE.Quaternion();
      this.scale_ = 1.0;
      this.mesh_ = null;
      // Initiates model loading
      this.LoadModel_();
    }

    // Method for loading cloud models
    LoadModel_() {
      // Uses GLTFLoader to load 3D models
      const loader = new GLTFLoader();
      loader.setPath('./resources/Clouds/GLTF/');
      loader.load('Cloud' + math.rand_int(1, 3) + '.glb', (glb) => {
        // ... (Model loading and scene addition code)
        this.mesh_ = glb.scene;
        this.params_.scene.add(this.mesh_);

        this.position_.x = math.rand_range(0, 2000);
        this.position_.y = math.rand_range(100, 200);
        this.position_.z = math.rand_range(500, -1000);
        this.scale_ = math.rand_range(10, 20);

        const q = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
        this.quaternion_.copy(q);

        this.mesh_.traverse(c => {
          if (c.geometry) {
            c.geometry.computeBoundingBox();
          }

          let materials = c.material;
          if (!(c.material instanceof Array)) {
            materials = [c.material];
          }
  
          for (let m of materials) {
            if (m) {
              m.specular = new THREE.Color(0x000000);
              m.emissive = new THREE.Color(0x926621);
            }
          }    
          c.castShadow = true;
          c.receiveShadow = true;
        });
      });
    }
   // Method to update the cloud's position and appearance every frame
    Update(timeElapsed) {
      // ... (Code to move the clouds and update their position)
      if (!this.mesh_) {
        return;
      }

      this.position_.x -= timeElapsed * 10;
      if (this.position_.x < -100) {
        this.position_.x = math.rand_range(2000, 3000);
      }

      this.mesh_.position.copy(this.position_);
      this.mesh_.quaternion.copy(this.quaternion_);
      this.mesh_.scale.setScalar(this.scale_);
    }
  };

  // Class for creating random objects ('crap') in the scene
  class BackgroundCrap {
    constructor(params) {
      // Parameters and properties for the objects
      // ... (Similar setup to the BackgroundCloud class)
      this.params_ = params;
      this.position_ = new THREE.Vector3();
      this.quaternion_ = new THREE.Quaternion();
      this.scale_ = 1.0;
      this.mesh_ = null;

      this.LoadModel_();
    }
    // Method for loading random object models
    LoadModel_() {

      // Selects a random model from a list of assets and loads it
      // Uses FBXLoader for 3D models
      // ... (Code to set up FBXLoader and load the model)\
      const assets = [
        ['BedDouble.fbx', 0.1],
        ['Bookcase_Books.fbx', 0.2],
        ['Chair.fbx', 0.1],
        ['Desk.fbx', 0.1],
        ['NightStand.fbx', 0.2],
        ['OfficeChair.fbx', 0.1],
        ['Sofa.fbx', 0.1],
        ['Sofa2.fbx', 0.1],
        ['Sofa3.fbx', 0.1],
    ];

      const [asset, scale] = assets[math.rand_int(0, assets.length - 1)];

      const loader = new FBXLoader(); 
      loader.setPath('./resources/FurniturePack/FBX/');
      loader.load(asset, (fbx) => {
        this.mesh_ = fbx;
        this.params_.scene.add(this.mesh_);

        this.position_.x = math.rand_range(0, 2000);
        this.position_.z = math.rand_range(500, -1000);
        this.scale_ = scale;

        const q = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
        this.quaternion_.copy(q);

        this.mesh_.traverse(c => {

          if (c.material) {
            c.material = new THREE.MeshStandardMaterial({
              color: 0xffffff, 
            });
          }
          c.castShadow = true;
          c.receiveShadow = true;

        });
      });
    }

    // Method to update the objects' position and appearance every frame
    Update(timeElapsed) {
      // ... (Similar update code as in the BackgroundCloud class)
      if (!this.mesh_) {
        return;
      }

      this.position_.x -= timeElapsed * 10;
      if (this.position_.x < -100) {
        this.position_.x = math.rand_range(2000, 3000);
      }

      this.mesh_.position.copy(this.position_);
      this.mesh_.quaternion.copy(this.quaternion_);
      this.mesh_.scale.setScalar(this.scale_);
    }
  };

  // The Background class that manages both clouds and other objects
  class Background {
    constructor(params) {
      this.params_ = params;
      this.clouds_ = [];
      this.crap_ = [];

      // Spawn initial set of clouds and objects
      this.SpawnClouds_();
      this.SpawnCrap_();
    }

    // Method to create a number of cloud instances
    SpawnClouds_() {
      // ... (Code to create multiple cloud instances)
      for (let i = 0; i < 25; ++i) {
        const cloud = new BackgroundCloud(this.params_);

        this.clouds_.push(cloud);
      }
    }

    // Method to create a number of random object instances
    SpawnCrap_() {
      // ... (Code to create multiple random object instances)
      for (let i = 0; i < 50; ++i) {
        const crap = new BackgroundCrap(this.params_);

        this.crap_.push(crap);
      }
    }

    // Method called each frame to update all clouds and objects
    Update(timeElapsed) {
      // ... (Code to iterate over and update each cloud and object)
      for (let c of this.clouds_) {
        c.Update(timeElapsed);
      }
      for (let c of this.crap_) {
        c.Update(timeElapsed);
      }
    }
  }
// The module returns an object with the Background class, making it available for import
  return {
      Background: Background,
  };
})();