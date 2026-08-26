import {
  Shape,
} from 'three'


export type FlowDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'


interface VehicleFlowMarkerProps {
  position: [
    number,
    number,
    number,
  ]

  direction: FlowDirection

  scale?: number
}


const arrowShape =
  new Shape()

arrowShape.moveTo(-0.72, -0.16)
arrowShape.lineTo(0.16, -0.16)
arrowShape.lineTo(0.16, -0.39)
arrowShape.lineTo(0.78, 0)
arrowShape.lineTo(0.16, 0.39)
arrowShape.lineTo(0.16, 0.16)
arrowShape.lineTo(-0.72, 0.16)
arrowShape.closePath()


export function VehicleFlowMarker({
  position,
  direction,
  scale = 1,
}: VehicleFlowMarkerProps) {
  /**
   * Base arrow points toward +X.
   *
   * On our factory floor:
   *
   * right = +X
   * left  = -X
   * up    = +Z
   * down  = -Z
   */
  const rotation =
    direction === 'right'
      ? 0
      : direction === 'left'
        ? Math.PI
        : direction === 'up'
          ? -Math.PI / 2
          : Math.PI / 2


  return (
    <group
      position={position}
      rotation-y={rotation}
      scale={[
        scale,
        scale,
        scale,
      ]}
    >
      <mesh
        rotation-x={
          -Math.PI / 2
        }
      >
        <shapeGeometry
          args={[
            arrowShape,
          ]}
        />

        <meshStandardMaterial
          color="#414743"
          roughness={0.74}
        />
      </mesh>
    </group>
  )
}