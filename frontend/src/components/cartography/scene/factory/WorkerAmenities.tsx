import {
  RoundedBox,
  Text,
} from '@react-three/drei'


export const AMENITIES_POSITION = [
  -39,
  0,
  -29,
] as const


/*
 * These are the exact centres of the
 * two chairs actually used during breaks.
 */
export const BREAK_SEATS = [
  {
    x: -40.5,
    z: -30.35,
    yaw: 0,
  },

  {
    x: -36.5,
    z: -30.35,
    yaw: 0,
  },
] as const


function Chair({
  position,
  rotation = 0,
}: {
  position: [
    number,
    number,
    number,
  ]

  rotation?: number
}) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      <RoundedBox
        args={[
          0.68,
          0.12,
          0.68,
        ]}
        radius={0.055}
        smoothness={2}
        position={[
          0,
          0.48,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#4b504d"
          roughness={0.78}
        />
      </RoundedBox>


      <RoundedBox
        args={[
          0.68,
          0.82,
          0.1,
        ]}
        radius={0.04}
        smoothness={2}
        position={[
          0,
          0.91,
          -0.3,
        ]}
      >
        <meshStandardMaterial
          color="#434844"
          roughness={0.78}
        />
      </RoundedBox>


      {[
        [-0.24, -0.24],
        [-0.24, 0.24],
        [0.24, -0.24],
        [0.24, 0.24],
      ].map(
        (
          [
            x,
            z,
          ],
          index,
        ) => (
          <mesh
            key={index}
            position={[
              x,
              0.23,
              z,
            ]}
          >
            <boxGeometry
              args={[
                0.05,
                0.46,
                0.05,
              ]}
            />

            <meshStandardMaterial
              color="#353a37"
              metalness={0.34}
              roughness={0.48}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function BreakTable({
  position,
}: {
  position: [
    number,
    number,
    number,
  ]
}) {
  return (
    <group
      position={position}
    >
      <RoundedBox
        args={[
          2.35,
          0.14,
          1.2,
        ]}
        radius={0.07}
        smoothness={2}
        position={[
          0,
          0.79,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#795b3e"
          roughness={0.72}
        />
      </RoundedBox>


      {[
        [-0.92, -0.42],
        [-0.92, 0.42],
        [0.92, -0.42],
        [0.92, 0.42],
      ].map(
        (
          [
            x,
            z,
          ],
          index,
        ) => (
          <mesh
            key={index}
            position={[
              x,
              0.39,
              z,
            ]}
          >
            <boxGeometry
              args={[
                0.07,
                0.78,
                0.07,
              ]}
            />

            <meshStandardMaterial
              color="#3e433f"
              metalness={0.3}
              roughness={0.52}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function Tray() {
  return (
    <group>
      <RoundedBox
        args={[
          1,
          0.045,
          0.6,
        ]}
        radius={0.05}
        smoothness={2}
        position={[
          0,
          0.88,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#414642"
          roughness={0.62}
        />
      </RoundedBox>


      <mesh
        position={[
          -0.27,
          1.09,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.065,
            0.075,
            0.38,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#aac3c8"
          transparent
          opacity={0.75}
          roughness={0.18}
        />
      </mesh>


      {[
        0.04,
        0.25,
        0.43,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              0.99,
              0,
            ]}
          >
            <cylinderGeometry
              args={[
                0.06,
                0.052,
                0.17,
                10,
              ]}
            />

            <meshStandardMaterial
              color="#d7dcda"
              transparent
              opacity={0.72}
              roughness={0.16}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function PersonIcon({
  gender,
}: {
  gender:
    | 'man'
    | 'woman'
}) {
  return (
    <group
      scale={0.75}
    >
      <mesh
        position={[
          0,
          0.34,
          0.02,
        ]}
      >
        <sphereGeometry
          args={[
            0.12,
            12,
            10,
          ]}
        />

        <meshBasicMaterial
          color="#171918"
        />
      </mesh>


      {gender ===
      'woman' ? (
        <>
          <mesh
            position={[
              0,
              -0.03,
              0.02,
            ]}
          >
            <coneGeometry
              args={[
                0.25,
                0.55,
                4,
              ]}
            />

            <meshBasicMaterial
              color="#171918"
            />
          </mesh>


          {[
            -0.11,
            0.11,
          ].map(
            (x) => (
              <mesh
                key={x}
                position={[
                  x,
                  -0.42,
                  0.02,
                ]}
              >
                <boxGeometry
                  args={[
                    0.07,
                    0.34,
                    0.07,
                  ]}
                />

                <meshBasicMaterial
                  color="#171918"
                />
              </mesh>
            ),
          )}
        </>
      ) : (
        <>
          <mesh
            position={[
              0,
              -0.04,
              0.02,
            ]}
          >
            <boxGeometry
              args={[
                0.32,
                0.55,
                0.07,
              ]}
            />

            <meshBasicMaterial
              color="#171918"
            />
          </mesh>


          {[
            -0.1,
            0.1,
          ].map(
            (x) => (
              <mesh
                key={x}
                position={[
                  x,
                  -0.47,
                  0.02,
                ]}
              >
                <boxGeometry
                  args={[
                    0.075,
                    0.4,
                    0.075,
                  ]}
                />

                <meshBasicMaterial
                  color="#171918"
                />
              </mesh>
            ),
          )}
        </>
      )}


      {[
        -0.22,
        0.22,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              -0.04,
              0.02,
            ]}
          >
            <boxGeometry
              args={[
                0.07,
                0.55,
                0.07,
              ]}
            />

            <meshBasicMaterial
              color="#171918"
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function RestroomDoor({
  x,
  gender,
  label,
}: {
  x: number

  gender:
    | 'man'
    | 'woman'

  label: string
}) {
  return (
    <group
      position={[
        x,
        0,
        0,
      ]}
    >
      <RoundedBox
        args={[
          1.55,
          2.3,
          0.12,
        ]}
        radius={0.05}
        smoothness={2}
        position={[
          0,
          1.15,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#315f87"
          roughness={0.64}
        />
      </RoundedBox>


      <mesh
        position={[
          0.54,
          1.05,
          0.08,
        ]}
      >
        <sphereGeometry
          args={[
            0.055,
            10,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#d8dbd7"
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>


      <RoundedBox
        args={[
          0.78,
          0.86,
          0.055,
        ]}
        radius={0.05}
        smoothness={2}
        position={[
          0,
          1.56,
          0.095,
        ]}
      >
        <meshStandardMaterial
          color="#f4f4ef"
          roughness={0.82}
        />
      </RoundedBox>


      <group
        position={[
          0,
          1.56,
          0.135,
        ]}
      >
        <PersonIcon
          gender={gender}
        />
      </group>


      <Text
        position={[
          0,
          0.42,
          0.08,
        ]}
        fontSize={0.18}
        color="#f7f7f2"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}


function RestroomCabinet() {
  return (
    <group>
      <RoundedBox
        args={[
          4.15,
          2.75,
          0.28,
        ]}
        radius={0.07}
        smoothness={2}
        position={[
          0,
          1.37,
          -0.09,
        ]}
      >
        <meshStandardMaterial
          color="#d8dad5"
          roughness={0.82}
        />
      </RoundedBox>


      <RestroomDoor
        x={-0.92}
        gender="woman"
        label="FEMMES"
      />


      <RestroomDoor
        x={0.92}
        gender="man"
        label="HOMMES"
      />


      <RoundedBox
        args={[
          2.25,
          0.58,
          0.07,
        ]}
        radius={0.06}
        smoothness={2}
        position={[
          0,
          3.05,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#f3f3ee"
          roughness={0.82}
        />
      </RoundedBox>


      <Text
        position={[
          0,
          3.05,
          0.045,
        ]}
        fontSize={0.38}
        color="#191b1a"
        anchorX="center"
        anchorY="middle"
      >
        WC
      </Text>
    </group>
  )
}


function WaterDispenser() {
  return (
    <group>
      <RoundedBox
        args={[
          0.72,
          1.45,
          0.62,
        ]}
        radius={0.08}
        smoothness={2}
        position={[
          0,
          0.72,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#d6d8d4"
          roughness={0.72}
        />
      </RoundedBox>


      <mesh
        position={[
          0,
          1.65,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.24,
            0.2,
            0.62,
            14,
          ]}
        />

        <meshStandardMaterial
          color="#9ebcc4"
          transparent
          opacity={0.72}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}


function Plant() {
  return (
    <group>
      <mesh
        position={[
          0,
          0.3,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.34,
            0.26,
            0.6,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#755b47"
          roughness={0.86}
        />
      </mesh>


      <mesh
        position={[
          0,
          0.95,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.045,
            0.055,
            0.95,
            8,
          ]}
        />

        <meshStandardMaterial
          color="#455e40"
          roughness={0.8}
        />
      </mesh>


      {[
        [-0.24, 1.2],
        [0.22, 1.38],
        [-0.2, 1.55],
        [0.18, 1.72],
      ].map(
        (
          [
            x,
            y,
          ],
          index,
        ) => (
          <mesh
            key={index}
            position={[
              x,
              y,
              0,
            ]}
            scale={[
              1,
              0.65,
              0.7,
            ]}
          >
            <sphereGeometry
              args={[
                0.28,
                9,
                7,
              ]}
            />

            <meshStandardMaterial
              color={
                index % 2 ===
                0
                  ? '#58714c'
                  : '#49643f'
              }
              roughness={0.82}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function BreakAreaSign() {
  return (
    <group
      position={[
        2.7,
        0,
        3.55,
      ]}
    >
      {/* Supports */}

      {[
        -2.45,
        2.45,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              1.65,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.07,
                3.3,
                0.07,
              ]}
            />

            <meshStandardMaterial
              color="#383e3a"
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>
        ),
      )}


      {/* White industrial sign */}

      <RoundedBox
        args={[
          5.4,
          0.92,
          0.12,
        ]}
        radius={0.1}
        smoothness={3}
        position={[
          0,
          2.7,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#f3f4ef"
          emissive="#f3f4ef"
          emissiveIntensity={0.12}
          roughness={0.7}
        />
      </RoundedBox>


      {/* Restrained green LED accents */}

      {[
        -2.53,
        2.53,
      ].map(
        (x) => (
          <RoundedBox
            key={x}
            args={[
              0.08,
              0.78,
              0.15,
            ]}
            radius={0.03}
            smoothness={2}
            position={[
              x,
              2.7,
              0.07,
            ]}
          >
            <meshStandardMaterial
              color="#4b8b65"
              emissive="#4b8b65"
              emissiveIntensity={0.75}
              toneMapped={false}
            />
          </RoundedBox>
        ),
      )}


      <Text
        position={[
          0,
          2.7,
          0.075,
        ]}
        fontSize={0.43}
        color="#202321"
        anchorX="center"
        anchorY="middle"
      >
        ESPACE PAUSE
      </Text>
    </group>
  )
}


export function WorkerAmenities() {
  return (
    <group
      position={
        AMENITIES_POSITION
      }
    >
      {/* Neutral local floor */}

      <mesh
        position={[
          0,
          0.024,
          0,
        ]}
      >
        <boxGeometry
          args={[
            17,
            0.018,
            9,
          ]}
        />

        <meshStandardMaterial
          color="#aaada8"
          roughness={0.94}
        />
      </mesh>


      {/*
       * WC sits close to the exterior left wall.
       * Rotating it makes the blue doors face
       * inward toward the factory.
       */}
      <group
        position={[
          -7,
          0,
          1.6,
        ]}
        rotation-y={
          Math.PI / 2
        }
      >
        <RestroomCabinet />
      </group>


      {/* Rest area — intentionally separated from WC */}

      <BreakTable
        position={[
          -1.5,
          0,
          0,
        ]}
      />


      <group
        position={[
          -1.5,
          0,
          0,
        ]}
      >
        <Tray />
      </group>


      <BreakTable
        position={[
          2.5,
          0,
          0,
        ]}
      />


      {/* Active break chairs */}

      <Chair
        position={[
          -1.5,
          0,
          -1.35,
        ]}
      />


      <Chair
        position={[
          2.5,
          0,
          -1.35,
        ]}
      />


      {/* Additional available chairs */}

      <Chair
        position={[
          -1.5,
          0,
          1.35,
        ]}
        rotation={
          Math.PI
        }
      />


      <Chair
        position={[
          2.5,
          0,
          1.35,
        ]}
        rotation={
          Math.PI
        }
      />


      <group
        position={[
          5,
          0,
          -2.4,
        ]}
      >
        <WaterDispenser />
      </group>


      <group
        position={[
          5,
          0,
          2.25,
        ]}
      >
        <Plant />
      </group>


      <BreakAreaSign />
    </group>
  )
}