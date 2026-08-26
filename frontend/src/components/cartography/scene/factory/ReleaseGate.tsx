import { Text } from '@react-three/drei'

export function ReleaseGate() {
  return (
    <group
      position={[
        40,
        0,
        -19,
      ]}
    >
      {/* Left/right columns */}
      {[-2.35, 2.35].map(
        (z) => (
          <group key={z}>
            <mesh
              position={[
                0,
                2.25,
                z,
              ]}
              castShadow
            >
              <boxGeometry
                args={[
                  0.34,
                  4.5,
                  0.34,
                ]}
              />

              <meshStandardMaterial
                color="#3c413d"
                metalness={0.35}
                roughness={0.52}
              />
            </mesh>

            <mesh
              position={[
                0,
                0.45,
                z,
              ]}
            >
              <boxGeometry
                args={[
                  0.5,
                  0.9,
                  0.5,
                ]}
              />

              <meshStandardMaterial
                color="#d9ad19"
              />
            </mesh>
          </group>
        ),
      )}

      {/* Beam */}
      <mesh
        position={[
          0,
          4.35,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.34,
            0.42,
            5,
          ]}
        />

        <meshStandardMaterial
          color="#3c413d"
        />
      </mesh>

      {/* Release light */}
      <mesh
        position={[
          0.2,
          3.7,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            0.12,
            14,
            14,
          ]}
        />

        <meshStandardMaterial
          color="#5ebd69"
          emissive="#48a855"
          emissiveIntensity={0.75}
        />
      </mesh>

      <Text
        position={[
          0.2,
          4.35,
          0,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
        fontSize={0.32}
        color="#f5f3ec"
        anchorX="center"
      >
        SORTIE VÉHICULES FINIS
      </Text>
    </group>
  )
}