import kaplay from "kaplay";
import { createNewGame } from "./game";
import { createMenu } from "./mainMenu";
import { backgroundColor } from "./styles";

const k = kaplay({
  background: backgroundColor,
  pixelDensity: window.devicePixelRatio
});

k.loadRoot("./");
k.loadFont("AdventProRegular", "fonts/AdventPro-Regular.ttf");
k.loadFont("AdventProBold", "fonts/AdventPro-Bold.ttf");
k.loadSound("game-start", "sounds/game-start.mp3");
k.loadSound("game-over", "sounds/game-over.mp3");
k.loadSound("select1", "sounds/select1.mp3");
k.loadSound("select2", "sounds/select2.mp3");
k.loadSound("select3", "sounds/select3.mp3");
k.loadSound("blade1", "sounds/blade1.mp3");
k.loadSound("blade2", "sounds/blade2.mp3");
k.loadSound("blade3", "sounds/blade3.mp3");
k.loadSound("capture1", "sounds/capture1.mp3");
k.loadSound("capture2", "sounds/capture2.mp3");
k.loadSound("capture3", "sounds/capture3.mp3");

let mainMenu = null
let game = null

k.scene("menu", () => {
  mainMenu = createMenu(k, (dimension, misere, vsCpu) => {
    k.go("game", { dimension, misere, vsCpu });
  });
});

k.scene("game", async ({ dimension, misere, vsCpu }) => {
  game = await createNewGame(k, dimension, misere, vsCpu);

  k.onUpdate(() => {
    game.onUpdate();
  });
});

let resizeTimeout: number;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = window.setTimeout(() => {
    console.log("Resize finished - Restarting Menu");

    const scene = k.getSceneName()
    if (scene === "menu") {
      k.go("menu");
    } else if (scene == "game") {
      game.onResize()
    }
  }, 100);
});

k.go("menu");
