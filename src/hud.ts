import { KAPLAYCtx } from "kaplay";
import { edgeColor, playerBackgrounds, playerColors as playerColors, playerTextColors } from "./styles";
import { Player1OrPlayer2, Scores } from "./types";

export function createHud(k: KAPLAYCtx<any, never>, misere: boolean) {
  const margin = 40;

  const uiLabel = k.add([
    k.text(`GO PLAYER 1`, { font: "AdventProRegular", size: 32 }),
    k.pos(k.width() / 2, margin),
    k.anchor("center"),
    k.color(k.Color.fromHex(playerColors[1])),
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
      k.text(`P${player}`, { font: "AdventProRegular", size: 20 }),
      k.anchor("center"),
      k.pos(player == 1 ? -10 : 10, -15),
      k.color(Color.fromHex(playerTextColors[player])),
    ]);

    const scoreLabel = container.add([
      k.text("0", { font: "AdventProRegular", size: 20 }),
      k.anchor("center"),
      k.pos(player == 1 ? -10 : 10, +15),
      k.color(Color.fromHex(playerTextColors[player])),
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
      k.text("MISERE", { font: "AdventProRegular", size: 12 }),
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
        text(string, { font: "AdventProRegular", size: 47 }),
        pos(width() / 2, height() / 2),
        color(winner ? Color.fromHex(playerColors[winner]) : Color.fromHex(edgeColor)),
        anchor("center"),
        fixed(),
      ]);

      const backToMenuButton = add([
        text("← Back to menu", { font: "AdventProRegular", size: 24 }),
        pos(width() / 2, height() / 2 + 60),
        color(Color.fromHex(edgeColor)),
        anchor("center"),
        area(),
        fixed(),
      ]);

      backToMenuButton.onHover(() => setCursor("pointer"))
      backToMenuButton.onHoverEnd(() => setCursor("default"))
      backToMenuButton.onClick(() => k.go("menu"))
    }
  };
}
