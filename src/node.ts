import { GameObj, KAPLAYCtx } from "kaplay"
import "kaplay/global"
import { nodeColor } from "./styles"

export type NodeOpt = {
  x: number
  y: number
  nodeRadius: number
  onRemove: (node:GameObj) => void
  boardDimension: number
  getCurrentColor: () => string
}

export const nodeFactory = (opt: NodeOpt): GameObj => {
  const x = opt.x
  const y = opt.y
  const onRemove = opt.onRemove

  const node = add([
    circle(opt.nodeRadius, { fill: false }),
    pos(x, y),
    outline(1, Color.fromHex(nodeColor)),
    anchor("center"),
    z(5),
    area(),
    "shape",
    "node",
    {
      isCaptured: false,
      edges: [] as GameObj[],
      removeEdge(this: any, edge: GameObj) {
        this.edges = this.edges.filter((x:GameObj) => x !== edge)
        if (this.edges.length === 0) {
          this.isCaptured = true;
          const captureColor = Color.fromHex(opt.getCurrentColor());
          this.outline.color = captureColor;

          const inside = this.add([
            circle(node.radius),
            color(captureColor),
            anchor("center"),
            opacity(0),
            z(4),
          ]);

          tween(0, 1, 0.8, (val) => inside.opacity = val, easings.linear);

          onRemove(node)
        }
      }
    }
  ])

  return node
}
