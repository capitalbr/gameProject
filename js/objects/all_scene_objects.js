import dep from "../import"
const { THREE, CANNON, PointerLockControls, GLTFLoader, TWEEN, SkeletonUtils } = dep;

class AllSceneObjects {
  constructor(scene, camera){
    // this.mixer;
    // this.action;
    // this.eMechAction;
    // this.eMechMixer;
    this.mainCharacter;
    // this.intergalacticShip;
    // this.mCGun;
    // this.enemyMech;

    this.direction = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.velocity2 = new THREE.Vector3();


    this.cameraHolder = new THREE.Object3D();
    this.camera = camera
    this.scene = scene
    this.loader = new GLTFLoader().setPath('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/');
    this.mouseDown = false;
    this.forward = false;
    this.back = false;
    this.left = false;
    this.right = false;
    this.strafeL = false;
    this.strafeR = false;
    this.jumpAllow = false;
    this.eBlastAttrs = { startSize: [], startPosition: [], randomness: [] };
    this.particleTexture = new THREE.TextureLoader().load('https://assets-yp9dzdxebv.s3.us-east-2.amazonaws.com/energyBlast.png');
    this.projectiles = [];
    this.projectileMeshes = []
    let mass = 5;
    this.MCShellBody = new CANNON.Body({ mass: mass });
    this.currentAimDirection = new THREE.Vector3();
    this.lastTime = performance.now();
    this.world = new CANNON.World();
    this.energyBlast = new THREE.Object3D();
   
  }

  returnMainChar() {
    return this.mainCharacter;
  }
  returnMCGun() {
    return this.mCGun;
  }
  returnIntergalacticShip() {
    return this.intergalacticShip;
  }
  returnEnergyBlast() {
    return this.energyBlast;
  }

  setLoaderVariables(name, object, mixer, action){
    switch (name) {
      case "mainCharacter":
        this.mixer = mixer;
        this.action = action;
        this.mainCharacter = object;
        this.cameraHolder.add(this.camera)
        this.cameraHolder.position.set(0, 0, -7.5);
        this.camera.position.set(0, 5.5, 0);
        this.cameraHolder.add(this.camera);
        this.cameraHolder.lookAt(this.scene.position);
        this.camera.rotateY(110);
        this.scene.add(this.cameraHolder);

        this.mainCharacter.scene.position.set(0, 0, 0);
        this.mainCharacter.scene.add(this.cameraHolder);
        this.scene.add(this.mainCharacter.scene);
        break;
      default:
        let text1 = "do nothing";
    }
  }

  characterCreator() {
    this.loader.load('mainCharWorkingReadyForExportWithNLH.glb', (gltf) => {
      let mainCharacter = gltf;
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

      let mixer = new THREE.AnimationMixer(mainCharacter.scene);
      let action = mixer.clipAction(mainCharacter.aHash.Idle);
      action.play();

      mainCharacter.scene.traverse(function (child) {
        if (child.isMesh) {

          child.castShadow = true;
          child.receiveShadow = true;

        }

      });
      
     this.setLoaderVariables("mainCharacter", mainCharacter, mixer, action);

    }, undefined, (error) => {

      console.error(error);

    });
    this.loader.load('rifle+futuristic+suppressed.glb', (gltf) => {
      this.mCGun = gltf;
      this.mCGun.scene.scale.set(20, 20, 20);
      // this.mCGun.scene.rotateY(90);
      this.mCGun.scene.rotateY(4.7);
      this.mCGun.scene.position.set(-.2, 2.6, 1.2);
      this.scene.add(this.mCGun.scene);

    }, undefined, (error) => {

      console.error(error);

    });

    this.loader.load('Neck_Mech_Walker_by_3DHaupt-(FBX+7.4+binary+mit+Animation).glb', (gltf) => {
      this.enemyMech = gltf;
      this.enemyMech.scene.scale.set(2, 2, 2);

      this.enemyMech.aHash = {};
      this.enemyMech.animations.forEach(a => {
        this.enemyMech.aHash[a.name] = a;
      });

      this.eMechMixer = new THREE.AnimationMixer(this.enemyMech.scene);
      this.eMechAction = this.eMechMixer.clipAction(this.enemyMech.aHash["Neck_Mech_Walker_by_3DHaupt|All_Animations"]);
      this.eMechAction.play();

      this.enemyMech.scene.position.set(0, 0, 20);
      this.scene.add(this.enemyMech.scene);

    }, undefined, (error) => {

      console.error(error);

    });

    this.loader.load('Hades_Carrier.glb', (gltf) => {
      this.intergalacticShip = gltf;
      this.intergalacticShip.scene.scale.set(6000, 6000, 6000);

      this.intergalacticShip.aHash = {};
      this.intergalacticShip.animations.forEach(a => {
        this.intergalacticShip.aHash[a.name] = a;
      });

      this.intergalacticShip.scene.rotateY(1.5);
      this.intergalacticShip.scene.position.set(-4000, 50, 100);
      this.scene.add(this.intergalacticShip.scene);


    });
  }

