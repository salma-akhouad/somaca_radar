interface PedestrianPassageProps {
  position: [number, number, number]
  rotation?: number
  length?: number
  width?: number
}

export function PedestrianPassage({
  position,
  rotation = 0,
  length = 4.8,
  width = 4.4,
}: PedestrianPassageProps) {
  const stripeCount = 7

  const stripePositions = Array.from(
    { length: stripeCount },
    (_, index) => {
      const spacing =
        width / (stripeCount + 1)

      return (
        -width / 2 +
        spacing * (index + 1)
      )
    },
  )

  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* Yellow boundary — first side */}
      <mesh
        position={[
          0,
          0.027,
          -width / 2,
        ]}
        rotation-x={-Math.PI / 2}
      >
        <planeGeometry
          args={[length, 0.11]}
        />

        <meshStandardMaterial
          color="#e8b51b"
          roughness={0.82}
        />
      </mesh>

      {/* Yellow boundary — second side */}
      <mesh
        position={[
          0,
          0.027,
          width / 2,
        ]}
        rotation-x={-Math.PI / 2}
      >
        <planeGeometry
          args={[length, 0.11]}
        />

        <meshStandardMaterial
          color="#e8b51b"
          roughness={0.82}
        />
      </mesh>

      {/* White pedestrian stripes */}
      {stripePositions.map(
        (z) => (
          <mesh
            key={z}
            position={[
              0,
              0.03,
              z,
            ]}
            rotation-x={
              -Math.PI / 2
            }
          >
            <planeGeometry
              args={[
                length - 0.35,
                0.34,
              ]}
            />

            <meshStandardMaterial
              color="#f5f3eb"
              roughness={0.92}
            />
          </mesh>
        ),
      )}
    </group>
  )
}