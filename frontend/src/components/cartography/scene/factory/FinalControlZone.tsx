import {
  Text,
} from '@react-three/drei'

import {
  VEHICLE_JOURNEY,
} from './data/vehicleJourney'


export function FinalControlZone() {
  const finalControl =
    VEHICLE_JOURNEY.finalControl
  return (
    <group
      position={[
        finalControl.position[0],
        0,
        finalControl.position[2],
      ]}
    >
      {[-1.78, 1.78].map((z) => (
        <mesh
          key={z}
          position={[0, 0.043, z]}
        >
          <boxGeometry
            args={[7.6, 0.012, 0.09]}
          />

          <meshStandardMaterial
            color="#b89229"
            roughness={0.76}
          />
        </mesh>
      ))}

      {[-3.72, 3.72].map((x) => (
        <mesh
          key={x}
          position={[x, 0.043, 0]}
        >
          <boxGeometry
            args={[0.09, 0.012, 3.65]}
          />

          <meshStandardMaterial
            color="#b89229"
            roughness={0.76}
          />
        </mesh>
      ))}


      {[-1.28, 1.28].map((x) => (
        <group key={x}>
          <mesh
            position={[x, 0.065, 0]}
            receiveShadow
          >
            <boxGeometry
              args={[0.76, 0.07, 1.86]}
            />

            <meshStandardMaterial
              color="#666b67"
              metalness={0.25}
              roughness={0.66}
            />
          </mesh>

          {[-0.68, 0.68].map((z) => (
            <mesh
              key={z}
              position={[x, 0.16, z]}
              rotation-z={Math.PI / 2}
              castShadow
            >
              <cylinderGeometry
                args={[
                  0.18,
                  0.18,
                  0.72,
                  24,
                ]}
              />

              <meshStandardMaterial
                color="#2e3430"
                metalness={0.6}
                roughness={0.36}
              />
            </mesh>
          ))}
        </group>
      ))}

      <group
        position={[3.15, 0, 0]}
      >
        {[-0.58, 0.58].map((z) => (
          <group
            key={z}
            position={[0, 0, z]}
          >
            <mesh
              position={[0, 0.72, 0]}
              castShadow
            >
              <boxGeometry
                args={[0.12, 1.44, 0.12]}
              />

              <meshStandardMaterial
                color="#454b47"
                metalness={0.42}
                roughness={0.46}
              />
            </mesh>

            <mesh
              position={[-0.04, 1.22, 0]}
            >
              <boxGeometry
                args={[0.12, 0.52, 0.5]}
              />

              <meshStandardMaterial
                color="#303632"
                roughness={0.48}
              />
            </mesh>

            <mesh
              position={[-0.105, 1.22, 0]}
            >
              <circleGeometry
                args={[0.16, 24]}
              />

              <meshStandardMaterial
                color="#d9d7c9"
                emissive="#d0c799"
                emissiveIntensity={0.14}
                roughness={0.34}
              />
            </mesh>
          </group>
        ))}
      </group>


      <group
        position={[-3.05, 0, 0]}
      >
        <mesh
          position={[0, 0.92, 0]}
          castShadow
        >
          <boxGeometry
            args={[0.14, 1.84, 1.65]}
          />

          <meshStandardMaterial
            color="#424844"
            metalness={0.32}
            roughness={0.5}
          />
        </mesh>

        {[-0.55, 0.55].map((z) => (
          <mesh
            key={z}
            position={[
              0.08,
              1.05,
              z,
            ]}
          >
            <circleGeometry
              args={[0.13, 20]}
            />

            <meshStandardMaterial
              color="#84342f"
              emissive="#a94139"
              emissiveIntensity={0.16}
              roughness={0.3}
            />
          </mesh>
        ))}

        <mesh
          position={[
            0.08,
            0.66,
            0,
          ]}
        >
          <boxGeometry
            args={[0.02, 0.11, 0.62]}
          />

          <meshStandardMaterial
            color="#aa7c28"
            emissive="#a27827"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>

      {[-2.75, 2.75].map((x) => (
        <group
          key={x}
          position={[x, 0, 2.18]}
        >
          <mesh
            position={[0, 1.25, 0]}
            castShadow
          >
            <boxGeometry
              args={[0.11, 2.5, 0.11]}
            />

            <meshStandardMaterial
              color="#474d49"
              metalness={0.42}
              roughness={0.48}
            />
          </mesh>

          <mesh
            position={[0, 2.28, -0.08]}
            rotation-x={-0.22}
          >
            <boxGeometry
              args={[0.72, 0.28, 0.16]}
            />

            <meshStandardMaterial
              color="#303632"
              roughness={0.48}
            />
          </mesh>

          <mesh
            position={[0, 2.25, -0.17]}
            rotation-x={-0.22}
          >
            <boxGeometry
              args={[0.56, 0.14, 0.025]}
            />

            <meshStandardMaterial
              color="#dfddce"
              emissive="#d3cda9"
              emissiveIntensity={0.16}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}


      <mesh
        position={[3.05, 0.78, -2.25]}
        castShadow
      >
        <boxGeometry
          args={[0.9, 1.56, 0.68]}
        />

        <meshStandardMaterial
          color="#4c524e"
          metalness={0.18}
          roughness={0.64}
        />
      </mesh>


      <group
        position={[1.65, 0, -2.15]}
      >
        <mesh
          position={[0, 0.68, 0]}
          castShadow
        >
          <boxGeometry
            args={[1.15, 1.36, 0.5]}
          />

          <meshStandardMaterial
            color="#555b57"
            metalness={0.22}
            roughness={0.6}
          />
        </mesh>

        <mesh
          position={[
            0,
            0.93,
            0.258,
          ]}
        >
          <boxGeometry
            args={[0.86, 0.4, 0.018]}
          />

          <meshStandardMaterial
            color="#252b28"
            roughness={0.4}
          />
        </mesh>

        <mesh
          position={[
            0,
            0.94,
            0.27,
          ]}
        >
          <boxGeometry
            args={[0.72, 0.27, 0.01]}
          />

          <meshStandardMaterial
            color="#b9cec4"
            emissive="#708f80"
            emissiveIntensity={0.16}
            roughness={0.26}
          />
        </mesh>

        {[
          [-0.28, '#6f9b76'],
          [0, '#b69036'],
          [0.28, '#666b67'],
        ].map(([x, color]) => (
          <mesh
            key={String(x)}
            position={[
              Number(x),
              0.5,
              0.27,
            ]}
          >
            <sphereGeometry
              args={[0.04, 12, 12]}
            />

            <meshStandardMaterial
              color={String(color)}
              emissive={String(color)}
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
      </group>


      <mesh
        position={[3.05, 1.02, -1.902]}
      >
        <boxGeometry
          args={[0.56, 0.4, 0.018]}
        />

        <meshStandardMaterial
          color="#242a27"
          roughness={0.45}
        />
      </mesh>

      <mesh
        position={[3.05, 1.04, -1.89]}
      >
        <boxGeometry
          args={[0.45, 0.28, 0.012]}
        />

        <meshStandardMaterial
          color="#b9cbc2"
          emissive="#698d7c"
          emissiveIntensity={0.16}
          roughness={0.3}
        />
      </mesh>


      {[
        [-0.2, '#6f9b76'],
        [0, '#b69036'],
        [0.2, '#666b67'],
      ].map(([offset, color]) => (
        <mesh
          key={String(offset)}
          position={[
            3.05 + Number(offset),
            0.74,
            -1.885,
          ]}
        >
          <sphereGeometry
            args={[0.035, 12, 12]}
          />

          <meshStandardMaterial
            color={String(color)}
            emissive={String(color)}
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}


      <Text
        position={[0, 0.055, -2.35]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.48}
        color="#303532"
        anchorX="center"
        anchorY="middle"
      >
        CONTRÔLE FINAL
      </Text>
    </group>
  )
}