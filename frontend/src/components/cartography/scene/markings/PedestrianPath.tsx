interface PedestrianPathProps {
  position: [number, number, number]
  length: number
  width?: number
  rotation?: number
}

export function PedestrianPath({
  position,
  length,
  width = 1.15,
  rotation = 0,
}: PedestrianPathProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* Safe walking surface */}
      <mesh
        position={[0, 0.026, 0]}
        rotation-x={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry
          args={[
            length,
            width,
          ]}
        />

        <meshStandardMaterial
          color="#dedfd9"
          roughness={0.9}
        />
      </mesh>

      {/* Yellow safety boundary 1 */}
      <mesh
        position={[
          0,
          0.032,
          width / 2,
        ]}
      >
        <boxGeometry
          args={[
            length,
            0.015,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color="#d5a917"
          roughness={0.78}
        />
      </mesh>

      {/* Yellow safety boundary 2 */}
      <mesh
        position={[
          0,
          0.032,
          -width / 2,
        ]}
      >
        <boxGeometry
          args={[
            length,
            0.015,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color="#d5a917"
          roughness={0.78}
        />
      </mesh>
    </group>
  )
}