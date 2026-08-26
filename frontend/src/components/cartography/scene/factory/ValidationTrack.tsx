import { Text } from '@react-three/drei'

export function ValidationTrack() {
  return (
    <group
      position={[
        30,
        0,
        -19,
      ]}
    >
      {/* Track floor */}
      <mesh
        position={[
          0,
          0.08,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            14,
            0.16,
            4.2,
          ]}
        />

        <meshStandardMaterial
          color="#696e6a"
          roughness={0.88}
        />
      </mesh>

      {/* Low relief testing */}
      {[
        -3.2,
        -2.25,
        -1.3,
        0.8,
        1.75,
        2.7,
      ].map(
        (x, index) => (
          <mesh
            key={x}
            position={[
              x,
              index % 2 === 0
                ? 0.22
                : 0.17,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.48,
                index % 2 === 0
                  ? 0.22
                  : 0.12,
                3.65,
              ]}
            />

            <meshStandardMaterial
              color={
                index % 2 === 0
                  ? '#828782'
                  : '#777c78'
              }
              roughness={0.74}
            />
          </mesh>
        ),
      )}

      {/* Final reference/braking markings */}
      {[4.4, 5, 5.6].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              0.18,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.14,
                0.025,
                3.8,
              ]}
            />

            <meshStandardMaterial
              color="#eeeDE7"
            />
          </mesh>
        ),
      )}

      <Text
        position={[
          0,
          0.2,
          -2.55,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.56}
        color="#414642"
        anchorX="center"
      >
        PISTE DE VALIDATION
      </Text>
    </group>
  )
}