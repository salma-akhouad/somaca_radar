import {
  RoundedBox,
  Text,
} from '@react-three/drei'


export const AMENITIES_POSITION = [
  8,
  0,
  31,
] as const


export const BREAK_SEATS = [
  {
    x: 4.25,
    z: 30.4,
    yaw:
      Math.PI / 2,
  },

  {
    x: 10.75,
    z: 30.4,
    yaw:
      -Math.PI / 2,
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
          0.62,
          0.12,
          0.62,
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
          color="#4c504d"
          roughness={0.78}
        />
      </RoundedBox>


      <RoundedBox
        args={[
          0.62,
          0.78,
          0.09,
        ]}
        radius={0.04}
        smoothness={2}
        position={[
          0,
          0.9,
          -0.27,
        ]}
      >
        <meshStandardMaterial
          color="#454a47"
          roughness={0.78}
        />
      </RoundedBox>


      {[
        [-0.23, -0.23],
        [-0.23, 0.23],
        [0.23, -0.23],
        [0.23, 0.23],
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
                0.045,
                0.46,
                0.045,
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
          2.25,
          0.14,
          1.18,
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
          color="#7a5c3e"
          roughness={0.72}
        />
      </RoundedBox>


      {[
        [-0.87, -0.4],
        [-0.87, 0.4],
        [0.87, -0.4],
        [0.87, 0.4],
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
          0.95,
          0.045,
          0.58,
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


      {/* Water bottle */}

      <mesh
        position={[
          -0.24,
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
          color="#a9c3c8"
          transparent
          opacity={0.75}
          roughness={0.18}
        />
      </mesh>


      {/* Cups */}

      {[
        0.05,
        0.26,
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
              color="#d6dcda"
              transparent
              opacity={0.7}
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
            rotation-z={
              x < 0
                ? -0.13
                : 0.13
            }
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
      {/* Blue door */}

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


      {/* White pictogram plate */}

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
      {/* Shared surround */}

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


      {/* Large shared WC sign */}

      <RoundedBox
        args={[
          2.2,
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


      <mesh
        position={[
          0,
          1.02,
          0.33,
        ]}
      >
        <boxGeometry
          args={[
            0.38,
            0.24,
            0.035,
          ]}
        />

        <meshStandardMaterial
          color="#333936"
          roughness={0.56}
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
          0.94,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.04,
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
        [-0.24, 1.2, 0],
        [0.22, 1.35, 0.04],
        [-0.2, 1.52, -0.04],
        [0.18, 1.7, 0],
      ].map(
        (
          [
            x,
            y,
            z,
          ],
          index,
        ) => (
          <mesh
            key={index}
            position={[
              x,
              y,
              z,
            ]}
            rotation-z={
              x < 0
                ? -0.6
                : 0.6
            }
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
                index % 2 === 0
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


export function WorkerAmenities() {
  return (
    <group
      position={
        AMENITIES_POSITION
      }
    >
      {/* Compact employee area */}

      <mesh
        position={[
          0,
          0.024,
          0,
        ]}
      >
        <boxGeometry
          args={[
            14,
            0.018,
            8.8,
          ]}
        />

        <meshStandardMaterial
          color="#aaada8"
          roughness={0.94}
        />
      </mesh>


      <Text
        position={[
          -1.2,
          0.055,
          -3.75,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.44}
        color="#343936"
        anchorX="center"
        anchorY="middle"
      >
        ESPACE PAUSE
      </Text>


      {/* Rest zone */}

      <BreakTable
        position={[
          -2.4,
          0,
          -0.6,
        ]}
      />

      <group
        position={[
          -2.4,
          0,
          -0.6,
        ]}
      >
        <Tray />
      </group>


      <BreakTable
        position={[
          1.4,
          0,
          -0.6,
        ]}
      />


      <Chair
        position={[
          -3.75,
          0,
          -0.6,
        ]}
        rotation={
          Math.PI / 2
        }
      />

      <Chair
        position={[
          -1.05,
          0,
          -0.6,
        ]}
        rotation={
          -Math.PI / 2
        }
      />

      <Chair
        position={[
          0.05,
          0,
          -0.6,
        ]}
        rotation={
          Math.PI / 2
        }
      />

      <Chair
        position={[
          2.75,
          0,
          -0.6,
        ]}
        rotation={
          -Math.PI / 2
        }
      />


      <group
        position={[
          -5.3,
          0,
          2.3,
        ]}
      >
        <Plant />
      </group>


      <group
        position={[
          -5.2,
          0,
          -2.45,
        ]}
      >
        <WaterDispenser />
      </group>


      {/* WC kept separate from the tables */}

      <group
        position={[
          4.15,
          0,
          2.55,
        ]}
      >
        <RestroomCabinet />
      </group>
    </group>
  )
}