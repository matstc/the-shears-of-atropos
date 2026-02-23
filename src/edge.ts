import { GameObj } from "kaplay"
import "kaplay/global"
import { hoverable } from "./hoverable"
import { edgeColor } from "./styles"

export const edgeFactory = (node1: GameObj, node2: GameObj, onRemove: (edge: GameObj) => void, getCurrentColor: Function): GameObj => {
  const dx = node2.pos.x - node1.pos.x
  const dy = node2.pos.y - node1.pos.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  const animDuration = 0.2 // seconds

  const edge = add([
    rect(distance, 30),
    pos(node1.pos.x, node1.pos.y),
    rotate(angle),
    anchor("left"),
    area(),
    hoverable(),
    color(Color.fromHex(edgeColor)),
    "edge",
    {
      node1,
      node2,
      currentTween: null,
      active: false,
      isDeleting: false,
      activate() {
        if (this.active) return;

        this.active = true
        const targetColor = Color.fromHex(getCurrentColor())

        if (this.currentTween) this.currentTween.cancel()

        this.currentTween = tween(
          this.color,
          targetColor,
          animDuration,
          (val) => this.color = val,
          easings.easeOutQuad
        )
      },
      deactivate() {
        if (!this.active) return;

        this.active = false
        if (this.currentTween) this.currentTween.cancel()

        this.currentTween = tween(
          this.color,
          Color.fromHex(edgeColor),
          animDuration,
          (val) => this.color = val,
          easings.easeOutQuad
        )
      }
    },
  ])

  edge.onClick(async () => {
    if (!edge.active) return;
    if (edge.isDeleting) return;

    edge.isDeleting = true;

    if (isTouchscreen()) {
      edge.activate();
      await wait(0.2);
    }

    node1.removeEdge(edge);
    node2.removeEdge(edge);
    setCursor("default");
    onRemove(edge);
    edge.destroy();
  })

  node1.edges.push(edge)
  node2.edges.push(edge)

  return edge
}
