import { GameObj, KAPLAYCtx } from "kaplay";
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
      opacity(1),
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
      text("MlSERE", { font: "AdventProRegular", size: 20 }),
      pos(k.width() - 70, margin),
      anchor("center"),
      color(WHITE),
      fixed(),
      z(11),
    ]);
  }

  return {
    update: async (currentPlayer: Player1OrPlayer2, scores: Scores) => {
      uiLabel.text = `GO PLAYER ${currentPlayer}`;
      uiLabel.color = k.Color.fromHex(playerColors[currentPlayer]);

      if (p1ScoreLabel.text !== `${scores[1]}`) {
        await wait(0.5)
        p1ScoreLabel.text = `${scores[1]}`;
        k.tween(0, 1, 1, (v) => p1ScoreLabel.opacity = v, k.easings.easeOutQuad);
      }

      if (p2ScoreLabel.text !== `${scores[2]}`) {
        await wait(0.5)
        p2ScoreLabel.text = `${scores[2]}`;
        k.tween(0, 1, 1, (v) => p2ScoreLabel.opacity = v, k.easings.easeOutQuad);
      }
    },
    showGameOver: (winner: Player1OrPlayer2 | null) => {
      uiLabel.text = "GAME OVER";
      uiLabel.color = Color.fromHex(menuTextColor);

      const string = winner === null ? "DRAW" : `Player ${winner} won`;
      const explanation = misere ? "by collecting the least lives" : "by collecting the most lives";

      const gameOverElements:GameObj[] = [];

      gameOverElements.push(k.add([
        text(string, { font: "AdventProRegular", size: 47 }),
        pos(width() / 2, height() / 2),
        color(winner ? Color.fromHex(playerColors[winner]) : Color.fromHex(menuTextColor)),
        anchor("center"),
        opacity(0),
        fixed(),
      ]));

      gameOverElements.push(k.add([
        text(explanation, { font: "AdventProRegular", size: 20 }),
        pos(width() / 2, height() / 2 + 50),
        color(winner ? Color.fromHex(playerColors[winner]) : Color.fromHex(lightenHex(menuTextColor, 30))),
        anchor("center"),
        opacity(0),
        fixed(),
      ]));

      const backToMenuButton = k.add([
        text("← Back to menu", { font: "AdventProRegular", size: 24 }),
        pos(width() / 2, height() / 2 + 180),
        color(menuTextColor),
        anchor("center"),
        area(),
        opacity(0),
        fixed(),
      ]);

      gameOverElements.push(backToMenuButton);

      k.tween(0, 1, 0.7, (val) => gameOverElements.forEach(el => el.opacity = val), k.easings.easeOutQuad);

      backToMenuButton.onHoverUpdate(() => {
        if (backToMenuButton.opacity >= 1) {
          setCursor("pointer");
          backToMenuButton.color = BLACK;
        }
      });
      backToMenuButton.onHoverEnd(() => {
        setCursor("default");
        backToMenuButton.color = Color.fromHex(menuTextColor);
      });
      backToMenuButton.onClick(() => k.go("menu"));
    },
    showPauseMenu: (onResume: () => void) => {
      const overlay = k.add([
        k.rect(k.width(), k.height()),
        k.color(0, 0, 0),
        k.opacity(0.3),
        k.fixed(),
        k.z(100),
      ]);

      const menuRoot = k.add([
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.fixed(),
        k.z(101),
      ]);

      const addButton = (label: string, y: number, onClick: () => void) => {
        const btn = menuRoot.add([
          k.text(label, { font: "AdventProRegular", size: 32 }),
          k.pos(0, y),
          k.color(k.Color.fromHex(menuTextColor)),
          k.anchor("center"),
          k.area(),
        ]);

        btn.onHoverUpdate(() => { k.setCursor("pointer"); btn.color = k.BLACK; });
        btn.onHoverEnd(() => { k.setCursor("default"); btn.color = k.Color.fromHex(menuTextColor); });
        btn.onClick(onClick);
        return btn;
      };

      addButton("Resume", -40, onResume);
      addButton("Back to menu", 40, () => k.go("menu"));

      return () => {
        overlay.destroy();
        menuRoot.destroy();
      };
    }
  };
}
