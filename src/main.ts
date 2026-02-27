import kaplay from "kaplay";
import { createNewGame } from "./game";
import { createMenu } from "./mainMenu";
import { backgroundColor } from "./styles";

const k = kaplay({
  background: backgroundColor,
  pixelDensity: window.devicePixelRatio,
});

k.loadRoot("./");
k.loadFont("AdventProRegular", "fonts/AdventPro-Regular.ttf");
k.loadFont("AdventProBold", "fonts/AdventPro-Bold.ttf");
k.loadFont("AdventProBlack", "fonts/AdventPro-Black.ttf");
const audio = new Audio();
const extension = audio.canPlayType('audio/ogg; codecs="vorbis"') ? "ogg" : "mp3";
k.loadSound("game-start", `sounds/game-start.${extension}`);
k.loadSound("game-over", `sounds/game-over.${extension}`);
k.loadSound("select", `sounds/select.${extension}`);
k.loadSound("blade1", `sounds/blade1.${extension}`);
k.loadSound("blade2", `sounds/blade2.${extension}`);
k.loadSound("blade3", `sounds/blade3.${extension}`);
k.loadSound("capture1", `sounds/capture1.${extension}`);
k.loadSound("capture2", `sounds/capture2.${extension}`);
k.loadSound("capture3", `sounds/capture3.${extension}`);

let mainMenu = null
let game = null

k.scene("menu", () => {
  mainMenu = createMenu(k, (dimension, misere, vsCpu, cpuAlgorithm) => {
    k.go("game", { dimension, misere, vsCpu, cpuAlgorithm });
  });
});

k.scene("game", async ({ dimension, misere, vsCpu, cpuAlgorithm }) => {
  game = await createNewGame(k, dimension, misere, vsCpu, cpuAlgorithm);

  k.onUpdate(() => {
    game.onUpdate();
  });
});

let resizeTimeout: number;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = window.setTimeout(() => {
    const scene = k.getSceneName()
    if (scene === "menu") {
      k.go("menu");
    } else if (scene == "game") {
      game.onResize()
    }
  }, 100);
});

k.go("menu");
