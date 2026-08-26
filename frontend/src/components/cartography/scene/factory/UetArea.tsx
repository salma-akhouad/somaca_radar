import { Text } from '@react-three/drei'

interface UetAreaProps {
  position: [
    number,
    number,
    number,
  ]

  width?: number
  depth?: number
  label: string
}

export function UetArea({
  position,
  width = 8,
  depth = 6,
  label,
}: UetAreaProps) {
  const borderColor =
    '#d3a715'

  return (
    <group position={position}>
      {/* Subtle zone floor */}
      <mesh
        position={[
          0,
          0.018,
          0,
        ]}
        rotation-x={
          -Math.PI / 2
        }
        receiveShadow
      >
        <planeGeometry
          args={[
            width,
            depth,
          ]}
        />

        <meshStandardMaterial
          color="#c7c8c2"
          transparent
          opacity={0.34}
          roughness={0.96}
        />
      </mesh>

      {/* Horizontal borders */}
      {[
        -depth / 2,
        depth / 2,
      ].map((z) => (
        <mesh
          key={z}
          position={[
            0,
            0.035,
            z,
          ]}
        >
          <boxGeometry
            args={[
              width,
              0.018,
              0.11,
            ]}
          />

          <meshStandardMaterial
            color={borderColor}
          />
        </mesh>
      ))}

      {/* Vertical borders */}
      {[
        -width / 2,
        width / 2,
      ].map((x) => (
        <mesh
          key={x}
          position={[
            x,
            0.035,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.11,
              0.018,
              depth,
            ]}
          />

          <meshStandardMaterial
            color={borderColor}
          />
        </mesh>
      ))}

      {/* Only stable map identity */}
      <Text
        position={[
          0,
          0.065,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.9}
        color="#454946"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}