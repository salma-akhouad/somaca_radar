import {
  RoundedBox,
  Text,
} from '@react-three/drei'

import {
  AMENITIES_POSITION,
  BREAK_CHAIRS,
} from './data/amenitiesLayout'


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
      {/* Fabric seat — broad enough to read clearly from above */}

      <RoundedBox
        args={[
          0.72,
          0.14,
          0.72,
        ]}
        radius={0.07}
        smoothness={2}
        position={[
          0,
          0.48,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#77736b"
          roughness={0.86}
        />
      </RoundedBox>


      {/* Backrest */}

      <RoundedBox
        args={[
          0.72,
          0.72,
          0.14,
        ]}
        radius={0.06}
        smoothness={2}
        position={[
          0,
          0.86,
          -0.34,
        ]}
        rotation-x={-0.08}
      >
        <meshStandardMaterial
          color="#6a6760"
          roughness={0.86}
        />
      </RoundedBox>


      {/* Graphite frame */}

      {[
        [-0.25, -0.25],
        [-0.25, 0.25],
        [0.25, -0.25],
        [0.25, 0.25],
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
                0.055,
                0.46,
                0.055,
              ]}
            />

            <meshStandardMaterial
              color="#3d423f"
              metalness={0.28}
              roughness={0.5}
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
    <group position={position}>
      <RoundedBox
        args={[
          2.3,
          0.14,
          1.15,
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
          color="#8b6a4d"
          roughness={0.72}
        />
      </RoundedBox>


      {[
        [-0.9, -0.39],
        [-0.9, 0.39],
        [0.9, -0.39],
        [0.9, 0.39],
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
                0.065,
                0.78,
                0.065,
              ]}
            />

            <meshStandardMaterial
              color="#454944"
              metalness={0.28}
              roughness={0.52}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function CoffeeCup({
  x,
}: {
  x: number
}) {
  return (
    <group
      position={[
        x,
        0.99,
        0,
      ]}
    >
      <mesh>
        <cylinderGeometry
          args={[
            0.075,
            0.064,
            0.17,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#eee8dc"
          roughness={0.5}
        />
      </mesh>


      {/* Dark coffee surface */}

      <mesh
        position={[
          0,
          0.087,
          0,
        ]}
        rotation-x={
          -Math.PI / 2
        }
      >
        <circleGeometry
          args={[
            0.058,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#4d3022"
          roughness={0.74}
        />
      </mesh>


      {/* Handle */}

      <mesh
        position={[
          0.078,
          0,
          0,
        ]}
        rotation-y={
          Math.PI / 2
        }
      >
        <torusGeometry
          args={[
            0.052,
            0.013,
            6,
            12,
            Math.PI,
          ]}
        />

        <meshStandardMaterial
          color="#eee8dc"
          roughness={0.5}
        />
      </mesh>
    </group>
  )
}


function CoffeeTray() {
  return (
    <group>
      <RoundedBox
        args={[
          0.9,
          0.045,
          0.55,
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
          color="#494b47"
          roughness={0.66}
        />
      </RoundedBox>


      {/* Compact coffee thermos */}

      <mesh
        position={[
          -0.25,
          1.08,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.09,
            0.105,
            0.38,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#d8d4ca"
          metalness={0.12}
          roughness={0.4}
        />
      </mesh>


      <mesh
        position={[
          -0.25,
          1.29,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.055,
            0.07,
            0.08,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#343936"
          roughness={0.52}
        />
      </mesh>


      {/* Exactly two cups */}

      <CoffeeCup x={0.08} />

      <CoffeeCup x={0.33} />
    </group>
  )
}


function WaterDispenser() {
  return (
    <group>
      <RoundedBox
        args={[
          0.78,
          1.5,
          0.66,
        ]}
        radius={0.08}
        smoothness={2}
        position={[
          0,
          0.75,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#e0e1dc"
          roughness={0.7}
        />
      </RoundedBox>


      <mesh
        position={[
          0,
          1.72,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.25,
            0.21,
            0.64,
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
          1.04,
          0.35,
        ]}
      >
        <boxGeometry
          args={[
            0.4,
            0.26,
            0.04,
          ]}
        />

        <meshStandardMaterial
          color="#353a37"
          roughness={0.52}
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
          0.31,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.36,
            0.28,
            0.62,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#7c6049"
          roughness={0.86}
        />
      </mesh>


      <mesh
        position={[
          0,
          1.05,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.045,
            0.055,
            1.1,
            8,
          ]}
        />

        <meshStandardMaterial
          color="#49613f"
          roughness={0.82}
        />
      </mesh>


      {[
        [-0.3, 1.3],
        [0.26, 1.42],
        [-0.25, 1.62],
        [0.22, 1.82],
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
              0.75,
            ]}
          >
            <sphereGeometry
              args={[
                0.3,
                9,
                7,
              ]}
            />

            <meshStandardMaterial
              color={
                index % 2 === 0
                  ? '#59704c'
                  : '#49623f'
              }
              roughness={0.82}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function PersonPictogram({
  gender,
}: {
  gender:
    | 'woman'
    | 'man'
}) {
  return (
    <group
      scale={0.68}
    >
      <mesh
        position={[
          0,
          0.35,
          0,
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
        <mesh
          position={[
            0,
            -0.04,
            0,
          ]}
        >
          <coneGeometry
            args={[
              0.27,
              0.58,
              4,
            ]}
          />

          <meshBasicMaterial
            color="#171918"
          />
        </mesh>
      ) : (
        <mesh
          position={[
            0,
            -0.04,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.3,
              0.56,
              0.07,
            ]}
          />

          <meshBasicMaterial
            color="#171918"
          />
        </mesh>
      )}


      {[
        -0.11,
        0.11,
      ].map(
        (x) => (
          <mesh
            key={`leg-${x}`}
            position={[
              x,
              -0.47,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.07,
                0.42,
                0.07,
              ]}
            />

            <meshBasicMaterial
              color="#171918"
            />
          </mesh>
        ),
      )}


      {[
        -0.22,
        0.22,
      ].map(
        (x) => (
          <mesh
            key={`arm-${x}`}
            position={[
              x,
              -0.05,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.06,
                0.5,
                0.06,
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
    | 'woman'
    | 'man'

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
          1.8,
          2.55,
          0.12,
        ]}
        radius={0.055}
        smoothness={2}
        position={[
          0,
          1.275,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#315f87"
          roughness={0.62}
        />
      </RoundedBox>


      <RoundedBox
        args={[
          0.92,
          1,
          0.055,
        ]}
        radius={0.055}
        smoothness={2}
        position={[
          0,
          1.72,
          0.095,
        ]}
      >
        <meshStandardMaterial
          color="#f6f6f1"
          roughness={0.84}
        />
      </RoundedBox>


      <group
        position={[
          0,
          1.72,
          0.135,
        ]}
      >
        <PersonPictogram
          gender={gender}
        />
      </group>


      <Text
        position={[
          0,
          0.52,
          0.08,
        ]}
        fontSize={0.19}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>


      <mesh
        position={[
          0.63,
          1.1,
          0.08,
        ]}
      >
        <sphereGeometry
          args={[
            0.06,
            10,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#dbddd8"
          metalness={0.62}
          roughness={0.28}
        />
      </mesh>
    </group>
  )
}


function RestroomCabinet() {
  return (
    <group>
      <RoundedBox
        args={[
          4.95,
          3,
          0.3,
        ]}
        radius={0.075}
        smoothness={2}
        position={[
          0,
          1.5,
          -0.1,
        ]}
      >
        <meshStandardMaterial
          color="#dadcd7"
          roughness={0.84}
        />
      </RoundedBox>


      <RestroomDoor
        x={-1.08}
        gender="woman"
        label="FEMMES"
      />


      <RestroomDoor
        x={1.08}
        gender="man"
        label="HOMMES"
      />


      <RoundedBox
        args={[
          3.15,
          0.68,
          0.075,
        ]}
        radius={0.06}
        smoothness={2}
        position={[
          0,
          3.34,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#f5f5f0"
          roughness={0.82}
        />
      </RoundedBox>


      <Text
        position={[
          0,
          3.34,
          0.045,
        ]}
        fontSize={0.46}
        color="#191b1a"
        anchorX="center"
        anchorY="middle"
      >
        WC
      </Text>
    </group>
  )
}


function PausePlaque() {
  return (
    <group
      position={[
        -9.62,
        2.55,
        3.05,
      ]}
      rotation-y={
        Math.PI / 2
      }
    >
      {/* Quiet blue-grey frame ties the plaque to the WC doors */}

      <RoundedBox
        args={[
          4.45,
          0.9,
          0.12,
        ]}
        radius={0.1}
        smoothness={2}
        position={[
          0,
          0,
          -0.035,
        ]}
      >
        <meshStandardMaterial
          color="#516775"
          roughness={0.72}
        />
      </RoundedBox>


      {/* Warm off-white face */}

      <RoundedBox
        args={[
          4.18,
          0.7,
          0.075,
        ]}
        radius={0.08}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#eee9dd"
          roughness={0.82}
        />
      </RoundedBox>


      {/* Small SOMACA-yellow identity accent */}

      <RoundedBox
        args={[
          0.09,
          0.48,
          0.08,
        ]}
        radius={0.025}
        smoothness={2}
        position={[
          -1.82,
          0,
          0.045,
        ]}
      >
        <meshStandardMaterial
          color="#c99d25"
          roughness={0.7}
        />
      </RoundedBox>


      <Text
        position={[
          0.12,
          0,
          0.048,
        ]}
        fontSize={0.38}
        color="#303532"
        anchorX="center"
        anchorY="middle"
      >
        ESPACE PAUSE
      </Text>
    </group>
  )
}


function localPosition(
  x: number,
  z: number,
): [
  number,
  number,
  number,
] {
  return [
    x -
      AMENITIES_POSITION[0],

    0,

    z -
      AMENITIES_POSITION[2],
  ]
}


export function WorkerAmenities() {
  return (
    <group
      position={
        AMENITIES_POSITION
      }
    >
      {/* Warm neutral floor, visually distinct but quiet */}

      <mesh
        position={[
          0.5,
          0.024,
          0,
        ]}
      >
        <boxGeometry
          args={[
            15.5,
            0.018,
            8.4,
          ]}
        />

        <meshStandardMaterial
          color="#b8b4aa"
          roughness={0.95}
        />
      </mesh>


      {/* WC tight to the perimeter wall, doors facing inward */}

      <group
        position={[
          -8.72,
          0,
          0.35,
        ]}
        rotation-y={
          Math.PI / 2
        }
      >
        <RestroomCabinet />
      </group>


      {/* Subtle wall identification — no standing sign, no LEDs */}

      <PausePlaque />


      {/* Table A */}

      <BreakTable
        position={
          localPosition(
            -40.5,
            -28.45,
          )
        }
      />


      <group
        position={
          localPosition(
            -40.5,
            -28.45,
          )
        }
      >
        <CoffeeTray />
      </group>


      {/* Table B */}

      <BreakTable
        position={
          localPosition(
            -35.5,
            -28.45,
          )
        }
      />


      {/* Active chairs — exact shared coordinates */}

      <Chair
        position={
          localPosition(
            BREAK_CHAIRS[0].x,
            BREAK_CHAIRS[0].z,
          )
        }
      />


      <Chair
        position={
          localPosition(
            BREAK_CHAIRS[1].x,
            BREAK_CHAIRS[1].z,
          )
        }
      />


      {/* Additional chairs on the opposite side */}

      <Chair
        position={
          localPosition(
            -40.5,
            -26.85,
          )
        }
        rotation={
          Math.PI
        }
      />


      <Chair
        position={
          localPosition(
            -35.5,
            -26.85,
          )
        }
        rotation={
          Math.PI
        }
      />


      <group
        position={
          localPosition(
            -32.75,
            -30.8,
          )
        }
      >
        <WaterDispenser />
      </group>


      {/* Plant remains in the quiet far corner */}

      <group
        position={
          localPosition(
            -32.6,
            -25.7,
          )
        }
      >
        <Plant />
      </group>
    </group>
  )
}
