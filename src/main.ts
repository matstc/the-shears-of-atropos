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
k.loadSound("start-game", "sounds/start-game.wav");
k.loadSound("game-over", "sounds/game-over.wav");
k.loadSound("select", "sounds/select.wav");

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
