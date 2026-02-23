import { GameObj } from "kaplay"
import "kaplay/global"

export type NodeOpt = {
  x: number
  y: number
}

export const nodeFactory = (opt: NodeOpt, onRemove: (node:GameObj) => void): GameObj => {
  const x = opt.x
  const y = opt.y

  const node = add([
    circle(30),
    pos(x, y),
    color(BLACK),
    anchor("center"),
    z(5),
    "shape",
    "node",
    {
      edges: [] as GameObj[],
      removeEdge(this: any, edge: GameObj) {
        this.edges = this.edges.filter((x:GameObj) => x !== edge)
        if (this.edges.length === 0) {
          onRemove(node)
          node.destroy()
        }
      }
    }
  ])

  return node
}