  aimDir() {
    let vector = this.currentAimDirection;
    this.currentAimDirection.set(0, 0, 1);
    vector.unproject(this.camera);
    let ray = new THREE.Ray(this.MCShellBody.position, vector.sub(this.MCShellBody.position).normalize());
    this.currentAimDirection.copy(ray.direction);
  }

  handleShoot(e) {
    let x = this.MCShellBody.position.x;
    let y = this.MCShellBody.position.y;
    let z = this.MCShellBody.position.z;
    let projectileBody = new CANNON.Body({ mass: 0.00000000000000001 });
    
    console.log(`xyx ${x}, ${y}, ${z}`)
    console.log(`mainCharacter ${mainCharacter.scene.position.x}, ${mainCharacter.scene.position.y}, ${mainCharacter.scene.position.z}`)

    projectileBody.addShape(projectileShape);

    let totalParticles = 125;
    let radiusRange = .6;
    for (let i = 0; i < totalParticles; i++) {
      let spriteMaterial = new THREE.SpriteMaterial({ map: this.particleTexture, useScreenCoordinates: false, color: 0xffffff });
      let sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.06, 0.03, 1.0); // imageWidth, imageHeight
      sprite.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      sprite.position.setLength(radiusRange * Math.random());
      sprite.material.color.setHSL(Math.random(), 0.9, 0.7);
      sprite.material.blending = THREE.AdditiveBlending;
      this.energyBlast.add(sprite);
      this.eBlastAttrs.startPosition.push(sprite.position.clone());
      this.eBlastAttrs.randomness.push(Math.random());
    }

    this.world.add(projectileBody);
    this.scene.add(this.energyBlast);
    this.projectiles.push(projectileBody);
    this.projectileMeshes.push(this.energyBlast);

    if (this.projectiles.length > 5) {
      this.world.remove(this.projectiles.shift());
      this.scene.remove(this.projectileMeshes.shift());
    }
    this.aimDir();
    console.log(this.currentAimDirection);
    projectileBody.velocity.set(this.currentAimDirection.x * projectileVelocity,
      this.currentAimDirection.y * projectileVelocity,
      this.currentAimDirection.z * projectileVelocity);

    // to stop collisions with character that pushes character backwards
    x += this.currentAimDirection.x * (mCharacterShell.radius * 1.02 + projectileShape.radius);
    y += this.currentAimDirection.y * (mCharacterShell.radius * 1.02 + projectileShape.radius);
    z += this.currentAimDirection.z * (mCharacterShell.radius * 1.02 + projectileShape.radius);
    projectileBody.position.set(x, y, z);
    this.energyBlast.position.set(x, y, z);
  }


  playClip(entity, clip, actionType, pause) {

    if (actionType === "action") {
      if (this.action && this.action._clip.name !== clip) {
        this.action.enabled = false;
        this.action = this.mixer.clipAction(entity.aHash[clip]);
      } else {
        this.action = this.mixer.clipAction(entity.aHash[clip]);
        this.action.enabled = true;
      }
      this.action.play();
      
    } else {
      if (this.eMechAction && this.eMechAction._clip.name !== clip) {
        this.eMechAction.enabled = false;
        this.eMechAction = this.mixer.clipAction(entity.aHash[clip]);
      } else {
        this.eMechAction = this.mixer.clipAction(entity.aHash[clip]);
        this.eMechAction.enabled = true;
      }
      if (pause) {
        this.eMechAction.setLoop(THREE.LoopOnce);
        this.eMechAction.clampWhenFinished = true;
      }
      this.eMechAction.play();
    }

  }

  onKeyDown(e, mainCharacter) {

  switch (e.keyCode) {

    case 87: // w
      this.forward = true;

      break;

    case 65: // a
      this.left = true;

      break;

    case 83: // s
      this.back = true;

      break;

    case 68: // d
      this.right = true;

      break;
    case 37:  // left arrow
      this.strafeL = true;

      break;
    case 39:  // right arrow
      this.strafeR = true;

      break;
    case 38:  // up arrow
      this.handleShoot(e);

      break;
    case 32: // space
      if (this.jumpAllow === true) this.velocity.y += 350;
      this.jumpAllow = false;
      break;

  }

};

