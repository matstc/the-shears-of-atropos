import { KAPLAYCtx } from "kaplay";
import { lightenHex, menuTextColor, playerColors, playerTextColors } from "./styles";
import { Player1OrPlayer2, Scores } from "./types";

export function createHud(k: KAPLAYCtx<any, never>, misere: boolean) {
  const margin = 40;

  const uiLabel = k.add([
    text(`GO PLAYER 1`, { font: "AdventProBold", size: 32 }),
    pos(k.width() / 2, margin),
    anchor("center"),
    color(k.Color.fromHex(playerColors[1])),
    fixed(),
  ]);

  const createScoreBadge = (player: Player1OrPlayer2, xPos: number, anchorPoint: string) => {
    const container = k.add([
      pos(xPos, k.height() - margin * 1.5),
      anchor(anchorPoint as any),
      fixed(),
      z(10),
    ]);

    container.add([
      text(`P${player}`, { font: "AdventProRegular", size: 24 }),
      anchor("center"),
      pos(player == 1 ? -10 : 10, -20),
      color(Color.fromHex(playerTextColors[player])),
    ]);

    const scoreLabel = container.add([
      text("0", { font: "AdventProRegular", size: 24 }),
      anchor("center"),
      pos(player == 1 ? -10 : 10, +15),
      color(Color.fromHex(playerTextColors[player])),
    ]);

    return scoreLabel;
  };

  const p1ScoreLabel = createScoreBadge(1, margin + 20, "center");
  const p2ScoreLabel = createScoreBadge(2, k.width() - margin - 20, "center");

  if (misere) {
    add([
      rect(60, 24, { radius: 4 }),
      pos(k.width() - 111 + margin, margin),
      anchor("center"),
      color(Color.fromHex("#888888")),
      fixed(),
      z(10),
    ]);

    add([
      text("MlSERE", { font: "AdventProRegular", size: 16 }),
      pos(k.width() - 70, margin),
      anchor("center"),
      color(WHITE),
      fixed(),
      z(11),
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
      uiLabel.color = Color.fromHex(menuTextColor)
      const string = winner === null ? "DRAW" : `Player ${winner} won`
      const explanation = misere ? "by collecting as few lives as possible" : "by collecting as many lives as possible"

      add([
        text(string, { font: "AdventProRegular", size: 47 }),
        pos(width() / 2, height() / 2),
        color(winner ? Color.fromHex(playerColors[winner]) : Color.fromHex(menuTextColor)),
        anchor("center"),
        fixed(),
      ]);

      add([
        text(explanation, { font: "AdventProRegular", size: 16 }),
        pos(width() / 2, height() / 2 + 35),
        color(winner ? Color.fromHex(playerColors[winner]) : Color.fromHex(lightenHex(menuTextColor, 30))),
        anchor("center"),
        fixed(),
      ]);

      const backToMenuButton = add([
        text("← Back to menu", { font: "AdventProRegular", size: 24 }),
        pos(width() / 2, height() / 2 + 100),
        color(menuTextColor),
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
