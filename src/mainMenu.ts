import { KAPLAYCtx } from "kaplay";

let dimension = 4;
let isMisere = false;
let vsCpu = true;

export function createMenu(k: KAPLAYCtx<any, never>, onStart:(dimension:number, misere:boolean, vsCpu:boolean) => void) {
  k.add([
    k.text("The Shears of Atropos", { size: 48 }),
    k.pos(k.width() / 2, 80),
    k.anchor("center"),
    k.fixed(),
  ]);

  const menu = k.add([
    k.pos(k.width() / 2 - 160, k.height() / 2 - 100),
    k.fixed(),
  ]);

  const addMenuRow = (y: number, label: string, getValue: () => string, onPrev: () => void, onNext: () => void) => {
    const row = menu.add([k.pos(0, y)]);

    const labelText = row.add([
      k.text(`${label}:`, { size: 24 }),
      k.pos(0, 0)
    ]);

    const valueStartX = 200;

    const prevBtn = row.add([
      k.text("<", { size: 24 }),
      k.pos(valueStartX, 0),
      k.area(),
    ]);

    const valueText = row.add([
      k.text(getValue(), { size: 24 }),
      k.pos(valueStartX + 40, 0),
      k.anchor("topleft")
    ]);

    const nextBtn = row.add([
      k.text(">", { size: 24 }),
      k.pos(valueStartX + 100, 0),
      k.area(),
    ]);

    const updateUI = () => {
      valueText.text = getValue();
    };

    prevBtn.onClick(() => { onPrev(); updateUI(); });
    nextBtn.onClick(() => { onNext(); updateUI(); });

    [prevBtn, nextBtn].forEach(btn => {
      btn.onHoverUpdate(() => {
        btn.color = k.rgb(255, 255, 255);
        k.setCursor("pointer");
      });
      btn.onHoverEnd(() => {
        btn.color = k.rgb(180, 180, 180);
        k.setCursor("default");
      });
    });

    updateUI();
  };

  addMenuRow(0, "Dimension", () => dimension.toString(),
  () => { if (dimension > 2) dimension--; },
  () => { if (dimension < 7) dimension++; }
);

addMenuRow(50, "Misere play", () => isMisere ? "YES" : "NO",
() => isMisere = !isMisere,
() => isMisere = !isMisere
);

addMenuRow(100, "Versus CPU", () => vsCpu ? "YES" : "NO",
() => vsCpu = !vsCpu,
() => vsCpu = !vsCpu
);

const settingsBtn = menu.add([
  k.text("Settings", { size: 24 }),
  k.pos(0, 150),
  k.area(),
  k.color(180, 180, 180),
]);

const startBtn = menu.add([
  k.text("Start Game", { size: 32 }),
  k.pos(0, 220),
  k.area(),
  k.color(100, 255, 100),
]);

startBtn.onClick(() => {
  onStart(dimension, isMisere, vsCpu)
});

[settingsBtn, startBtn].forEach(btn => {
  btn.onHoverUpdate(() => {
    btn.scale = k.vec2(1.05);
    k.setCursor("pointer");
  });
  btn.onHoverEnd(() => {
    btn.scale = k.vec2(1);
    k.setCursor("default");
  });
});
}
