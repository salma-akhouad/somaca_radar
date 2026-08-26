interface IndustrialLaneProps {
  position: [number, number, number]
  length?: number
  width?: number
  rotation?: number
  corner?: boolean
  color?: string
}

export function IndustrialLane({
  position,
  length = 18,
  width = 1.1,
  rotation = 0,
  corner = false,
  color = '#b9932b',
}: IndustrialLaneProps) {
  /*
   * IndustrialLane now represents route MARKINGS,
   * not a solid painted road.
   *
   * The continuous concrete factory floor remains visible
   * between the two safety lines.
   */

  if (corner) {
    const radius = length

    return (
      <group position={position}>
        {[
          radius - width / 2,
          radius + width / 2,
        ].map((lineRadius) => (
          <mesh
            key={lineRadius}
            rotation={[
              -Math.PI / 2,
              0,
              rotation,
            ]}
          >
            <ringGeometry
              args={[
                lineRadius - 0.04,
                lineRadius + 0.04,
                40,
                1,
                Math.PI,
                Math.PI / 2,
              ]}
            />

            <meshStandardMaterial
              color={color}
              roughness={0.76}
              metalness={0}
            />
          </mesh>
        ))}
      </group>
    )
  }

  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {[
        -(width / 2),
        width / 2,
      ].map((z) => (
        <mesh
          key={z}
          position={[
            0,
            0,
            z,
          ]}
          rotation-x={-Math.PI / 2}
        >
          <planeGeometry
            args={[
              length,
              0.08,
            ]}
          />

          <meshStandardMaterial
            color={color}
            roughness={0.76}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  )
}