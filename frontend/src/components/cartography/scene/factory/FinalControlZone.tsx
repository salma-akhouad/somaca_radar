import { Text } from '@react-three/drei'


export function FinalControlZone() {
  return (
    <group
      position={[
        21,
        0,
        -19,
      ]}
    >
      {/* Main test surface */}
      <mesh
        position={[
          0,
          0.11,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            8,
            0.22,
            4.6,
          ]}
        />

        <meshStandardMaterial
          color="#747975"
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>


      {/* Vehicle path */}
      <mesh
        position={[
          0,
          0.24,
          0,
        ]}
      >
        <boxGeometry
          args={[
            7.8,
            0.025,
            1.55,
          ]}
        />

        <meshStandardMaterial
          color="#dfb21b"
          roughness={0.78}
        />
      </mesh>


      {/* Roller sections */}
      {[-2.2, 0, 2.2].map(
        (x) => (
          <group key={x}>
            {[-0.52, 0.52].map(
              (z) => (
                <mesh
                  key={z}
                  position={[
                    x,
                    0.35,
                    z,
                  ]}
                  rotation-z={
                    Math.PI / 2
                  }
                >
                  <cylinderGeometry
                    args={[
                      0.28,
                      0.28,
                      0.85,
                      18,
                    ]}
                  />

                  <meshStandardMaterial
                    color="#353a36"
                    metalness={0.5}
                    roughness={0.42}
                  />
                </mesh>
              ),
            )}
          </group>
        ),
      )}


      {/* Small shallow raised test elements */}
      {[-1.1, 1.1].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              0.32,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.6,
                0.12,
                1.5,
              ]}
            />

            <meshStandardMaterial
              color="#929690"
              roughness={0.7}
            />
          </mesh>
        ),
      )}


      {/* Control cabinet */}
      <mesh
        position={[
          4.7,
          0.8,
          -1.65,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.9,
            1.6,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color="#505551"
          roughness={0.63}
        />
      </mesh>


      {/* Active screen */}
      <mesh
        position={[
          4.7,
          1.05,
          -1.29,
        ]}
      >
        <boxGeometry
          args={[
            0.52,
            0.34,
            0.015,
          ]}
        />

        <meshStandardMaterial
          color="#d5e6de"
          emissive="#79aa92"
          emissiveIntensity={0.55}
        />
      </mesh>


      <Text
        position={[
          0,
          0.3,
          -2.75,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.55}
        color="#414542"
        anchorX="center"
      >
        ZONE DE CONTRÔLE FINAL
      </Text>
    </group>
  )
}