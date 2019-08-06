

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
let count = 500

let lastTime = performance.now();
let color = new THREE.Color();
let direction = new THREE.Vector3();
let vertex = new THREE.Vector3();
let velocity = new THREE.Vector3();
let camera, scene, renderer, controls, raycaster;

//TESTING
let mainCharacter;
//TESTING

let main
let forward = false;
let back = false;
let left = false;
let right = false;
let jumpAllow = false;

const characterCreator = () => {
  // let geo = new THREE.DodecahedronGeometry(0.2, 1);
  // let mat = new THREE.MeshStandardMaterial({ color: 0xe5f2f2, shading: THREE.FlatShading })
  
  // mainCharacter = new THREE.Mesh(geo, mat);



  var geometry = new THREE.BoxGeometry(1, 1, 10);
  THREE.ImageUtils.crossOrigin = '';
  var texture = THREE.ImageUtils.loadTexture('http://i.imgur.com/CEGihbB.gif');
  texture.anisotropy = renderer.getMaxAnisotropy();

  var material = new THREE.MeshFaceMaterial([
    new THREE.MeshBasicMaterial({
      color: 0x00ff00
    }),
    new THREE.MeshBasicMaterial({
      color: 0xff0000
    }),
    new THREE.MeshBasicMaterial({
      //color: 0x0000ff,
      map: texture
    }),
    new THREE.MeshBasicMaterial({
      color: 0xffff00
    }),
    new THREE.MeshBasicMaterial({
      color: 0x00ffff
    }),
    new THREE.MeshBasicMaterial({
      color: 0xff00ff
    })
  ]);


  mainCharacter = new THREE.Mesh(geometry, material);


  
  
  
  
  
  mainCharacter.receiveShadow = true;
  mainCharacter.castShadow = true;
  scene.add(mainCharacter);

  // not being used
  // mainCharacter.position.x = 3;
  // mainCharacter.rotation.x = Math.PI / 4;
  // mainCharacter.rotation.y = Math.PI / 4;

  // mainCharacter.position.y = 10;
  // mainCharacter.position.x = 3;
  // mainCharacter.position.z = 3;


}



init();

//TESTING
characterCreator();
//TESTING

animate();

function init() {

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.y = 10;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

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

    // mainCharacter.position.x += velocity.x * delta;
    // mainCharacter.position.y += velocity.y * delta;
    // mainCharacter.position.z += velocity.z * delta;

    mainCharacter.position.x = controls.getObject().position.x;
    mainCharacter.position.y = controls.getObject().position.y -1.5;
    mainCharacter.position.z = controls.getObject().position.z;

    mainCharacter.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);

    if (controls.getObject().position.y < 10) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      // TESTING
      mainCharacter.position.y = 10 -1.5;
      // TESTING

      jumpAllow = true;

    }

    lastTime = time;
    
    if (count < 0){
      //  debugger
    }
      count -= 1
   
  }


  renderer.render(scene, camera);

}

