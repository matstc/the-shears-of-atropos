import { GameObj } from "kaplay"
import "kaplay/global"

export const edgeFactory = (node1:GameObj, node2:GameObj, onRemove: (edge:GameObj) => void): GameObj => {
  const dx = node2.pos.x - node1.pos.x
  const dy = node2.pos.y - node1.pos.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  const edge = add([
    rect(distance, 10),
    pos(node1.pos.x, node1.pos.y),
    rotate(angle),
    anchor("left"),
    area(),
    color([200, 200, 200]),
    { node1, node2 },
    "edge",
  ])

  edge.onHover(() => {
    setCursor("pointer")
    edge.color = rgb(255, 100, 100)
  })

  edge.onHoverEnd(() => {
    setCursor("default")
    edge.color = rgb(200, 200, 200)
  })

  edge.onClick(() => {
    node1.removeEdge(edge)
    node2.removeEdge(edge)
    setCursor("default")
    onRemove(edge)
    edge.destroy()
  })

  node1.edges.push(edge)
  node2.edges.push(edge)

  return edge
}
