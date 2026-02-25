import { GameObj, KAPLAYCtx } from "kaplay";
import { backgroundColor, lightenHex, menuTextColor, playerColors, playerTextColors, playRandomSound } from "./styles";
import { Player1OrPlayer2, Scores } from "./types";

export async function createHud(k: KAPLAYCtx<any, never>, misere: boolean, vsCpu:boolean) {
  const margin = 40;
  let pauseOverlay:GameObj|null = null;
  let pauseMenuRoot:GameObj|null = null;
  let gameOverRoot:GameObj|null = null;
  let misereBadge:GameObj|null = null;
  let lastCurrentPlayer:Player1OrPlayer2 = 1;
  let gameOverShowing = false;
  let goPlayerTween = null;
  const getLabelTopPos = () => k.vec2(k.width() / 2, margin);
  const getLabelCenterPos = () => k.vec2(k.width() / 2, k.height() / 2);
  const getP1TargetPos = () => k.vec2(margin + 20, k.height() - margin * 1.5);
  const getP2TargetPos = () => k.vec2(k.width() - margin - 20, k.height() - margin * 1.5);
  const getBadgeInitialPos = (player: number) => {
    const offset = player === 1 ? -60 : 60;
    return k.vec2((k.width() / 2) + offset, (k.height() / 2) + 100);
  };
  const getPauseOverlayWidth = () => k.width()
  const getPauseOverlayHeight = () => k.height()
  const getPauseMenuRootWidth = () => k.width() / 2
  const getPauseMenuRootHeight = () => k.height() / 2
  const getGameOverRootPos = () => k.vec2(k.width() / 2, k.height() / 2);
  const getMisereBadgePos = () => k.vec2(k.width() - 110 + margin, margin - 2)

  const uiLabel = k.add([
    text(`GO PLAYER 1`, { font: "AdventProBold", size: 64 }),
    pos(getLabelCenterPos()),
    anchor("center"),
    color(k.Color.fromHex(playerColors[1])),
    fixed(),
    z(10),
    opacity(0)
  ]);

  const createScoreBadge = (player: Player1OrPlayer2) => {
    const container = k.add([
      pos(getBadgeInitialPos(player)),
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

    return { container, scoreLabel };
  };

  const p1 = createScoreBadge(1);
  const p2 = createScoreBadge(2);

  tween(0, 1, 0.7, (v) => {
    uiLabel.opacity = v;
    p1.container.opacity = v;
    p2.container.opacity = v;
    p1.container.children.forEach(child => child.opacity = v);
    p2.container.children.forEach(child => child.opacity = v);
  }, easings.easeInOutExpo);

  await wait(1.5);

  tween(uiLabel.pos, getLabelTopPos(), 0.8, (v) => uiLabel.pos = v, k.easings.linear);
  tween(64, 32, 0.7, (v) => uiLabel.textSize = v, k.easings.linear);
  tween(p1.container.pos, getP1TargetPos(), 0.7, (v) => p1.container.pos = v, k.easings.easeInOutSine);
  tween(p2.container.pos, getP2TargetPos(), 0.7, (v) => p2.container.pos = v, k.easings.easeInOutSine);
  await wait(0.4);

  const p1ScoreLabel = p1.scoreLabel;
  const p2ScoreLabel = p2.scoreLabel;

  if (misere) {
    misereBadge = k.add([
      pos(getMisereBadgePos()),
      anchor("center"),
    ])

    misereBadge.add([
      rect(60, 24, { radius: 3 }),
      pos(0, 0),
      anchor("center"),
      color(Color.fromHex("#888888")),
      fixed(),
      z(10),
    ]);

    misereBadge.add([
      text("MlSERE", { font: "AdventProRegular", size: 20 }),
      pos(0, 0),
      anchor("center"),
      color(WHITE),
      fixed(),
      z(11),
    ]);
  }

  const turnIndicator = add([
    circle(50, { fill: false }),
    anchor("center"),
    pos(getP1TargetPos()),
    outline(2, k.Color.fromHex(playerColors[1])),
    opacity(1),
    z(5),
  ]);

  return {
    update: async (currentPlayer: Player1OrPlayer2, scores: Scores) => {
      if (gameOverShowing) return;

      goPlayerTween = tween(uiLabel.opacity, 0, 0.2, (v) => uiLabel.opacity = v)
      goPlayerTween.onEnd(() => {
        if (gameOverShowing) return;

        uiLabel.text = `GO PLAYER ${currentPlayer}`;
        uiLabel.color = k.Color.fromHex(playerColors[currentPlayer]);

        tween(0, 1, 0.4, (v) => uiLabel.opacity = v, k.easings.easeOutQuad);
      });

      lastCurrentPlayer = currentPlayer;
      const targetPos = currentPlayer === 1 ? getP1TargetPos() : getP2TargetPos();
      const targetColor = k.Color.fromHex(playerColors[currentPlayer]);

      tween(
        turnIndicator.pos,
        targetPos,
        0.6,
        (v) => turnIndicator.pos = v,
        k.easings.easeInOutCubic
      )
      tween(
        turnIndicator.outline.color,
        targetColor,
        0.8,
        (v) => turnIndicator.outline.color = v,
        easings.easeInCubic
      );

      if (p1ScoreLabel.text !== `${scores[1]}`) {
        await wait(0.5)
        p1ScoreLabel.text = `${scores[1]}`;
        tween(0, 1, 1, (v) => p1ScoreLabel.opacity = v, k.easings.easeOutQuad);
      }

      if (p2ScoreLabel.text !== `${scores[2]}`) {
        await wait(0.5)
        p2ScoreLabel.text = `${scores[2]}`;
        tween(0, 1, 1, (v) => p2ScoreLabel.opacity = v, k.easings.easeOutQuad);
      }
    },
    showGameOver: (winner: Player1OrPlayer2 | null) => {
      gameOverShowing = true;
      if (goPlayerTween) {
        goPlayerTween.cancel()
      }
      uiLabel.text = "GAME OVER";
      uiLabel.color = Color.fromHex(menuTextColor);
      uiLabel.opacity = 1;

      gameOverRoot = k.add([
        k.pos(getGameOverRootPos()),
        k.anchor("center"),
        k.fixed(),
        k.z(11),
        k.opacity(0)
      ]);

      const string = winner === null ? "It’s a draw" : `Player ${winner} won`;
      const explanation = winner === null ? "" : misere ? "by collecting the least lives" : "by collecting the most lives";

      gameOverRoot.add([
        text(string, { font: "AdventProRegular", size: 47 }),
        pos(0, 0),
        color(winner ? Color.fromHex(playerColors[winner]) : Color.fromHex(menuTextColor)),
        anchor("center"),
        opacity(0),
        fixed(),
      ]);

      gameOverRoot.add([
        text(explanation, { font: "AdventProRegular", size: 20 }),
        pos(0, 50),
        color(winner ? Color.fromHex(playerColors[winner]) : Color.fromHex(lightenHex(menuTextColor, 30))),
        anchor("center"),
        opacity(0),
        fixed(),
      ]);

      const backToMenuButton = gameOverRoot.add([
        text("← Back to menu", { font: "AdventProRegular", size: 24 }),
        pos(0, 180),
        color(menuTextColor),
        anchor("center"),
        area(),
        opacity(0),
        fixed(),
      ]);

      k.tween(0, 1, 0.7, (val) => {
        gameOverRoot.opacity = val;
        gameOverRoot.children.forEach(child => {
          child.opacity = val;
        });
      }, k.easings.easeOutQuad);

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
      backToMenuButton.onClick(() => { play("select"); k.go("menu") });
    },
    showPauseMenu: (onResume: () => void) => {
      pauseOverlay = k.add([
        k.rect(getPauseOverlayWidth(), getPauseOverlayHeight()),
        k.color(0, 0, 0),
        k.opacity(0.3),
        k.fixed(),
        k.z(100),
      ]);

      pauseMenuRoot = k.add([
        k.pos(getPauseMenuRootWidth(), getPauseMenuRootHeight()),
        k.anchor("center"),
        k.fixed(),
        k.z(101),
      ]);

      pauseMenuRoot.add([
        k.circle(150),
        k.color(k.Color.fromHex(backgroundColor)),
        k.anchor("center"),
      ]);

      const addButton = (label: string, y: number, size:number, onClick: () => void) => {
        const btn = pauseMenuRoot!.add([
          k.text(label, { font: "AdventProRegular", size }),
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

      addButton("Resume", -40, 32, onResume);
      addButton("← Back to menu", 40, 24, () => { play("select"); k.go("menu") });

      return () => {
        pauseOverlay!.destroy();
        pauseMenuRoot!.destroy();
      };
    },
    onResize: () => {
      if (pauseOverlay) {
        pauseOverlay.width = getPauseOverlayWidth();
        pauseOverlay.height = getPauseOverlayHeight();
      }

      if (pauseMenuRoot) {
        pauseMenuRoot.pos = k.vec2(getPauseMenuRootWidth(), getPauseMenuRootHeight());
      }

      if (gameOverRoot) {
        gameOverRoot.pos = getGameOverRootPos();
      }

      if (misereBadge) {
        misereBadge.pos = getMisereBadgePos();
      }

      const currentPos = lastCurrentPlayer === 1 ? getP1TargetPos() : getP2TargetPos();
      turnIndicator.pos = currentPos;

      uiLabel.pos = getLabelTopPos();
      p1.container.pos = getP1TargetPos();
      p2.container.pos = getP2TargetPos();
    },
  };
}
