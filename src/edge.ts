import { GameObj } from "kaplay"
import "kaplay/global"

export const edgeFactory = (node1: GameObj, node2: GameObj, onRemove: (edge: GameObj) => void, getCurrentColor: Function): GameObj => {
  const dx = node2.pos.x - node1.pos.x
  const dy = node2.pos.y - node1.pos.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  const DEFAULT_COLOR = rgb(200, 200, 200)
  const ANIM_DURATION = 0.2 // seconds

  const edge = add([
    rect(distance, 30),
    pos(node1.pos.x, node1.pos.y),
    rotate(angle),
    anchor("left"),
    area(),
    color(DEFAULT_COLOR),
    { node1, node2, currentTween: null },
    "edge",
  ])

  edge.onHover(() => {
    setCursor("pointer")
    const targetColor = Color.fromHex(getCurrentColor())

    if (edge.currentTween) edge.currentTween.cancel()

    edge.currentTween = tween(
      edge.color,
      targetColor,
      ANIM_DURATION,
      (val) => edge.color = val,
      easings.easeOutQuad
    )
  })

  edge.onHoverEnd(() => {
    setCursor("default")

    if (edge.currentTween) edge.currentTween.cancel()

    edge.currentTween = tween(
      edge.color,
      DEFAULT_COLOR,
      ANIM_DURATION,
      (val) => edge.color = val,
      easings.easeOutQuad
    )
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