onKeyUp(event) {

  switch (event.keyCode) {

    case 87: // w
      this.forward = false;

      break;

    case 65: // a
      this.left = false;

      break;

    case 83: // s
      this.back = false;

      break;

    case 68: // d
      this.right = false;

      break;
    case 37:
      this.strafeL = false;

      break;
    case 39:
      this.strafeR = false;

      break;
  }

};



  updatePosValues(delta){
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity2.x -= this.velocity2.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    this.direction.z = Number(this.forward) - Number(this.back);
    this.direction.x = Number(this.left) - Number(this.right);
    this.direction.x2 = Number(this.strafeL) - Number(this.strafeR);
    this.direction.normalize(); // this ensures consistent movements in all directions

    if (this.forward || this.back) this.velocity.z -= this.direction.z * 400.0 * delta;
    if (this.left || this.right) this.velocity.x -= this.direction.x * 400.0 * delta;
    if (this.strafeL || this.strafeR) this.velocity2.x -= this.direction.x2 * 400.0 * delta;
  }

  updateMainCharacter(delta){
    this.mainCharacter.scene.rotation.y += ((this.velocity.x * delta) / 10 * -1);
    this.mainCharacter.scene.position.y += (this.velocity.y * delta);
    this.mainCharacter.scene.translateZ(this.velocity.z * delta * -1);
    this.mainCharacter.scene.translateX(this.velocity2.x * delta * -1);


    let mType = "idle";
    if (this.forward) mType = { type: "forward" };
    if (this.left) mType = { type: "left" };
    if (this.right) mType = { type: "right" };
    if (this.back) mType = { type: "back" };
    if (this.strafeL) mType = { type: "strafeL" };
    if (this.strafeR) mType = { type: "strafeR" };
    switch (mType.type) {
      case "forward":
        this.playClip(this.mainCharacter, "Run", "action");
        break;
      case "back":
        this.playClip(this.mainCharacter, "RunBackwards", "action");
        break;
      case "left":
        this.playClip(this.mainCharacter, "StrafeLeft", "action");
        break;
      case "right":
        this.playClip(this.mainCharacter, "Strafe2", "action");
        break;
      case "strafeL":
        this.playClip(this.mainCharacter, "StrafeLeft", "action");
        break;
      case "strafeR":
        this.playClip(this.mainCharacter, "Strafe2", "action");
        break;
      default:
        if (this.mouseDown) {
          this.playClip(this.mainCharacter, "GunPlay", "action")
        } else {
          this.playClip(this.mainCharacter, "Idle", "action")
        }

    }
  }


  update() {
    let time = performance.now();
    let delta = (time - this.lastTime) / 1000;
    this.lasttime = time;
    
    this.updatePosValues(delta);
    if (this.mainCharacter){
      this.updateMainCharacter();
    }
  }
}

// later
// initCannon(this.mainCharacter)

//  this.MCShellBody.position.x = this.mainCharacter.scene.position.x;
//  this.MCShellBody.position.y = this.mainCharacter.scene.position.y + 10;
//  this.MCShellBody.position.z = this.mainCharacter.scene.position.z;

export default AllSceneObjects;
