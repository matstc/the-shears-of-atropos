import { KAPLAYCtx } from "kaplay";
import "kaplay/global"
import { addBackground, lightenHex, menuTextColor, playRandomSound } from "./styles";

const dimensions = [4, 9, 16, 25, 36]
let dimension = 16;
let isMisere = false;
let vsCpu = true;

export function createMenu(k: KAPLAYCtx<any, never>, onStart:(dimension:number, misere:boolean, vsCpu:boolean) => void) {
  addBackground(k)
  k.play("game-start", { volume: 0 })
  const textColor = Color.fromHex(menuTextColor)
  const yGap = 85;
  const getTitleSize = () => width() < 420 ? 37 : width() < 1024 ? 41 : 64
  const threadColors = [WHITE, Color.fromHex("#eeeeee"), Color.fromHex("#f1f1f1")]
  if (width() > 1024) {
    for (let i = 0; i < 5; i++) {
      let x = Math.random() * width() / 4;

      add([
        rect(1, height()),
        pos(x, 0),
        color(threadColors[Math.floor(Math.random() * 3)])
      ])
    }
  }

  const title = add([
    text("THE SHEARS OF ATROPOS", { font: "AdventProBlack", size: getTitleSize() }),
    pos(k.width() / 2, width() < 1024 ? 80 : 120),
    anchor("center"),
    color(textColor),
    fixed(),
  ]);

  const helpTextLines = [
    "Collect lives by cutting the connecting threads.",
    "One cut at a time. After collecting a life, cut again."
  ]

  const menuXOffset = Math.min(200, width() / 2 - 6)

  const lineContainer = add([
    pos(k.width() / 2 - menuXOffset, width() < 1024 ? 60 : 90),
    fixed()
  ])

  helpTextLines.map((line, i) => {
    lineContainer.add([
      text(line, { font: "AdventProRegular", size: 20 }),
      pos(0, lineContainer.pos.y + i * 25),
      color(lightenHex(menuTextColor, 30)),
      fixed()
    ])
  })

  const menu = add([
    pos(k.width() / 2 - menuXOffset,  width() < 1024 ? Math.max(k.height() / 4, 220) : k.height() / 3),
    fixed(),
  ]);

  const addMenuRow = (y: number, label: string, description: string, getValue: () => string, onPrev: () => void, onNext: () => void) => {
    const row = menu.add([k.pos(0, y)]);
    const valueStartX = menuXOffset * 2 - 112;

    row.add([
      text(label, { font: "AdventProRegular", size: 24 }),
      color(textColor),
      pos(0, 0)
    ]);

    const triangleWidth = 20;
    const triangleHeight = 30;

    const prevBtn = row.add([
      polygon([
        vec2(0, 0),                       // Tip (pointing left)
        vec2(triangleWidth, -triangleHeight / 2), // Top right
        vec2(triangleWidth, triangleHeight / 2),  // Bottom right
      ]),
      anchor("center"),
      pos(valueStartX - 10, 12),
      color(textColor),
      area({ shape: new Rect(vec2(10, 0), 60, 60) }),
    ]);

    const value = getValue()

    const valueText = row.add([
      text(value, { font: "AdventProRegular", size: 24 }),
      pos(valueStartX, 0),
      color(textColor),
      anchor("topleft")
    ]);

    const nextBtn = row.add([
      polygon([
        vec2(0, -triangleHeight / 2), // Top left
        vec2(triangleWidth, 0),        // Tip (pointing right)
        vec2(0, triangleHeight / 2),  // Bottom left
      ]),
      anchor("center"),
      pos(valueStartX + 90, 12),
      color(textColor),
      area({ shape: new Rect(vec2(10, 0), 60, 60) }),
    ]);

    row.add([
      text(description, { font: "AdventProRegular", size: 20 }),
      pos(0, 30),
      color(lightenHex(menuTextColor, 30))
    ])

    const updateUI = () => {
      const value = getValue();
      valueText.opacity = 0;
      valueText.text = value;
      let xOffset = value.length >= 3 ? 33 : value.length == 2 ? 39 : 44;
      if (value.indexOf("1") > -1) xOffset += 3;
      valueText.pos.x = valueStartX + xOffset;

      k.tween(
        0,
        1,
        0.15,
        (v) => valueText.opacity = v,
        k.easings.easeOutQuad
      );
    };

    prevBtn.onClick(() => { playRandomSound(k, "select"); onPrev(); updateUI(); });
    nextBtn.onClick(() => { playRandomSound(k, "select"); onNext(); updateUI(); });

    [prevBtn, nextBtn].forEach(btn => {
      btn.onHoverUpdate(() => {
        btn.color = BLACK;
        setCursor("pointer");
      });
      btn.onHoverEnd(() => {
        btn.color = textColor;
        setCursor("default");
      });
    });

    updateUI();
  };

  addMenuRow(0, "Size of humanity", "Total lives to collect", () => dimension.toString(),
    () => { let index = dimensions.indexOf(dimension); index -= 1; if (index < 0) { index = dimensions.length - 1 }; dimension = dimensions[index] },
    () => { let index = dimensions.indexOf(dimension); index += 1; if (index >= dimensions.length) { index = 0 }; dimension = dimensions[index] },
  );

  addMenuRow(yGap, "Versus", "Against CPU or another player", () => vsCpu ? "CPU" : "P2",
  () => vsCpu = !vsCpu,
  () => vsCpu = !vsCpu
  );

  addMenuRow(yGap * 2, "Misere", "Collect as few lives as possible", () => isMisere ? "YES" : "NO",
  () => isMisere = !isMisere,
  () => isMisere = !isMisere
  );

  const startBtn = menu.add([
    text("Start Game", { font: "AdventProRegular", size: 32 }),
    pos(menuXOffset, yGap * 4.5),
    anchor("center"),
    color(textColor),
    area()
  ]);

  startBtn.onClick(() => {
    onStart(Math.floor(Math.sqrt(dimension)), isMisere, vsCpu)
  });

  [startBtn].forEach(btn => {
    btn.onHoverUpdate(() => {
      btn.color = BLACK;
      setCursor("pointer");
    });
    btn.onHoverEnd(() => {
      btn.color = textColor;
      setCursor("default");
    });
  });

  return {
    onResize: () => {
      title.size = getTitleSize()
    }
  }
}
