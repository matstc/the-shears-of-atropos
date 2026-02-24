import { GameObj } from "kaplay"
import "kaplay/global"
import { hoverable } from "./hoverable"
import { edgeColor } from "./styles"

export type NodeOpt = {
  x: number
  y: number
  onRemove: (node:GameObj) => void
  boardDimension: number
  screenDimension: number
}

export const nodeFactory = (opt: NodeOpt): GameObj => {
  const x = opt.x
  const y = opt.y
  const onRemove = opt.onRemove
  const radius = Math.floor(opt.screenDimension / opt.boardDimension / (35 / opt.boardDimension))

  const node = add([
    circle(radius),
    pos(x, y),
    color(Color.fromHex(edgeColor)),
    anchor("center"),
    z(5),
    area(),
    hoverable(),
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

  node.add([
    circle(Math.floor(radius - radius / 3)),
    color(WHITE),
    anchor("center"),
  ])

  return node
}
