
import dep from "./import"
import { create } from "domain";
const { THREE, CANNON, PointerLockControls, GLTFLoader, TWEEN, SkeletonUtils } = dep;
let cannonDebugRenderer;
let count = 5

let lastTime = performance.now();
let color = new THREE.Color();
let direction = new THREE.Vector3();
let vertex = new THREE.Vector3();
let velocity = new THREE.Vector3();
let velocity2 = new THREE.Vector3();
let camera, scene, renderer, controls, raycaster;

//TESTING
let mainCharacter, mainCharacterRunBackwards, mainCharacterStandStill, mCGun,
  intergalacticShip;
let mainCharacterStrafe1, mainCharacterStrafe2, mainCharacterGun;
let clock = new THREE.Clock();
let mixer, eMechMixer, mixerMCRun, mixerMCSS, mixerS1, mixerS2, mixerG;
let mirrorCube, mirrorCubeCamera; 
let mirrorSphere, mirrorSphereCamera; 

const characters = {};
let currentCharacter;
let prevCharacter;

let action, eMechAction;
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
let mCharacterShell;
let eMechShell;
let world;
let Material;
let mass = 5, radius = 3.2;
let MCShellBody = new CANNON.Body({ mass: mass });
let EMechShellBody = new CANNON.Body({ mass: mass });
let x, y, z;
let projectiles = [];
let projectileMaterial;
let projectileMeshes = [], boxes = [], boxMeshes = [];
let dt = 1 / 60;
let projectileShape = new CANNON.Sphere(1.2);
// let projectileShape = new CANNON.Sphere(10.2);
let projectileGeometry = new THREE.SphereGeometry(projectileShape.radius, 32, 32);
let currentAimDirection = new THREE.Vector3();
let projectileVelocity = 750;
let GSSolver = new CANNON.GSSolver();
let colorVariation;
//END SHOOTING

//PARTICLES
let energyBlast, eBlastAttrs;
// let particleTexture = THREE.ImageUtils.loadTexture('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/energyBlast.png');
let particleTexture = new THREE.TextureLoader().load('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/energyBlast.png');
//END PARTICLES

//ENEMIES
let enemyMech;
let tween;
let dead = false;
let deadx, deadz;
let kills = 0;
let cloneMixers = []; // All the THREE.AnimationMixer objects for all the animations in the scene
let numLoadedModels = 0;
//END ENEMIES




//SHOOTING
function initCannon(mainCharacter) {
  world = new CANNON.World();
  world.broadphase = new CANNON.NaiveBroadphase();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;
  world.gravity.set(0, -8, 0);
  world.defaultContactMaterial.contactEquationRelaxation = 4;
  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  
  GSSolver.iterations = 7;
  GSSolver.tolerance = 0.1;
  Material = new CANNON.Material("slipperyMaterial");
  let contactMat = new CANNON.ContactMaterial(Material,
    Material,
    0.0, 
    0.3  
  );
  world.addContactMaterial(contactMat);

  mCharacterShell = new CANNON.Sphere(radius);
  MCShellBody.addShape(mCharacterShell);
 
  MCShellBody.position.set(mainCharacter.scene.position.x, mainCharacter.scene.position.y, mainCharacter.scene.position.z);
  MCShellBody.linearDamping = 0.9;
  world.add(MCShellBody);

  eMechShell = new CANNON.Sphere(radius * 3);
  EMechShellBody.addShape(eMechShell);
  EMechShellBody.position.set(enemyMech.scene.position.x, enemyMech.scene.position.y, enemyMech.scene.position.z);
  EMechShellBody.linearDamping = 0.9;
  EMechShellBody.addEventListener("collide", function (e) {
    if (e.body.boundingRadius === 1.2) {
      
     
      dead = true;
      deadx = e.contact.bj.position.x;
      deadz = e.contact.bj.position.z;
      playClip(enemyMech, "Neck_Mech_Walker_by_3DHaupt|Broken_2", eMechAction, true);
      kills += 1;
    }
    
  });
  world.add(EMechShellBody);

  cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);


  mainCharacter.scene.add(mCGun.scene);
}

 

