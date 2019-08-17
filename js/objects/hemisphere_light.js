import dep from "../import"
const { THREE } = dep;

export class HemisphereLight{
  constructor(scene){
    this.light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    this.light.position.set(0.5, 1, 0.75);
    // this.scene = scene;
    // this.scene.add(this.light);
  }
  update(time) {
  
  this.light.intensity = (Math.sin(time) + 1.5) / 1.5;
  this.light.color.setHSL(Math.sin(time), 0.5, 0.5);
  }
}
