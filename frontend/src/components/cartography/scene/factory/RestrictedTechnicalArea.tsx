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

      <RoundedBox
        args={[
          0.5,
          0.4,
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
          color="#d0a72d"
          roughness={0.7}
        />
      </RoundedBox>

      <Text
        position={[
          0,
          1.49,
          0.456,
        ]}
        fontSize={0.21}
        color="#2d312f"
        anchorX="center"
        anchorY="middle"
      >
        ⚡
      </Text>

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
            10,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#d3a52d"
          emissive="#b98923"
          emissiveIntensity={0.24}
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
            10,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#8e4039"
          emissive="#722f2b"
          emissiveIntensity={0.16}
        />
      </mesh>

      <mesh
        position={[
          -0.55,
          0.42,
          -0.28,
        ]}
        rotation-z={
          Math.PI / 2
        }
      >
        <cylinderGeometry
          args={[
            0.045,
            0.045,
            1.15,
            8,
          ]}
        />

        <meshStandardMaterial
          color="#373d39"
          metalness={0.36}
          roughness={0.5}
        />
      </mesh>

      <group
        position={[
          0,
          2.85,
          0.32,
        ]}
      >
        <mesh>
          <boxGeometry
            args={[
              4.4,
              1.05,
              0.09,
            ]}
          />

          <meshStandardMaterial
            color="#deddd5"
            roughness={0.78}
          />
        </mesh>

        <mesh
          position={[
            0,
            0.43,
            0.052,
          ]}
        >
          <boxGeometry
            args={[
              4.15,
              0.09,
              0.02,
            ]}
          />

          <meshStandardMaterial
            color="#8c342e"
            roughness={0.7}
          />
        </mesh>

        <mesh
          position={[
            0,
            -0.43,
            0.052,
          ]}
        >
          <boxGeometry
            args={[
              4.15,
              0.09,
              0.02,
            ]}
          />

          <meshStandardMaterial
            color="#8c342e"
            roughness={0.7}
          />
        </mesh>

        <Text
          position={[
            0,
            0,
            0.058,
          ]}
          fontSize={0.39}
          color="#702821"
          anchorX="center"
          anchorY="middle"
        >
          ACCÈS TECHNIQUE RÉSERVÉ
        </Text>
      </group>
    </group>
  )
}