const aimDir = (currentAimDirection) => {
  let vector = currentAimDirection;
  currentAimDirection.set(0, 0, 1);
  vector.unproject(camera);
  let ray = new THREE.Ray(MCShellBody.position, vector.sub(MCShellBody.position).normalize());
  currentAimDirection.copy(ray.direction);
}


const handleShoot = (e) => {
  x = MCShellBody.position.x;
  y = MCShellBody.position.y;
  z = MCShellBody.position.z;
  let projectileBody = new CANNON.Body({ mass: 0.00000000000000001 });
  let energyBlast = new THREE.Object3D();
  // colorVariation = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  console.log(`xyx ${x}, ${y}, ${z}`)
  console.log(`mainCharacter ${mainCharacter.scene.position.x}, ${mainCharacter.scene.position.y}, ${mainCharacter.scene.position.z}`)
  
  projectileBody.addShape(projectileShape);
  

  eBlastAttrs = { startSize: [], startPosition: [], randomness: [] };

  let totalParticles = 125;
  let radiusRange = .6;
  for (let i = 0; i < totalParticles; i++) {
    let spriteMaterial = new THREE.SpriteMaterial({ map: particleTexture, useScreenCoordinates: false, color: 0xffffff });
    let sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.06, 0.03, 1.0); // imageWidth, imageHeight
    sprite.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    sprite.position.setLength( radiusRange * Math.random() );
    sprite.material.color.setHSL(Math.random(), 0.9, 0.7);
    sprite.material.blending = THREE.AdditiveBlending;
    energyBlast.add(sprite);
    eBlastAttrs.startPosition.push(sprite.position.clone());
    eBlastAttrs.randomness.push(Math.random());
  }




  world.add(projectileBody);
  scene.add(energyBlast);
  // energyBlast.castShadow = true;
  // energyBlast.receiveShadow = true;
  projectiles.push(projectileBody);
  projectileMeshes.push(energyBlast);
  
  if (projectiles.length > 5) {
    world.remove(projectiles.shift());
    scene.remove(projectileMeshes.shift());
  }
  aimDir(currentAimDirection);
  console.log(currentAimDirection);
  projectileBody.velocity.set(currentAimDirection.x * projectileVelocity,
    currentAimDirection.y * projectileVelocity,
    currentAimDirection.z * projectileVelocity);

  // to stop collisions with player that pushes character backwards
  x += currentAimDirection.x * (mCharacterShell.radius * 1.02 + projectileShape.radius);
  y += currentAimDirection.y * (mCharacterShell.radius * 1.02 + projectileShape.radius);
  z += currentAimDirection.z * (mCharacterShell.radius * 1.02 + projectileShape.radius);
  projectileBody.position.set(x, y, z);
  energyBlast.position.set(x, y, z);
}


//END SHOOTING



const deleteObAddOb = (name, ObToAdd) => {
  let ObToDel = scene.getObjectByName(name);
  if (ObToDel) {
    scene.remove(ObToDel);
  }
  scene.add(ObToAdd);
}



// CLONES
const createClones = (modelToClone, scene) => {

  let tempScene = SkeletonUtils.clone(modelToClone.scene);

  if (tempScene) {
    // enemyMech.scene.getObjectByName("RootNode")

    let tempMesh = tempScene.getObjectByName("RootNode");

    if (tempMesh) {

      let tempCloneMixer = chooseFirstMotion(tempMesh, modelToClone.animations, "Neck_Mech_Walker_by_3DHaupt|run");

      cloneMixers.push(tempCloneMixer);

    }
    scene.add(tempScene);

    tempScene.position.set(Math.random() * 10, 0, Math.random() * 10);
  }

}

const chooseFirstMotion = (tempMesh, animations, name) => {

  let tempMixer2 = new THREE.AnimationMixer(tempMesh);
  let clip = THREE.AnimationClip.findByName(animations, name);

  if (clip) {

    let tempAction = tempMixer2.clipAction(clip);
    tempAction.play();

  }

  return tempMixer2;

}

