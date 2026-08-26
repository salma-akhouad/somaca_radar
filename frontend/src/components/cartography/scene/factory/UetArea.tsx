import { Text } from '@react-three/drei'

interface UetAreaProps {
  position: [number, number, number]
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
  const borderColor = '#b8942b'

  return (
    <group position={position}>
      {/* UET boundaries are painted markings,
          not a second floor surface. */}

      {[-depth / 2, depth / 2].map((z) => (
        <mesh
          key={`horizontal-${z}`}
          position={[0, 0.038, z]}
        >
          <boxGeometry
            args={[width, 0.012, 0.075]}
          />

          <meshStandardMaterial
            color={borderColor}
            roughness={0.78}
          />
        </mesh>
      ))}

      {[-width / 2, width / 2].map((x) => (
        <mesh
          key={`vertical-${x}`}
          position={[x, 0.038, 0]}
        >
          <boxGeometry
            args={[0.075, 0.012, depth]}
          />

          <meshStandardMaterial
            color={borderColor}
            roughness={0.78}
          />
        </mesh>
      ))}

      {/* Corner emphasis:
          small marks make the work-zone boundary readable
          without filling the entire floor with color. */}

      {[
        [-width / 2, -depth / 2],
        [width / 2, -depth / 2],
        [-width / 2, depth / 2],
        [width / 2, depth / 2],
      ].map(([x, z], index) => (
        <mesh
          key={index}
          position={[x, 0.041, z]}
        >
          <boxGeometry
            args={[0.24, 0.014, 0.24]}
          />

          <meshStandardMaterial
            color="#a98326"
            roughness={0.76}
          />
        </mesh>
      ))}

      <Text
        position={[0, 0.052, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.72}
        color="#4b504c"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}