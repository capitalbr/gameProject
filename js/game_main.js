

import * as THREE from 'three';
import * as CANNON from 'cannon';
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
let velocity2 = new THREE.Vector3();
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

let action;
let mouseDown = false;

let cameraHolder;
let axis;
//TESTING

let main
let forward = false;
let back = false;
let left = false;
let right = false;
let strafeL = false;
let strafeR = false;
let jumpAllow = false;

//SHOOTING
let world;
let physicsMaterial;
let sphereShape;
let sphereBody;
let balls = [];
let material2;
let ballMeshes = [], boxes = [], boxMeshes = [];
let dt = 1 / 60;
let ballShape = new CANNON.Sphere(0.2);
let ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
let shootDirection = new THREE.Vector3();
let shootVelo = 950;
  // var projector = new THREE.Projector();



function initCannon(mainCharacter) {
  // Setup our world
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  var solver = new CANNON.GSSolver();

  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  solver.iterations = 7;
  solver.tolerance = 0.1;
  var split = true;
  if (split)
    world.solver = new CANNON.SplitSolver(solver);
  else
    world.solver = solver;

  world.gravity.set(0, -20, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // Create a slippery material (friction coefficient = 0.0)
  physicsMaterial = new CANNON.Material("slipperyMaterial");
  var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
    physicsMaterial,
    0.0, // friction coefficient
    0.3  // restitution
  );
  // We must add the contact materials to the world
  world.addContactMaterial(physicsContactMaterial);

  // Create a sphere (PHYSICS FOR THE MAINCHARACTER WHO IS JUST AN INVISIBLE SPHERE)
  var mass = 5, radius = 1.3;
  sphereShape = new CANNON.Sphere(radius);
  sphereBody = new CANNON.Body({ mass: mass });
  sphereBody.addShape(sphereShape);
  // sphereBody.position.set(0, 5, 0);
  sphereBody.position.set(mainCharacter.scene.position.x, mainCharacter.scene.position.y, mainCharacter.scene.position.z);
  sphereBody.linearDamping = 0.9;
  world.add(sphereBody);
}

 

function getShootDir(targetVec) {
  var vector = targetVec;
  targetVec.set(0, 0, 1);
  vector.unproject(camera);
  var ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize());
  targetVec.copy(ray.direction);
}

window.addEventListener("click", function (e) {
  // if (controls.enabled == true) {
    var x = sphereBody.position.x;
    var y = sphereBody.position.y;
    var z = sphereBody.position.z;
    console.log(`xyx ${x}, ${y}, ${z}`)
    this.console.log(`mainCharacter ${mainCharacter.scene.position.x}, ${mainCharacter.scene.position.y}, ${mainCharacter.scene.position.z}`)
    var ballBody = new CANNON.Body({ mass: 0.00000000000000001 });
    ballBody.addShape(ballShape);
    var randomColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    material2 = new THREE.MeshPhongMaterial({ color: randomColor });
    var ballMesh = new THREE.Mesh(ballGeometry, material2);
    world.add(ballBody);
    scene.add(ballMesh);
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;
    balls.push(ballBody);
    ballMeshes.push(ballMesh);
    getShootDir(shootDirection);
    this.console.log(shootDirection);
    ballBody.velocity.set(shootDirection.x * shootVelo,
      shootDirection.y * shootVelo,
      shootDirection.z * shootVelo);

    // Move the ball outside the player sphere
    x += shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius);
    y += shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius);
    z += shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius);
    ballBody.position.set(x, y, z);
    ballMesh.position.set(x, y, z);
  // }
});

//END SHOOTING



const deleteObAddOb = (name, ObToAdd) => {
  let ObToDel = scene.getObjectByName(name);
  if (ObToDel) {
    scene.remove(ObToDel);
  }
  scene.add(ObToAdd);
}