const characterCreator = () => {
 
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
    
    cameraHolder.position.set(0, 0, -7.5);
    axis = new THREE.Vector3(mainCharacter.scene.position.x, mainCharacter.scene.position.y, mainCharacter.scene.position.z);
    
    camera.position.set(0, 5.5, 0);
    cameraHolder.add(camera);
    cameraHolder.lookAt(scene.position);
    camera.rotateY(110);
    scene.add(cameraHolder);
   
    mainCharacter.scene.position.set(0, 0, 0);
    mainCharacter.scene.add(cameraHolder);
    scene.add(mainCharacter.scene);
    initCannon(mainCharacter);

  }, undefined, function (error) {

     console.error(error);

  });
  let loader2 = new GLTFLoader().setPath('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/');
  loader.load('rifle+futuristic+suppressed.glb', function (gltf) {
    mCGun = gltf;
    mCGun.scene.scale.set(20, 20, 20);
    // mCGun.scene.rotateY(90);
    mCGun.scene.rotateY(4.7);
    mCGun.scene.position.set(-.2, 2.6, 1.2);
    scene.add(mCGun.scene);
    

  }, undefined, function (error) {

    console.error(error);

  });
  
  let loader3 = new GLTFLoader().setPath('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/');
  loader3.load('Neck_Mech_Walker_by_3DHaupt-(FBX+7.4+binary+mit+Animation).glb', function (gltf) {
    enemyMech = gltf;
    enemyMech.scene.scale.set(2, 2, 2);

    enemyMech.aHash = {};
    enemyMech.animations.forEach(a => {
      enemyMech.aHash[a.name] = a;
    });

    
    eMechMixer = new THREE.AnimationMixer(enemyMech.scene);
    eMechAction = eMechMixer.clipAction(enemyMech.aHash["Neck_Mech_Walker_by_3DHaupt|All_Animations"]);
    eMechAction.play();



    // enemyMech.scene.rotateY(4.7);
    enemyMech.scene.position.set(0, 0, 20);
    scene.add(enemyMech.scene);
    
    // createClones(enemyMech, scene);

  }, undefined, function (error) {

    console.error(error);

  });

  loader.load('Hades_Carrier.glb', function (gltf) {
    intergalacticShip = gltf;
    intergalacticShip.scene.scale.set(6000, 6000, 6000);

    intergalacticShip.aHash = {};
    intergalacticShip.animations.forEach(a => {
      intergalacticShip.aHash[a.name] = a;
    });

    intergalacticShip.scene.rotateY(1.5);

    // eMechMixer = new THREE.AnimationMixer(intergalacticShip.scene);
    // eMechAction = eMechMixer.clipAction(intergalacticShip.aHash["Neck_Mech_Walker_by_3DHaupt|All_Animations"]);
    // eMechAction.play();



    // intergalacticShip.scene.rotateY(4.7);
    intergalacticShip.scene.position.set(-4000, 50, 100);
    scene.add(intergalacticShip.scene);


  });





  // REFLECTIVE OBJECTS SECTION
  let cubeGeom = new THREE.CubeGeometry(100, 100, 10, 1, 1, 1);
  mirrorCubeCamera = new THREE.CubeCamera(0.1, 5000, 512);
  scene.add(mirrorCubeCamera);
  let mirrorCubeMaterial = new THREE.MeshBasicMaterial({ envMap: mirrorCubeCamera.renderTarget });
  mirrorCube = new THREE.Mesh(cubeGeom, mirrorCubeMaterial);
  mirrorCube.position.set(-75, 50, 0);
  mirrorCubeCamera.position.set(-75, 50, 0);
  scene.add(mirrorCube);

  let sphereGeom = new THREE.SphereGeometry(50, 32, 16); 
  mirrorSphereCamera = new THREE.CubeCamera(0.1, 5000, 512);

  scene.add(mirrorSphereCamera);
  let mirrorSphereMaterial = new THREE.MeshBasicMaterial({ envMap: mirrorSphereCamera.renderTarget });
  mirrorSphere = new THREE.Mesh(sphereGeom, mirrorSphereMaterial);
  mirrorSphere.position.set(75, 50, 0);
 
  mirrorSphereCamera.position.set(75, 50, 0);
  scene.add(mirrorSphere);
}

//END CLONES



init();
characterCreator();
// createClones();



