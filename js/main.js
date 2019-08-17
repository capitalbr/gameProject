import SceneManager from "./scene_manager";

const game = document.getElementById("game");

const sceneManager = new SceneManager(game);
// const sceneManager = "chicken"

const init = () => {
  sceneManager.init();
}

const render = () => {
  requestAnimationFrame(render);
  sceneManager.update();
  console.log(sceneManager.update());
}

bindEventListeners();
init();
render();

function bindEventListeners() {
  window.onresize = resizeGame;
  resizeGame();
}

function resizeGame() {
  game.style.width = '100%';
  game.style.height = '100%';

  game.width = game.offsetWidth;
  game.height = game.offsetHeight;

  sceneManager.onWindowResize();
}