const characterCreator = () => {
 
  // let loader = new GLTFLoader();
  // loader.load('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/mainCharWorkingReadyForExportWithNLH.glb', function (gltf) {
  let loader = new GLTFLoader().setPath('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/');
  loader.load('mainCharWorkingReadyForExportWithNLH.glb', function (gltf) {
    
   
    mainCharacter = gltf;
    mainCharacter.scene.scale.set(3, 3, 3);
    mainCharacter.aHash = {};
    mainCharacter.animations.forEach(a => {
      if (
      a.name === "TPose" || a.name === "Strafe2" || a.name === "RunBackwards" ||
      a.name === "Idle" || a.name === "StrafeLeft" || a.name === "Run" ||
      a.name === "GunPlay"
      ) {
        mainCharacter.aHash[a.name] = a;
      }

    });

    mixer = new THREE.AnimationMixer(mainCharacter.scene);
    let action = mixer.clipAction(mainCharacter.aHash.Idle);
    action.play();
    
    mainCharacter.scene.traverse(function (child) {
      if (child.isMesh) {

        child.castShadow = true;
        child.receiveShadow = true;

      }

    });
    // characters.mainCharacter = mainCharacter;
    // camera.lookAt(mainCharacter.scene);

     // POINTERLOCK
    // controls = new PointerLockControls(camera);

    // let instructions = document.getElementById('instructions');

    // document.addEventListener('click', function () {

    //   controls.lock();

    // });

    // scene.add(controls.getObject());
  // END POINTERLOCK


    
    cameraHolder.position.set(0, 0, -20);
    axis = new THREE.Vector3(mainCharacter.scene.position.x, mainCharacter.scene.position.y, mainCharacter.scene.position.z);
    // cameraHolder.rotateOnAxis(axis, 0.1);
    camera.position.set(0, 10, 0);
    cameraHolder.add(camera);
    cameraHolder.lookAt(scene.position);
    // cameraHolder.rotateY(110);
    camera.rotateY(110);
    scene.add(cameraHolder);
    // camera.rotateOnAxis(mainCharacter.scene.position, 1);
    mainCharacter.scene.position.set(0, 0, 0);
    mainCharacter.scene.add(cameraHolder);
    scene.add(mainCharacter.scene);
    initCannon(mainCharacter);

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

document.addEventListener("DOMContentLoaded", function (event) {
  //do work
  animate();
});


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
  camera.position.y = 240;
  cameraHolder = new THREE.Object3D();
  cameraHolder.add(camera)

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog(0xffffff, 0, 750);

  let light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);
  let game = document.getElementById('game');

  // POINTERLOCK
  // controls = new PointerLockControls(camera);

  // let instructions = document.getElementById('instructions');

  // document.addEventListener('click', function () {

  //   controls.lock();

  // });

  // // controls.addEventListener('lock', function () {

  // //   instructions.style.display = 'none';
  // //   game.style.display = 'none';

  // // });

  // // controls.addEventListener('unlock', function () {

  // //   game.style.display = 'block';
  // //   instructions.style.display = '';

  // // });

  // scene.add(controls.getObject());
  // END POINTERLOCK

  let onKeyDown = function (e) {
    
    switch (e.keyCode) {

      case 87: // w
        forward = true;
        
        break;

      case 65: // a
        left = true;
       
        break;

      case 83: // s
        back = true;
        
        break;

      case 68: // d
        right = true;
        
        break;
      case 37:
        strafeL = true;

        break;
      case  39:
        strafeR = true;

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
       
        break;

      case 65: // a
        left = false;
        
        break;

      case 83: // s
        back = false;
        
        break;

      case 68: // d
        right = false;
        
        break;
      case 37:
        strafeL = false;

        break;
      case 39:
        strafeR = false;

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
  // floor.visible = false;
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

const playClip = (clip) => {
  
  if (action && action._clip.name !== clip) {
    action.enabled = false;
    action = mixer.clipAction(mainCharacter.aHash[clip]);
    action.play();
  } else {
    action = mixer.clipAction(mainCharacter.aHash[clip]);
    action.enabled = true;
    action.play();
  }
  
}


document.body.onmousedown = function () {
  mouseDown = true;
}
document.body.onmouseup = function () {
 mouseDown = false;
}


function animate() {

  requestAnimationFrame(animate);

  // if (controls.isLocked === true) {

    // raycaster.ray.origin.copy(controls.getObject().position);
    // raycaster.ray.origin.y -= 10;

    let time = performance.now();
    let delta = (time - lastTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity2.x -= velocity2.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(forward) - Number(back);
    direction.x = Number(left) - Number(right);
    direction.x2 = Number(strafeL) - Number(strafeR);
    direction.normalize(); // this ensures consistent movements in all directions

    if (forward || back) velocity.z -= direction.z * 400.0 * delta;
    if (left || right) velocity.x -= direction.x * 400.0 * delta;
    if (strafeL || strafeR) velocity2.x -= direction.x2 * 400.0 * delta;

    // controls.getObject().translateX(velocity.x * delta);
    // controls.getObject().position.y += (velocity.y * delta);
    // controls.getObject().translateZ(velocity.z * delta);
    // debugger
    // mainCharacter.scene.translateX(velocity.x * delta);
    
    if (mainCharacter) {
      
      mainCharacter.scene.rotation.y += ((velocity.x * delta)/ 10);
      mainCharacter.scene.position.y += (velocity.y * delta);
      mainCharacter.scene.translateZ(velocity.z * delta * -1);
      mainCharacter.scene.translateX(velocity2.x * delta * -1);
      sphereBody.position.x = mainCharacter.scene.position.x;
      sphereBody.position.y = mainCharacter.scene.position.y + 10;
      sphereBody.position.z = mainCharacter.scene.position.z;
   
      let mType = "idle";
      if (forward) mType = {type: "forward"};
      if (left) mType = {type: "left"};
      if (right) mType = {type: "right"};
      if (back) mType = {type: "back"}; 
      if (strafeL) mType = {type: "strafeL"};
      if (strafeR) mType = {type: "strafeR"};
      switch (mType.type) {
        case "forward":
          playClip("Run");
          break;
        case "back":
          playClip("RunBackwards");
          break;
        case "left":
          playClip("StrafeLeft");
          break;
        case "right":
          playClip("Strafe2");
          break;
        case "strafeL":
          playClip("StrafeLeft");
          break;
        case "strafeR":
          playClip("Strafe2");
          break;
        default:
          if (mouseDown) {
            playClip("GunPlay")
          } else {
            playClip("Idle")
          }

      }

      // mainCharacter.scene.position.x = controls.getObject().position.x - 10;
      // mainCharacter.scene.position.y = controls.getObject().position.y;
      // mainCharacter.scene.position.z = controls.getObject().position.z -0.2;
      
      // mainCharacter.scene.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
      // mainCharacter.scene.rotateY(110);
    }
    // mainCharacter.bodyOrientation = 180;
    // let mcq = mainCharacter.quaternion.w;


    if (mainCharacter.scene.position.y < 0) {

      velocity.y = 0;
      mainCharacter.scene.position.y = 0;
      
      // if (mainCharacter) {
      //   mainCharacter.scene.position.y = 5;
      // } 

      jumpAllow = true;

    }

    lastTime = time;
    
    
   
  // }

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


  //CANNON
  world.step(dt);

  // Update ball positions
  for (var i = 0; i < balls.length; i++) {
    ballMeshes[i].position.copy(balls[i].position);
    ballMeshes[i].quaternion.copy(balls[i].quaternion);
  }
  //     if (count < 0) {
  //       debugger
  //       count = 400;
  //     }
  // count -= 1
  //END CANNON



  // renderer.render(scene, camera);
  renderer.render(scene, camera);

}


 // ALTERNATIVE POINTER ROTATE OBJECT
 // HAS TWO METHODS NOW ONE FOR CAMERA ROTATION NOT FINISHED
  // let pmp = {
  //     x: 0,
  //     y: 0
  //   };
  // let client = {
  //   x: 0
  // };
  // const convertToRadians = (angle) => {
  //   return angle * (Math.PI / 180);
  // }
  // document.onmousemove = (e) => {
  //   // debugger
  //   let dMove = {
  //     x: e.offsetX - pmp.x,
  //     y: e.offsetY - pmp.y
  //   };
    

  //   let drq = new THREE.Quaternion()
  //     .setFromEuler(new THREE.Euler(
  //       convertToRadians(dMove.y * -1), 
  //       convertToRadians(dMove.x * -1),
  //       0,
  //       'XYZ'
  //     ));
  //   let euler = new THREE.Euler(
  //     convertTo
  //   )
  //   // cameraHolder.quaternion.multiplyQuaternions(drq, cameraHolder.quaternion);
  //   // if (client.x > e.clientX){
  //   //   cameraHolder.rotation.y += .03;
  //   // } else {
  //   //   cameraHolder.rotation.y -= .03;
  //   // }
  //   // cameraHolder.quaternion.set(mainCharacter.scene.quaternion.x, mainCharacter.scene.quaternion.y, mainCharacter.scene.quaternion.z, mainCharacter.scene.quaternion.w);
  //   // cameraHolder.rotation.set(mainCharacter.scene.rotation.x, mainCharacter.scene.rotation.y, mainCharacter.scene.rotation.z);

  //   pmp = {
  //     x: e.offsetX,
  //     y: e.offsetY
  //   };
  //   client = {
  //     x: e.clientX
  //   }
  // };