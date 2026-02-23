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
    circle(10),
    pos(x, y),
    color(BLACK),
    anchor("center"),
    z(5),
    "shape",
    "node",
    {
      edges: [],
      removeEdge(edge) {
        this.edges = this.edges.filter(x => x !== edge)
        if (this.edges.length === 0) {
          onRemove(node)
          node.destroy()
        }
      }
    }
  ])

  return node
}
