import { GameObj } from "kaplay";

export function hoverable() {
  return {
    id: "hoverable",
    require: ["area"],
    hovering: false,
    add(this: GameObj) {
      this.onHover(() => {
        this.hovering = true;
      });
      this.onHoverEnd(() => {
        this.hovering = false;
      });
    },
  };
}
