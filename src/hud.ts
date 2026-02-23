import { KAPLAYCtx } from "kaplay";
import { PLAYER_COLORS } from "./styles";
import { Scores } from "./types";

export function createHud(k: KAPLAYCtx<{}, never>, misere: boolean) {
  if (misere) {
    const badgeWidth = 76;
    const badgeHeight = 24;

    k.add([
      k.rect(badgeWidth, badgeHeight),
      k.pos(20, 85),
      k.color(200, 50, 50),
      k.fixed(),
      k.z(10),
    ]);

    k.add([
      k.text("MISERE", { size: 14, font: "sans-serif" }),
      k.pos(20 + badgeWidth / 2, 85 + badgeHeight / 2),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.fixed(),
      k.z(11),
    ]);
  }

  const uiLabel = k.add([
    k.text(`GO PLAYER 1`, { size: 24 }),
    k.pos(20, 20),
    k.color(k.Color.fromHex(PLAYER_COLORS[1])),
    k.z(10),
    k.fixed(),
  ]);

  const scoreLabel = k.add([
    k.text(`P1: 0   P2: 0`, { size: 20 }),
    k.pos(20, 50),
    k.color(100, 100, 100),
    k.z(10),
    k.fixed(),
  ]);

  return {
    update: (currentPlayer: number, scores: Scores) => {
      uiLabel.text = `GO PLAYER ${currentPlayer}`;
      scoreLabel.text = `P1: ${scores[1]}   P2: ${scores[2]}`;
      uiLabel.color = k.Color.fromHex(PLAYER_COLORS[currentPlayer as 1 | 2]);
    }
  };
}
