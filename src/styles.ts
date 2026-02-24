import { Player1OrPlayer2 } from "./types";

export const backgroundColor = "#dddddd"
export const edgeColor = "#bbbbbb"
export const playerColors:Record<Player1OrPlayer2, string> = {
  1: "#8888dd",
  2: "#dd8888"
};
export const playerBackgrounds:Record<Player1OrPlayer2, string> = {
  1: lightenHex("#8888dd", 60),
  2: lightenHex("#dd8888", 60)
}

function lightenHex(hex: string, percent: number): string {
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
