import { KAPLAYCtx } from "kaplay";
import { Player1OrPlayer2 } from "./types";

export const menuTextColor = "#333333"
export const backgroundColor = "#dddddd"
export const edgeColor = "#000000"
export const nodeColor = "#000000"
export const playerColors:Record<Player1OrPlayer2, string> = {
  1: "#ffffff",
  2: "#888888",
};
export const playerTextColors:Record<Player1OrPlayer2, string> = {
  1: "#ffffff",
  2: "#888888",
}

export function lightenHex(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");

  let r = parseInt(cleanHex.substring(0, 2), 16);
  let g = parseInt(cleanHex.substring(2, 4), 16);
  let b = parseInt(cleanHex.substring(4, 6), 16);

  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  const getHex = (c: number) => c.toString(16).padStart(2, "0");

  return `#${getHex(r)}${getHex(g)}${getHex(b)}`;
}

export function addBackground(k: KAPLAYCtx) {
  return k.add([
    k.fixed(),
    k.z(-100),
    {
      draw() {
        k.drawRect({
          width: k.width(),
          height: k.height(),
          gradient: [k.rgb(221, 221, 221), k.rgb(190, 190, 190)],
          fill: true,
        });
      },
    },
  ]);
}
