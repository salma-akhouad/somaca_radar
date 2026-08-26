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
  color = '#e8b51b',
}: IndustrialLaneProps) {
  if (corner) {
    const radius = length

    return (
      <mesh
        position={position}
        rotation={[
          -Math.PI / 2,
          0,
          rotation,
        ]}
        receiveShadow
      >
        <ringGeometry
          args={[
            radius - width / 2,
            radius + width / 2,
            32,
            1,
            Math.PI,
            Math.PI / 2,
          ]}
        />

        <meshStandardMaterial
          color={color}
          roughness={0.78}
          metalness={0}
        />
      </mesh>
    )
  }

  return (
    <mesh
      position={position}
      rotation={[
        -Math.PI / 2,
        0,
        rotation,
      ]}
      receiveShadow
    >
      <planeGeometry
        args={[
          length,
          width,
        ]}
      />

      <meshStandardMaterial
        color={color}
        roughness={0.78}
        metalness={0}
      />
    </mesh>
  )
}