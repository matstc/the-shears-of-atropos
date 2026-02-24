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

k.scene("menu", () => {
  createMenu(k, (dimension, misere, vsCpu) => {
    k.go("game", { dimension, misere, vsCpu });
  });
});

k.scene("game", ({ dimension, misere, vsCpu }) => {
  const game = createNewGame(k, dimension, misere, vsCpu);

  k.onUpdate(() => {
    game.onUpdate();
  });
});

k.go("menu");
