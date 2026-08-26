import {
  RoundedBox,
  Text,
} from '@react-three/drei'


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
          RESTRICTED TECHNICAL AREA

          This zone belongs beside final-control equipment.

          It represents electrical / automation infrastructure
          that should not be entered casually by operators.
          ===================================================== */}


      {/* Main electrical cabinet */}
      <RoundedBox
        args={[
          1.5,
          2.2,
          0.82,
        ]}
        radius={0.07}
        smoothness={3}
        position={[
          0,
          1.1,
          0,
        ]}
        castShadow
      >
        <meshStandardMaterial
          color="#555b57"
          metalness={0.26}
          roughness={0.58}
        />
      </RoundedBox>


      {/* Cabinet door inset */}
      <mesh
        position={[
          0,
          1.14,
          0.417,
        ]}
      >
        <boxGeometry
          args={[
            1.2,
            1.78,
            0.015,
          ]}
        />

        <meshStandardMaterial
          color="#616762"
          roughness={0.62}
        />
      </mesh>


      {/* Door handle */}
      <RoundedBox
        args={[
          0.06,
          0.28,
          0.06,
        ]}
        radius={0.018}
        smoothness={2}
        position={[
          0.48,
          1.08,
          0.45,
        ]}
      >
        <meshStandardMaterial
          color="#2f3531"
          metalness={0.45}
          roughness={0.4}
        />
      </RoundedBox>


      {/* Warning plate */}
      <RoundedBox
        args={[
          0.44,
          0.36,
          0.025,
        ]}
        radius={0.025}
        smoothness={2}
        position={[
          0,
          1.48,
          0.44,
        ]}
      >
        <meshStandardMaterial
          color="#b79530"
          roughness={0.7}
        />
      </RoundedBox>


      {/* Small warning symbol */}
      <Text
        position={[
          0,
          1.49,
          0.456,
        ]}
        fontSize={0.19}
        color="#2d312f"
        anchorX="center"
        anchorY="middle"
      >
        ⚡
      </Text>


      {/* =====================================================
          STATUS INDICATORS
          ===================================================== */}

      <mesh
        position={[
          0.46,
          1.88,
          0.445,
        ]}
      >
        <sphereGeometry
          args={[
            0.045,
            12,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#6ea777"
          emissive="#4e8d59"
          emissiveIntensity={0.38}
        />
      </mesh>


      <mesh
        position={[
          0.31,
          1.88,
          0.445,
        ]}
      >
        <sphereGeometry
          args={[
            0.045,
            12,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#8e4039"
          emissive="#722f2b"
          emissiveIntensity={0.18}
        />
      </mesh>


      {/* =====================================================
          CABLE CONDUIT

          Small detail, but it gives the cabinet a reason to
          exist physically rather than looking like decoration.
          ===================================================== */}

      <mesh
        position={[
          -0.55,
          0.42,
          -0.28,
        ]}
        rotation-z={Math.PI / 2}
      >
        <cylinderGeometry
          args={[
            0.045,
            0.045,
            1.15,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#373d39"
          metalness={0.36}
          roughness={0.5}
        />
      </mesh>


      {/* Technical access label */}
      <Text
        position={[
          0,
          0.045,
          1.2,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.28}
        color="#6f332e"
        anchorX="center"
        anchorY="middle"
      >
        ACCÈS TECHNIQUE
      </Text>
    </group>
  )
}