document.addEventListener("DOMContentLoaded", function (event) {
  animate();
});

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

  let onKeyDown = function (e, mainCharacter) {
    
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
      case 37:  // left arrow
        strafeL = true;

        break;
      case  39:  // right arrow
        strafeR = true;

        break;
      case 38:  // up arrow
        handleShoot(e);

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

  document.addEventListener('keydown', (e, mainCharacter) => onKeyDown(e, mainCharacter), false);
  document.addEventListener('keyup', onKeyUp, false);

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);


  let floorGeometry = new THREE.PlaneBufferGeometry(2000, 200, 1000, 1000);
  // let floorGeometry = new THREE.BoxGeometry(20, 20, 20);

  floorGeometry.rotateX(- Math.PI / 2);

  //TEXTURE LOADER 
  let textureLoader = new THREE.TextureLoader();
  let floorMaterial;
  textureLoader.load('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/cavefloor2_Base_Color.png', function (texture) {
    floorMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      // shading: THREE.FlatShading
    });
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);
  });



  //Background
  textureLoader.load('https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg', function (texture) {
    scene.background = texture;
  });


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

const playClip = (entity, clip, actionType, pause) => {
  let decider;
  let currentMixer;
  
  if (actionType === action) {
    decider = "action"
    currentMixer = mixer;
  } else {
    
    decider = "eMechAction"
    currentMixer = eMechMixer;
  }
  if (mixer) {

 
  }
  if (actionType && actionType._clip.name !== clip) {
    actionType.enabled = false;
    actionType = currentMixer.clipAction(entity.aHash[clip]);
    // actionType.play();
  } else {
    actionType = currentMixer.clipAction(entity.aHash[clip]);
    actionType.enabled = true;
    // actionType.play();
  }
  if (decider === "action") {
    action = actionType;
    action.play()
  } else {
    eMechAction = actionType;
    if (pause) {
      eMechAction.setLoop(THREE.LoopOnce);
      eMechAction.clampWhenFinished = true;
    }
    eMechAction.play();
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
    
    // mainCharacter.scene.translateX(velocity.x * delta);
    
    if (mainCharacter) {
     
      // if (count < 0) {
      //   debugger
      //   count = 500;
      // }
      // count -= 1

      mainCharacter.scene.rotation.y += ((velocity.x * delta)/ 10 * -1);
      mainCharacter.scene.position.y += (velocity.y * delta);
      mainCharacter.scene.translateZ(velocity.z * delta * -1);
      mainCharacter.scene.translateX(velocity2.x * delta * -1);
      MCShellBody.position.x = mainCharacter.scene.position.x;
      MCShellBody.position.y = mainCharacter.scene.position.y + 10;
      MCShellBody.position.z = mainCharacter.scene.position.z;

      
      
   
      let mType = "idle";
      if (forward) mType = {type: "forward"};
      if (left) mType = {type: "left"};
      if (right) mType = {type: "right"};
      if (back) mType = {type: "back"}; 
      if (strafeL) mType = {type: "strafeL"};
      if (strafeR) mType = {type: "strafeR"};
      switch (mType.type) {
        case "forward":
          playClip(mainCharacter, "Run", action);
          break;
        case "back":
          playClip(mainCharacter, "RunBackwards", action);
          break;
        case "left":
          playClip(mainCharacter, "StrafeLeft", action);
          break;
        case "right":
          playClip(mainCharacter, "Strafe2", action);
          break;
        case "strafeL":
          playClip(mainCharacter, "StrafeLeft", action);
          break;
        case "strafeR":
          playClip(mainCharacter, "Strafe2", action);
          break;
        default:
          if (mouseDown) {
            playClip(mainCharacter, "GunPlay", action)
          } else {
            playClip(mainCharacter, "Idle", action)
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


    if (mainCharacter && mainCharacter.scene.position.y < 0) {

      velocity.y = 0;
      mainCharacter.scene.position.y = 0;
      
      // if (mainCharacter) {
      //   mainCharacter.scene.position.y = 5;
      // } 

      jumpAllow = true;

    }

    if (enemyMech) {
      
      if (count < -100 && !dead) {
        tween = new TWEEN.Tween(enemyMech.scene.position)
          .to(mainCharacter.scene.position, 1400)
          .start();
      } else {
        if (tween){
          tween.stop();
          enemyMech.scene.position.x = deadx;
          enemyMech.scene.position.z = deadz;
        }
      }
      count -= 1

      // tween = new TWEEN.Tween(EMechShellBody.position)
      //   .to(mainCharacter.scene.position, 1400)
      //   .start();

      
      EMechShellBody.position.x = enemyMech.scene.position.x;
      EMechShellBody.position.y = enemyMech.scene.position.y + 10;
      EMechShellBody.position.z = enemyMech.scene.position.z;

      // enemyMech.scene.position.x = EMechShellBody.position.x;
      // enemyMech.scene.position.y = EMechShellBody.position.y;
      // enemyMech.scene.position.z = EMechShellBody.position.z;

      if (!dead) {
        playClip(enemyMech, "Neck_Mech_Walker_by_3DHaupt|run", eMechAction);
      } else {
        if (!enemyMech.deadCount) {
          enemyMech.deadCount = 100;
        }
        enemyMech.deadCount -= 1;
        if (enemyMech.deadCount === 0) {
          scene.remove(enemyMech.scene);
          world.remove(EMechShellBody);
        }
      }
    }

    if (intergalacticShip) {
       let dateOrbit = Date.now() * 0.0001;
      // intergalacticShip.scene.position.set(
      //   Math.cos(dateOrbit) * 300,
      //   100,
      //   Math.sin(dateOrbit) * 300
      // );
      intergalacticShip.scene.position.x += 2;
      intergalacticShip.scene.position.y = 100;
      intergalacticShip.scene.position.z = 300;
    }

    lastTime = time;
    
    
   
  // }

  let delta2 = clock.getDelta();

  if (mixer) mixer.update(delta2);
  if (eMechMixer) eMechMixer.update(delta2);


  // REFLECTIVE OBJECTS
  mirrorCube.visible = false;
  mirrorCubeCamera.updateCubeMap(renderer, scene);
  mirrorCube.visible = true;

  mirrorSphere.visible = false;
  mirrorSphereCamera.updateCubeMap(renderer, scene);
  mirrorSphere.visible = true;
  // END REFLECTIVE OBJECTS


  //CANNON
  if (world) {
    world.step(dt);
  }

  // Update ball positions
  for (let i = 0; i < projectiles.length; i++) {
    projectileMeshes[i].position.copy(projectiles[i].position);
    projectileMeshes[i].quaternion.copy(projectiles[i].quaternion);
    updateParticles(projectileMeshes[i]);
  }
  //END CANNON

  if (!dead) {
    TWEEN.update();
  }

  for (let i = 0; i < cloneMixers.length; ++i) {

    cloneMixers[i].update(delta2);

  }

  updateKills();
  // cannonDebugRenderer.update();
  renderer.render(scene, camera);
}

const updateParticles = (energyBlast) => {
  
  let timeForEBlast = 20 * clock.getElapsedTime();

  for (let x = 0; x < energyBlast.children.length; x++) {
    let sprite = energyBlast.children[x];

    let shakeFactor = 20;
    sprite.position.x += (Math.random() - 0.5) * shakeFactor;
    sprite.position.y += (Math.random() - 0.5) * shakeFactor;
    sprite.position.z += (Math.random() - 0.5) * shakeFactor;

    
    let y = eBlastAttrs.randomness[x] + 1.1;
    let pulsarFrequency = Math.sin(y * timeForEBlast) * 0.2 + 1.2;
    sprite.position.x = eBlastAttrs.startPosition[x].x * pulsarFrequency;
    sprite.position.y = eBlastAttrs.startPosition[x].y * pulsarFrequency;
    sprite.position.z = eBlastAttrs.startPosition[x].z * pulsarFrequency;
  }

  energyBlast.rotation.x = timeForEBlast * 0.5;
  energyBlast.rotation.y = timeForEBlast * 0.75;
	energyBlast.rotation.z = timeForEBlast * 1.0;
  
}

const updateKills = () => {
  let hud = document.getElementById("hud");
  hud.innerText = `${kills}`;
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