

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let count = 500

let lastTime = performance.now();
let color = new THREE.Color();
let direction = new THREE.Vector3();
let vertex = new THREE.Vector3();
let velocity = new THREE.Vector3();
let camera, scene, renderer, controls, raycaster;

//TESTING
let mainCharacter, mainCharacterRunBackwards, mainCharacterStandStill;
let mainCharacterStrafe1, mainCharacterStrafe2, mainCharacterGun;
let clock = new THREE.Clock();
let mixer, mixerMCRun, mixerMCSS, mixerS1, mixerS2, mixerG;
let mirrorCube, mirrorCubeCamera; // for mirror material
let mirrorSphere, mirrorSphereCamera; // for mirror material

const characters = {};
let currentCharacter;
let prevCharacter;
//TESTING

let main
let forward = false;
let back = false;
let left = false;
let right = false;
let jumpAllow = false;


const deleteObAddOb = (name, ObToAdd) => {
  let ObToDel = scene.getObjectByName(name);
  if (ObToDel) {
    scene.remove(ObToDel);
  }
  scene.add(ObToAdd);
}


const characterCreator = () => {
 
  let loader = new GLTFLoader().setPath('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/');
  // let loader = new GLTFLoader();
  loader.load('mainCharWorkingReadyForExportWithNLH.glb', function (gltf) {
    // debugger
    // gltf.scene.scale.set(.4, .4, .4);  
    mainCharacter = gltf;
    mixer = new THREE.AnimationMixer(mainCharacter.scene);
    let action = mixer.clipAction(mainCharacter.animations[0]);
    action.play();
    
    mainCharacter.scene.traverse(function (child) {
      if (child.isMesh) {

        child.castShadow = true;
        child.receiveShadow = true;

      }

    });
    characters.mainCharacter = mainCharacter;
    scene.add(mainCharacter.scene);

  }, undefined, function (error) {

     console.error(error);

  });
  // let loader = new FBXLoader();
  // loader.load('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/Rifle+Run.fbx', (object) => {
  //   console.log(object)
  //   object.scale.set(.4, .4, .4);
  //   mainCharacter = object;
  //   mixer = new THREE.AnimationMixer(mainCharacter);

  //   let action = mixer.clipAction(mainCharacter.animations[0]);
  //   action.play();

  //   mainCharacter.traverse(function (child) {

  //     if (child.isMesh) {

  //       child.castShadow = true;
  //       child.receiveShadow = true;

  //     }

  //   });
  //   characters.mainCharacter = mainCharacter;
  //   scene.add(mainCharacter);

  // }, undefined, function (error) {
   
  //   console.error(error);

  // });
  // let loader2 = new FBXLoader();
  // loader2.load('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/Backwards+Rifle+Run.fbx', (object) => {
  //   object.scale.set(.4, .4, .4);
  //   mainCharacterRunBackwards = object;
  //   mixerMCRun = new THREE.AnimationMixer(mainCharacterRunBackwards);

  //   let action = mixerMCRun.clipAction(mainCharacterRunBackwards.animations[0]);
  //   action.play();

  //   mainCharacterRunBackwards.traverse(function (child) {
  //     if (child.isMesh) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });

  //   characters.mainCharacterRunBackwards = mainCharacterRunBackwards;
  //   // scene.add(mainCharacterRunBackwards);
  // }, undefined, function (error) {
  //   console.error(error);
  // });
  // let loader3 = new FBXLoader();
  // loader3.load("https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/Idle+Aiming.fbx", (object) => {
  //   object.scale.set(.4, .4, .4);
  //   mainCharacterStandStill = object;
  //   mixerMCSS = new THREE.AnimationMixer(mainCharacterStandStill);

  //   let action = mixerMCSS.clipAction(mainCharacterStandStill.animations[0]);
  //   action.play();

  //   mainCharacterStandStill.traverse(function (child) {
  //     if (child.isMesh) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });

  //   characters.mainCharacterStandStill = mainCharacterStandStill;
  //   // scene.add(mainCharacterStandStill);
  // }, undefined, function (error) {
  //   console.error(error);
  // });
  // let loader4 = new FBXLoader();
  // loader4.load("https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/Strafe+(1).fbx", (object) => {
  //   object.scale.set(.4, .4, .4);
  //   mainCharacterStrafe1 = object;
  //   mixerS1 = new THREE.AnimationMixer(mainCharacterStrafe1);

  //   let action = mixerS1.clipAction(mainCharacterStrafe1.animations[0]);
  //   action.play();

  //   mainCharacterStrafe1.traverse(function (child) {
  //     if (child.isMesh) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });

  //   characters.mainCharacterStrafe1= mainCharacterStrafe1;
  //   // scene.add(mainCharacterStrafe1);
  // }, undefined, function (error) {
  //   console.error(error);
  // });
  // let loader5 = new FBXLoader();
  // loader5.load("https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/Strafe+(2).fbx", (object) => {
  //   object.scale.set(.4, .4, .4);
  //   mainCharacterStrafe2 = object;
  //   mixerS2 = new THREE.AnimationMixer(mainCharacterStrafe2);

  //   let action = mixerS2.clipAction(mainCharacterStrafe2.animations[0]);
  //   action.play();

  //   mainCharacterStrafe2.traverse(function (child) {
  //     if (child.isMesh) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });

  //   characters.mainCharacterStrafe2 = mainCharacterStrafe2;
  //   // scene.add(mainCharacterStrafe2);
  // }, undefined, function (error) {
  //   console.error(error);
  // });
  // let loader6 = new FBXLoader();
  // loader6.load("https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/rifle+futuristic+suppressed.FBX", (object) => {
  //   object.scale.set(.4, .4, .4);
  //   mainCharacterGun = object;
  //   mixerG = new THREE.AnimationMixer(mainCharacterGun);

  //   let action = mixerG.clipAction(mainCharacterGun.animations[0]);
  //   action.play();

  //   mainCharacterGun.traverse(function (child) {
  //     if (child.isMesh) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });

  //   characters.mainCharacterGun = mainCharacterGun;
  //   // scene.add(mainCharacterGun);
  // }, undefined, function (error) {
  //   console.error(error);
  // });


  // COLLADA
  // let loadingManager = new THREE.LoadingManager(function () {
  //  
  //   mainCharacterStrafe1.scene.scale.set(.4, .4, .4);
    
  //   mixerS1 = new THREE.AnimationMixer(mainCharacterStrafe1);

  //   let action = mixerS1.clipAction(mainCharacterStrafe1.animations[0]);
  //   action.play();

  //   mainCharacterStrafe1.scene.children.forEach((child) => {
  //     if (child.isMesh) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });

  //   // characters.mainCharacterStrafe1= mainCharacterStrafe1;

  //   mainCharacterStrafe1 = mainCharacterStrafe1.scene;
  //   scene.add(mainCharacterStrafe1);

  // });

  // // collada

  // let cLoader = new ColladaLoader(loadingManager);
  // cLoader.load('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/Strafe.dae', function (collada) {

  //   mainCharacterStrafe1 = collada;

  // });
  // END COLLADA

  // mainCharacter = new THREE.Mesh(geometry, material);
  // mainCharacter.receiveShadow = true;
  // mainCharacter.castShadow = true;
  // scene.add(mainCharacter);

  // REFLECTIVE OBJECTS SECTION
  let cubeGeom = new THREE.CubeGeometry(100, 100, 10, 1, 1, 1);
  mirrorCubeCamera = new THREE.CubeCamera(0.1, 5000, 512);
  // mirrorCubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
  scene.add(mirrorCubeCamera);
  let mirrorCubeMaterial = new THREE.MeshBasicMaterial({ envMap: mirrorCubeCamera.renderTarget });
  mirrorCube = new THREE.Mesh(cubeGeom, mirrorCubeMaterial);
  mirrorCube.position.set(-75, 50, 0);
  // mirrorCubeCamera.position = mirrorCube.position;
  mirrorCubeCamera.position.set(-75, 50, 0);
  scene.add(mirrorCube);

  let sphereGeom = new THREE.SphereGeometry(50, 32, 16); // radius, segmentsWidth, segmentsHeight
  mirrorSphereCamera = new THREE.CubeCamera(0.1, 5000, 512);
  // mirrorCubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
  scene.add(mirrorSphereCamera);
  let mirrorSphereMaterial = new THREE.MeshBasicMaterial({ envMap: mirrorSphereCamera.renderTarget });
  mirrorSphere = new THREE.Mesh(sphereGeom, mirrorSphereMaterial);
  mirrorSphere.position.set(75, 50, 0);
  // mirrorSphereCamera.position = mirrorSphere.position;
  mirrorSphereCamera.position.set(75, 50, 0);
  scene.add(mirrorSphere);

}



