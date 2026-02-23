import { KAPLAYCtx } from "kaplay";
import { PLAYER_COLORS } from "./styles";
import { Scores } from "./types";

export function createHud(k: KAPLAYCtx<{}, never>) {
  const uiLabel = add([
    text(`Go player 1`, { size: 24 }),
    pos(20, 20),
    color(PLAYER_COLORS[1]),
    z(10),
    fixed(),
  ]);

  const scoreLabel = add([
    text(`P1: 0   P2: 0`, { size: 20 }),
    pos(20, 50),
    color(rgb(100, 100, 100)),
    z(10),
    fixed(),
  ]);

  return {
    update: (currentPlayer:number, scores:Scores) => {
      uiLabel.text = `Go player ${currentPlayer}`;
      scoreLabel.text = `P1: ${scores[1]}   P2: ${scores[2]}`;
      uiLabel.color = k.Color.fromHex(PLAYER_COLORS[currentPlayer as 1 | 2]);
    }
  }
}
