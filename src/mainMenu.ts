import { KAPLAYCtx } from "kaplay";
import "kaplay/global"
import { addBackground, lightenHex, menuTextColor } from "./styles";

const dimensions = [4, 9, 16, 25, 36]
let dimension = 16;
let isMisere = false;
let vsCpu = true;

export function createMenu(k: KAPLAYCtx<any, never>, onStart:(dimension:number, misere:boolean, vsCpu:boolean) => void) {
  addBackground(k)
  k.play("start-game", { volume: 0 })
  const textColor = Color.fromHex(menuTextColor)
  const yGap = 85;

  add([
    text("The Shears of Atropos", { font: "AdventProBold", size: 48 }),
    pos(k.width() / 2, 80),
    anchor("center"),
    color(textColor),
    fixed(),
  ]);

  const menu = add([
    pos(k.width() / 2 - 200, k.height() / 4),
    fixed(),
  ]);

  const addMenuRow = (y: number, label: string, description: string, getValue: () => string, onPrev: () => void, onNext: () => void) => {
    const row = menu.add([k.pos(0, y)]);
    const valueStartX = 290;

    row.add([
      text(label, { font: "AdventProRegular", size: 24 }),
      color(textColor),
      pos(0, 0)
    ]);

    const prevBtn = row.add([
      text("🢐", { size: 64 }),
      anchor("center"),
      pos(valueStartX, 15),
      color(textColor),
      area({ shape: new Rect(vec2(-3, -1), 40, 38) }),
    ]);

    const value = getValue()

    const valueText = row.add([
      text(value, { font: "AdventProRegular", size: 24 }),
      pos(valueStartX, 0),
      color(textColor),
      anchor("topleft")
    ]);

    const nextBtn = row.add([
      text("🢒", { size: 64 }),
      anchor("center"),
      pos(valueStartX + 100, 15),
      color(textColor),
      area({ shape: new Rect(vec2(-3, -1), 40, 38) }),
    ]);

    row.add([
      text(description, { font: "AdventProRegular", size: 20 }),
      pos(0, 30),
      color(lightenHex(menuTextColor, 30))
    ])

    const updateUI = () => {
      const value = getValue();
      valueText.text = value;
      let xOffset = value.length >= 3 ? 33 : value.length == 2 ? 39 : 44;
      if (value.indexOf("1") > -1) xOffset += 3

      valueText.pos.x = valueStartX + xOffset
    };

    prevBtn.onClick(() => { k.play("select", { volume: 1 }); onPrev(); updateUI(); });
    nextBtn.onClick(() => { k.play("select", { volume: 1 }); onNext(); updateUI(); });

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

  addMenuRow(yGap, "Versus CPU", "Against CPU or another player", () => vsCpu ? "YES" : "NO",
  () => vsCpu = !vsCpu,
  () => vsCpu = !vsCpu
  );

  addMenuRow(yGap * 2, "Misere", "Collect as few lives as possible", () => isMisere ? "YES" : "NO",
  () => isMisere = !isMisere,
  () => isMisere = !isMisere
  );


const startBtn = menu.add([
  text("Start Game", { font: "AdventProRegular", size: 32 }),
  color(textColor),
  pos(140, yGap * 4),
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
}
