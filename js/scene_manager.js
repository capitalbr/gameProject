import { HemisphereLight } from "./objects/hemisphere_light"
import AllSceneObjects from "./objects/all_scene_objects";
import dep from "./import"
const { THREE } = dep;
export default class SceneManager {
  constructor(game){
    this.game = game;
    this.clock = new THREE.Clock();
    this.screenDimensions = {
      width: this.game.width,
      height: this.game.height
    }
    this.scene = this.buildScene();
    this.camera = this.buildCamera(this.screenDimensions);
    this.AllSceneObjects = new AllSceneObjects(this.scene, this.camera);
    this.HemisphereLight = new HemisphereLight(this.scene);
    this.renderer = this.buildRender(this.screenDimensions);
    
    this.sceneObjects;
    

  }

  init() {
    this.AllSceneObjects.characterCreator();
    document.addEventListener('keydown', (e) => this.AllSceneObjects.onKeyDown(e, this.AllSceneObjects.returnMainChar), false);
    document.addEventListener('keyup', this.AllSceneObjects.onKeyUp, false);
    document.body.onmousedown = () => {
      this.AllSceneObjects.mouseDown = true;
    }
    document.body.onmouseup = () => {
      this.AllSceneObjects.mouseDown = false;
    }
 
  
  }

  buildScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    return scene;
  }

  buildRender({ width, height }) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    // const renderer = new THREE.WebGLRenderer({ game: this.game, antialias: true, alpha: true });
    const pixelRatio = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(pixelRatio);
    // renderer.setSize(width, height);
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.game.appendChild(renderer.domElement);
    // renderer.gammaInput = true;
    // renderer.gammaOutput = true;

    return renderer;
  }

  buildCamera({ width, height }) {
    const aspectRatio = width / height;
    const fov = 60;
    const near = 1;
    const far = 100;
    // const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 240;

    return camera;
  }

  createObjects() {
    
    this.scene.add(this.HemisphereLight.light);
    
    this.scene.add(this.AllSceneObjects.cameraHolder);
    this.scene.add(this.AllSceneObjects.returnMainChar().scene);
    this.scene.add(this.AllSceneObjects.returnMCGun().scene);
    this.scene.add(this.AllSceneObjects.returnIntergalacticShip().scene);
    this.scene.add(this.AllSceneObjects.returnEnergyBlast());

    const sceneObjects = [
      this.HemisphereLight,
      this.AllSceneObjects
    ];
    return sceneObjects;
  }

  update() {
    if (this.AllSceneObjects.returnMainChar() && this.AllSceneObjects.returnMainChar().scene) {
      if (!this.sceneObjects) {
        this.sceneObjects = this.createObjects();
      }
      console.log("finally entered")
      const elapsedTime = this.clock.getElapsedTime();
      for (let i = 0; i < this.sceneObjects.length; i++)
      this.sceneObjects[i].update(elapsedTime);
      
      this.renderer.render(this.scene, this.camera);
      
      return this.renderer
    }
}

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
