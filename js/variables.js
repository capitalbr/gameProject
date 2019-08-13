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

  