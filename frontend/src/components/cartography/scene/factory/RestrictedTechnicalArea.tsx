import { Text } from '@react-three/drei'

export function RestrictedTechnicalArea() {
  return (
    <group
      position={[
        21,
        0,
        -23.4,
      ]}
    >
      {/* =====================================================
          ELECTRICAL / TECHNICAL CABINET
          Gives a reason for the restricted marking.
          ===================================================== */}

      <mesh
        position={[
          0,
          1.15,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            1.55,
            2.3,
            0.85,
          ]}
        />

        <meshStandardMaterial
          color="#555a56"
          metalness={0.22}
          roughness={0.64}
        />
      </mesh>

      {/* Cabinet door */}
      <mesh
        position={[
          0,
          1.18,
          0.435,
        ]}
      >
        <boxGeometry
          args={[
            1.28,
            1.85,
            0.025,
          ]}
        />

        <meshStandardMaterial
          color="#606561"
          roughness={0.67}
        />
      </mesh>

      {/* Warning panel */}
      <mesh
        position={[
          0,
          1.45,
          0.46,
        ]}
      >
        <boxGeometry
          args={[
            0.5,
            0.42,
            0.025,
          ]}
        />

        <meshStandardMaterial
          color="#d9ad19"
          roughness={0.72}
        />
      </mesh>

      {/* Status light */}
      <mesh
        position={[
          0.48,
          1.9,
          0.47,
        ]}
      >
        <sphereGeometry
          args={[
            0.055,
            12,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#6abb72"
          emissive="#4ea95a"
          emissiveIntensity={0.55}
        />
      </mesh>

      <Text
        position={[
          0,
          0.08,
          1.25,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.32}
        color="#77342d"
        anchorX="center"
      >
        ACCÈS TECHNIQUE
      </Text>
    </group>
  )
}