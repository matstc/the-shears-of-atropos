import { GameObj, KAPLAYCtx } from "kaplay"
import "kaplay/global"
import { hoverable } from "./hoverable"
import { nodeColor } from "./styles"

export type NodeOpt = {
  x: number
  y: number
  nodeRadius: number
  onRemove: (node:GameObj) => void
  boardDimension: number
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
    hoverable(),
    "shape",
    "node",
    {
      isCaptured: false,
      edges: [] as GameObj[],
      removeEdge(this: any, edge: GameObj) {
        this.edges = this.edges.filter((x:GameObj) => x !== edge)
        if (this.edges.length === 0) {
          this.isCaptured = true;
          onRemove(node)
        }
      }
    }
  ])

  return node
}