init();

//TESTING
characterCreator();
//TESTING

animate();

// ATTEMPTS AT THIRD PERSON
// controls.add(mainCharacter)
// mainCharacter.add(controls);
// camera.lookAt(mainCharacter.position);
// let v = new THREE.Vector3();
// v.copy(camera.position);
// camera.localToWorld(v);
// mainCharacter.worldToLocal(v);

function init() {

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.y = 40;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog(0xffffff, 0, 750);

  let light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  controls = new PointerLockControls(camera);

  let game = document.getElementById('game');
  // let instructions = document.getElementById('instructions');

  document.addEventListener('click', function () {

    controls.lock();

  });

  // controls.addEventListener('lock', function () {

  //   instructions.style.display = 'none';
  //   game.style.display = 'none';

  // });

  // controls.addEventListener('unlock', function () {

  //   game.style.display = 'block';
  //   instructions.style.display = '';

  // });

  scene.add(controls.getObject());

  let onKeyDown = function (e) {
    
    switch (e.keyCode) {

      case 87: // w
        forward = true;
        currentCharacter = mainCharacter;
        break;

      case 65: // a
        left = true;
        currentCharacter = mainCharacterStrafe1;
        break;

      case 83: // s
        back = true;
        currentCharacter = mainCharacterRunBackwards;
        break;

      case 68: // d
        right = true;
        currentCharacter = mainCharacterStrafe2;
        break;

      case 32: // space
        if (jumpAllow === true) velocity.y += 350;
        jumpAllow = false;
        break;

    }

  };

  let onKeyUp = function (event) {

    switch (event.keyCode) {

      case 87: // w
        forward = false;
        currentCharacter = mainCharacterStandStill;
        break;

      case 65: // a
        left = false;
        currentCharacter = mainCharacterStandStill;
        break;

      case 83: // s
        back = false;
        currentCharacter = mainCharacterStandStill;
        break;

      case 68: // d
        right = false;
        currentCharacter = mainCharacterStandStill;
        break;

    }

  };

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);


  let floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
  floorGeometry.rotateX(- Math.PI / 2);


  let position = floorGeometry.attributes.position;

  for (let i = 0, l = position.count; i < l; i++) {

    vertex.fromBufferAttribute(position, i);

    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);

  }

  floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  position = floorGeometry.attributes.position;
  let colors = [];

  for (let i = 0, l = position.count; i < l; i++) {

    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    colors.push(color.r, color.g, color.b);

  }

  floorGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  let floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });

  let floor = new THREE.Mesh(floorGeometry, floorMaterial);
  scene.add(floor);



  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  game.appendChild(renderer.domElement);

  

  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);

  if (controls.isLocked === true) {

    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    let time = performance.now();
    let delta = (time - lastTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(forward) - Number(back);
    direction.x = Number(left) - Number(right);
    direction.normalize(); // this ensures consistent movements in all directions

    if (forward || back) velocity.z -= direction.z * 400.0 * delta;
    if (left || right) velocity.x -= direction.x * 400.0 * delta;

    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().position.y += (velocity.y * delta); // new behavior
    controls.getObject().translateZ(velocity.z * delta);
    
    // switch (currentCharacter) {
    //   case mainCharacter:
    //     if (!scene.getObjectByName(mainCharacter)) {
    //       deleteObAddOb(prevCharacter, currentCharacter);
    //     }
    //     break;
    //   case mainCharacterRunBackwards:
    //     if (!scene.getObjectByName(mainCharacterRunBackwards)) {
    //       deleteObAddOb(prevCharacter, currentCharacter);
    //     }
    //     break;
    //   case mainCharacterStandStill:
    //     if (!scene.getObjectByName(mainCharacterStandStill)) {
    //       deleteObAddOb(prevCharacter, currentCharacter);
    //     }
    //     break;
    //   case mainCharacterStrafe1:
    //     if (!scene.getObjectByName(mainCharacterStrafe1)) {
    //       deleteObAddOb(prevCharacter, currentCharacter);
    //     }
    //     break;
    //   case mainCharacterStrafe2:
    //     if (!scene.getObjectByName(mainCharacterStrafe2)) {
    //       deleteObAddOb(prevCharacter, currentCharacter);
    //     }
    //     break;
    //   default:
    //     // if (!scene.getObjectByName(mainCharacterStandStill)) {
    //     //   scene.add(mainCharacterStandStill);
    //     // }
    //     break;
    // }
  
    



    // steven tip
    // mainCharacter.position.x += velocity.x * delta;
    // mainCharacter.position.y += velocity.y * delta;
    // mainCharacter.position.z += velocity.z * delta;
    
    
    // working

    
    if (mainCharacter) {
      // debugger
      mainCharacter.scene.position.x = controls.getObject().position.x - 10;
      mainCharacter.scene.position.y = controls.getObject().position.y -1.5;
      mainCharacter.scene.position.z = controls.getObject().position.z -1;
      
      mainCharacter.scene.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
      mainCharacter.scene.rotateY(110);
    }
    
    if (mainCharacterRunBackwards) {
      mainCharacterRunBackwards.position.x = controls.getObject().position.x - 10;
      mainCharacterRunBackwards.position.y = controls.getObject().position.y - 1.5;
      mainCharacterRunBackwards.position.z = controls.getObject().position.z - 100;
      
      mainCharacterRunBackwards.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
      mainCharacterRunBackwards.rotateY(110);
    }

    if (mainCharacterGun) {
      mainCharacterGun.position.x = controls.getObject().position.x - 10;
      mainCharacterGun.position.y = controls.getObject().position.y - 1.5;
      mainCharacterGun.position.z = controls.getObject().position.z - 100;
      
      mainCharacterGun.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
      mainCharacterGun.rotateY(110);
    }

    if (mainCharacterStandStill) {
      mainCharacterStandStill.position.x = controls.getObject().position.x - 10;
      mainCharacterStandStill.position.y = controls.getObject().position.y - 1.5;
      mainCharacterStandStill.position.z = controls.getObject().position.z - 500;
      
      mainCharacterStandStill.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
      mainCharacterStandStill.rotateY(110);
    }

    if (mainCharacterStrafe1) {
      
      mainCharacterStrafe1.position.x = controls.getObject().position.x - 10;
      mainCharacterStrafe1.position.y = controls.getObject().position.y - 1.5;
      mainCharacterStrafe1.position.z = controls.getObject().position.z - 100;
      
      mainCharacterStrafe1.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
      mainCharacterStrafe1.rotateY(110);
    }

    if (mainCharacterStrafe2) {
      mainCharacterStrafe2.position.x = controls.getObject().position.x - 10;
      mainCharacterStrafe2.position.y = controls.getObject().position.y - 1.5;
      mainCharacterStrafe2.position.z = controls.getObject().position.z - 100;
      
      mainCharacterStrafe2.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
      mainCharacterStrafe2.rotateY(110);
    }


    // mainCharacter.bodyOrientation = 180;
    // let mcq = mainCharacter.quaternion.w;


    if (controls.getObject().position.y < 10) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      // TESTING
      if (mainCharacter) {
        mainCharacter.scene.position.y = 10 - 1.5;
      } else if (mainCharacterRunBackwards) {
        mainCharacterRunBackwards.position.y = 10 - 1.5;
      } else if (mainCharacterGun) {
        mainCharacterGun.position.y = 10 - 1.5;
      } else if (mainCharacterStrafe1) {
        mainCharacterStrafe1.position.y = 10 - 1.5;
      } else if (mainCharacterStrafe2) {
        mainCharacterStrafe2.position.y = 10 - 1.5;
      } else if (mainCharacterStandStill) {
        mainCharacterStandStill.position.y = 10 -1.5;
      }
      // TESTING

      jumpAllow = true;

    }

    lastTime = time;
    
    // if (count < 0){
    //   debugger
    //   count = 500;
    // }
    //   count -= 1
   
  }

  let delta2 = clock.getDelta();

  if (mixer) mixer.update(delta2);


  // REFLECTIVE OBJECTS
  mirrorCube.visible = false;
  mirrorCubeCamera.updateCubeMap(renderer, scene);
  mirrorCube.visible = true;

  mirrorSphere.visible = false;
  mirrorSphereCamera.updateCubeMap(renderer, scene);
  mirrorSphere.visible = true;
  // END REFLECTIVE OBJECTS


  // renderer.render(scene, camera);
  renderer.render(scene, camera);

}

