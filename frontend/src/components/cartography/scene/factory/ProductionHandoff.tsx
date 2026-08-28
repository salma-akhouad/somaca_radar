import {
  Shape,
} from 'three'


const arrowShape =
  new Shape()

arrowShape.moveTo(
  -0.55,
  -0.12,
)

arrowShape.lineTo(
  0.12,
  -0.12,
)

arrowShape.lineTo(
  0.12,
  -0.3,
)

arrowShape.lineTo(
  0.62,
  0,
)

arrowShape.lineTo(
  0.12,
  0.3,
)

arrowShape.lineTo(
  0.12,
  0.12,
)

arrowShape.lineTo(
  -0.55,
  0.12,
)

arrowShape.closePath()


function FlowArrow({
  position,
  rotation = 0,
}: {
  position: [
    number,
    number,
    number,
  ]

  rotation?: number
}) {
  return (
    <mesh
      position={position}
      rotation-x={
        -Math.PI / 2
      }
      rotation-z={rotation}
    >
      <shapeGeometry
        args={[
          arrowShape,
        ]}
      />

      <meshStandardMaterial
        color="#e3e2da"
        roughness={0.76}
      />
    </mesh>
  )
}


export function ProductionHandoff() {
  return (
    <group>
      <mesh
        position={[
          17,
          0.041,
          -16.25,
        ]}
      >
        <boxGeometry
          args={[
            2.1,
            0.012,
            0.09,
          ]}
        />

        <meshStandardMaterial
          color="#c49a25"
          roughness={0.76}
        />
      </mesh>

      <FlowArrow
        position={[
          17,
          0.047,
          -17,
        ]}
        rotation={
          Math.PI / 2
        }
      />

      <FlowArrow
        position={[
          17,
          0.047,
          -18.2,
        ]}
        rotation={
          Math.PI / 2
        }
      />

      <FlowArrow
        position={[
          19.2,
          0.047,
          -19,
        ]}
      />
    </group>
  )
}