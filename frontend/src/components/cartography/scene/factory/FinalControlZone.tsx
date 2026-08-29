import {
  Text,
} from '@react-three/drei'

import {
  VEHICLE_JOURNEY,
} from './data/vehicleJourney'


function SensorPost({
  position,
  facing,
}: {
  position: [
    number,
    number,
    number,
  ]

  facing: number
}) {
  return (
    <group
      position={position}
    >
      <mesh
        position={[
          0,
          0.75,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.13,
            1.5,
            0.13,
          ]}
        />

        <meshStandardMaterial
          color="#454b47"
          metalness={0.4}
          roughness={0.48}
        />
      </mesh>

      <mesh
        position={[
          0,
          1.35,
          facing * 0.12,
        ]}
      >
        <boxGeometry
          args={[
            0.38,
            0.22,
            0.24,
          ]}
        />

        <meshStandardMaterial
          color="#303632"
          roughness={0.5}
        />
      </mesh>

      <mesh
        position={[
          0,
          1.35,
          facing * 0.245,
        ]}
      >
        <circleGeometry
          args={[
            0.075,
            14,
          ]}
        />

        <meshStandardMaterial
          color="#dedbc9"
          emissive="#c4bb8e"
          emissiveIntensity={0.28}
        />
      </mesh>
    </group>
  )
}


export function FinalControlZone() {
  const finalControl =
    VEHICLE_JOURNEY
      .finalControl

  return (
    <group
      position={[
        finalControl.position[0],
        0,
        finalControl.position[2],
      ]}
    >
      {/* Low rolling test bed */}

      {[
        -1.25,
        1.25,
      ].map(
        (x) => (
          <group key={x}>
            <mesh
              position={[
                x,
                0.055,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.78,
                  0.055,
                  1.75,
                ]}
              />

              <meshStandardMaterial
                color="#666b67"
                metalness={0.22}
                roughness={0.68}
              />
            </mesh>

            {[
              -0.58,
              0.58,
            ].map(
              (z) => (
                <mesh
                  key={z}
                  position={[
                    x,
                    0.14,
                    z,
                  ]}
                  rotation-z={
                    Math.PI / 2
                  }
                >
                  <cylinderGeometry
                    args={[
                      0.16,
                      0.16,
                      0.68,
                      16,
                    ]}
                  />

                  <meshStandardMaterial
                    color="#292e2b"
                    metalness={0.54}
                    roughness={0.4}
                  />
                </mesh>
              ),
            )}
          </group>
        ),
      )}


      {/* Sensors stay outside the vehicle corridor */}

      <SensorPost
        position={[
          -1.9,
          0,
          2.65,
        ]}
        facing={-1}
      />

      <SensorPost
        position={[
          1.9,
          0,
          2.65,
        ]}
        facing={-1}
      />

      <SensorPost
        position={[
          -1.9,
          0,
          -2.65,
        ]}
        facing={1}
      />

      <SensorPost
        position={[
          1.9,
          0,
          -2.65,
        ]}
        facing={1}
      />


      {/* Over-road inspection gantry */}

      {[
        -2.55,
        2.55,
      ].map(
        (z) => (
          <mesh
            key={z}
            position={[
              1.9,
              1.65,
              z,
            ]}
            castShadow
          >
            <boxGeometry
              args={[
                0.12,
                3.3,
                0.12,
              ]}
            />

            <meshStandardMaterial
              color="#474d49"
              metalness={0.42}
              roughness={0.48}
            />
          </mesh>
        ),
      )}

      <mesh
        position={[
          1.9,
          3.25,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.14,
            0.14,
            5.2,
          ]}
        />

        <meshStandardMaterial
          color="#3d4340"
          metalness={0.44}
          roughness={0.44}
        />
      </mesh>

      <mesh
        position={[
          1.9,
          3.03,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.44,
            0.19,
            0.62,
          ]}
        />

        <meshStandardMaterial
          color="#dad8cd"
          emissive="#c7c094"
          emissiveIntensity={0.2}
        />
      </mesh>


      {/* Operator console outside road */}

      <group
        position={[
          0.3,
          0,
          -2.85,
        ]}
      >
        <mesh
          position={[
            0,
            0.68,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              1.15,
              1.36,
              0.52,
            ]}
          />

          <meshStandardMaterial
            color="#555b57"
            metalness={0.2}
            roughness={0.62}
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
            args={[
              0.75,
              0.3,
              0.015,
            ]}
          />

          <meshStandardMaterial
            color="#bfc3bf"
            emissive="#747a76"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>


      {/* Small safety edges, not a box across the road */}

      {[
        -2.42,
        2.42,
      ].map(
        (z) => (
          <mesh
            key={z}
            position={[
              0,
              0.042,
              z,
            ]}
          >
            <boxGeometry
              args={[
                6.6,
                0.012,
                0.07,
              ]}
            />

            <meshStandardMaterial
              color="#c49a25"
              roughness={0.78}
            />
          </mesh>
        ),
      )}


      <mesh
        position={[
          0,
          0.052,
          3.15,
        ]}
      >
        <boxGeometry
          args={[
            5.8,
            0.022,
            0.92,
          ]}
        />

        <meshStandardMaterial
          color="#343a37"
          roughness={0.8}
        />
      </mesh>

      <Text
        position={[
          0,
          0.082,
          3.15,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        CONTRÔLE FINAL
      </Text>
    </group>
  )
}