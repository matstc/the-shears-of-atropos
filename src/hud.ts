import { KAPLAYCtx } from "kaplay";
import { edgeColor, playerBackgrounds, playerColors as playerColors } from "./styles";
import { Player1OrPlayer2, Scores } from "./types";

export function createHud(k: KAPLAYCtx<any, never>, misere: boolean) {
  const margin = 40;

  const uiLabel = k.add([
    k.text(`GO PLAYER 1`, { size: 32 }),
    k.pos(k.width() / 2, margin),
    k.anchor("center"),
    k.color(k.Color.fromHex(playerColors[1])),
    k.z(10),
    k.fixed(),
  ]);

  const createScoreBadge = (player: Player1OrPlayer2, xPos: number, anchorPoint: string) => {
    const container = k.add([
      k.pos(xPos, k.height() - margin * 1.5),
      k.anchor(anchorPoint as any),
      k.fixed(),
      k.z(10),
    ]);

    container.add([
      k.circle(45),
      k.color(Color.fromHex(playerBackgrounds[player])),
      k.anchor("center"),
    ]);

    container.add([
      k.text(`P${player}`, { size: 20 }),
      k.anchor("center"),
      k.pos(0, -15),
      k.color(Color.fromHex(playerColors[player])),
    ]);

    const scoreLabel = container.add([
      k.text("0", { size: 20 }),
      k.anchor("center"),
      k.pos(0, +15),
      k.color(Color.fromHex(playerColors[player])),
    ]);

    return scoreLabel;
  };

  const p1ScoreLabel = createScoreBadge(1, margin + 20, "center");
  const p2ScoreLabel = createScoreBadge(2, k.width() - margin - 20, "center");

  if (misere) {
    k.add([
      k.rect(80, 24, { radius: 4 }),
      k.pos(k.width() / 2, margin + 45),
      k.anchor("center"),
      k.color(200, 50, 50),
      k.fixed(),
      k.z(10),
    ]);

    k.add([
      k.text("MISERE", { size: 12, font: "sans-serif" }),
      k.pos(k.width() / 2, margin + 45),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.fixed(),
      k.z(11),
    ]);
  }

  return {
    update: (currentPlayer: Player1OrPlayer2, scores: Scores) => {
      uiLabel.text = `GO PLAYER ${currentPlayer}`;
      uiLabel.color = k.Color.fromHex(playerColors[currentPlayer]);

      p1ScoreLabel.text = `${scores[1]}`;
      p2ScoreLabel.text = `${scores[2]}`;
    },
    showGameOver: (winner:Player1OrPlayer2|null) => {
      uiLabel.text = "GAME OVER"
      uiLabel.color = Color.fromHex(edgeColor)
      const string = winner === null ? "DRAW" : `Player ${winner} wins`

      add([
        text(string, { size: 48 }),
        pos(width() / 2, height() / 2),
        color(winner ? Color.fromHex(playerColors[winner]) : Color.fromHex(edgeColor)),
        anchor("center"),
        fixed(),
      ]);
    }
  };
}
