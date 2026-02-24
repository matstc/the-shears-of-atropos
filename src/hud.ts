import { GameObj, KAPLAYCtx } from "kaplay";
import { lightenHex, menuTextColor, playerColors, playerTextColors } from "./styles";
import { Player1OrPlayer2, Scores } from "./types";

export async function createHud(k: KAPLAYCtx<any, never>, misere: boolean, vsCpu:boolean) {
  const margin = 40;

  const uiLabel = k.add([
    text(`GO PLAYER 1`, { font: "AdventProBold", size: 64 }),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(k.Color.fromHex(playerColors[1])),
    fixed(),
    z(10),
    opacity(0)
  ]);

  const createScoreBadge = (player: Player1OrPlayer2, targetX: number) => {
    const initialX = (width() / 2) + (player === 1 ? -60 : 60);
    const initialY = (height() / 2) + 100;
    const targetY = k.height() - margin * 1.5;

    const container = k.add([
      pos(initialX, initialY),
      anchor("center"),
      fixed(),
      z(10),
      opacity(0),
    ]);

    const label = vsCpu && player == 2 ? "CPU" : `P${player}`;
    container.add([
      text(label, { font: "AdventProRegular", size: 24 }),
      anchor("center"),
      pos(0, -20),
      color(Color.fromHex(playerTextColors[player])),
      opacity(),
    ]);

    const scoreLabel = container.add([
      text("0", { font: "AdventProRegular", size: 24 }),
      anchor("center"),
      pos(0, 15),
      color(Color.fromHex(playerTextColors[player])),
      opacity(),
    ]);

    return { container, scoreLabel, targetX, targetY };
  };

  const p1Data = createScoreBadge(1, margin + 20);
  const p2Data = createScoreBadge(2, k.width() - margin - 20);

  tween(0, 1, 0.7, (v) => {
    uiLabel.opacity = v;
    p1Data.container.opacity = v;
    p2Data.container.opacity = v;
    p1Data.container.children.forEach(child => child.opacity = v);
    p2Data.container.children.forEach(child => child.opacity = v);
  }, easings.easeInOutExpo);

  await wait(1.5);

  tween(uiLabel.pos, vec2(uiLabel.pos.x, margin), 0.8, (v) => uiLabel.pos = v, k.easings.linear);
  tween(64, 32, 0.7, (v) => uiLabel.textSize = v, k.easings.linear);
  tween(p1Data.container.pos, k.vec2(p1Data.targetX, p1Data.targetY), 0.7, (v) => p1Data.container.pos = v, k.easings.easeInOutSine);
  tween(p2Data.container.pos, k.vec2(p2Data.targetX, p2Data.targetY), 0.7, (v) => p2Data.container.pos = v, k.easings.easeInOutSine);
  await wait(0.4);

  const p1ScoreLabel = p1Data.scoreLabel;
  const p2ScoreLabel = p2Data.scoreLabel;

  if (misere) {
    add([
      rect(60, 24, { radius: 3 }),
      pos(k.width() - 110 + margin, margin - 2),
      anchor("center"),
      color(Color.fromHex("#888888")),
      fixed(),
      z(10),
    ]);

    add([
      text("MlSERE", { font: "AdventProRegular", size: 20 }),
      pos(k.width() - 70, margin - 2),
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
