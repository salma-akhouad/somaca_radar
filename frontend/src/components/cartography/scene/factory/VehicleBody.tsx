import {
  RoundedBox,
} from '@react-three/drei'

import {
  DoubleSide,
  Shape,
} from 'three'

import type {
  VehicleLightingState,
} from './VehicleLighting'

import {
  VEHICLE_LIGHTS_OFF,
} from './VehicleLighting'


export type VehicleStage =
  | 'shell'
  | 'glazing'
  | 'assembly'
  | 'documented'
  | 'finished'


interface VehicleBodyProps {
  position?: [
    number,
    number,
    number,
  ]
  rotation?: number
  stage?: VehicleStage
  color?: string
  lights?: VehicleLightingState
}


const BODY_WIDTH = 1.72

const SIDE_SURFACE =
  BODY_WIDTH / 2 +
  0.012


const STAGE_BODY_COLORS:
  Record<VehicleStage, string> = {
    shell: '#aeb3b0',
    glazing: '#c4c7c3',
    assembly: '#d5d7d3',
    documented: '#e1e2de',
    finished: '#eceee9',
  }


const bodyProfile =
  new Shape()

bodyProfile.moveTo(
  -2.02,
  0.47,
)

bodyProfile.lineTo(
  -2.05,
  0.76,
)

bodyProfile.bezierCurveTo(
  -2.04,
  1.03,
  -1.9,
  1.23,
  -1.64,
  1.42,
)

bodyProfile.bezierCurveTo(
  -1.42,
  1.6,
  -1.17,
  1.7,
  -0.86,
  1.74,
)

bodyProfile.lineTo(
  0.34,
  1.74,
)

bodyProfile.bezierCurveTo(
  0.58,
  1.7,
  0.72,
  1.58,
  0.89,
  1.39,
)

bodyProfile.lineTo(
  1.19,
  1.08,
)

bodyProfile.bezierCurveTo(
  1.42,
  1.02,
  1.7,
  1.02,
  1.88,
  0.94,
)

bodyProfile.bezierCurveTo(
  2.03,
  0.87,
  2.08,
  0.73,
  2.06,
  0.49,
)

bodyProfile.lineTo(
  1.72,
  0.45,
)

bodyProfile.lineTo(
  -1.72,
  0.45,
)

bodyProfile.closePath()


const frontSideWindow =
  new Shape()

frontSideWindow.moveTo(
  0.17,
  1.62,
)

frontSideWindow.lineTo(
  0.58,
  1.58,
)

frontSideWindow.lineTo(
  0.91,
  1.29,
)

frontSideWindow.lineTo(
  0.78,
  1.15,
)

frontSideWindow.lineTo(
  0.08,
  1.15,
)

frontSideWindow.closePath()


const rearSideWindow =
  new Shape()

rearSideWindow.moveTo(
  -0.76,
  1.62,
)

rearSideWindow.lineTo(
  0.08,
  1.62,
)

rearSideWindow.lineTo(
  -0.03,
  1.15,
)

rearSideWindow.lineTo(
  -0.83,
  1.15,
)

rearSideWindow.closePath()


const quarterWindow =
  new Shape()

quarterWindow.moveTo(
  -1.28,
  1.53,
)

quarterWindow.lineTo(
  -0.85,
  1.62,
)

quarterWindow.lineTo(
  -0.91,
  1.16,
)

quarterWindow.lineTo(
  -1.38,
  1.19,
)

quarterWindow.closePath()


function Wheel({
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
      <mesh
        rotation-x={
          Math.PI / 2
        }
        castShadow
      >
        <cylinderGeometry
          args={[
            0.35,
            0.35,
            0.22,
            28,
          ]}
        />

        <meshStandardMaterial
          color="#171a18"
          roughness={0.78}
        />
      </mesh>

      <mesh
        rotation-x={
          Math.PI / 2
        }
      >
        <cylinderGeometry
          args={[
            0.235,
            0.235,
            0.235,
            22,
          ]}
        />

        <meshStandardMaterial
          color="#828783"
          metalness={0.68}
          roughness={0.28}
        />
      </mesh>

      {[0, 1, 2, 3, 4].map(
        (index) => (
          <mesh
            key={index}
            position={[
              0,
              0,
              0.13,
            ]}
            rotation-z={
              index *
              (
                Math.PI /
                5
              )
            }
          >
            <boxGeometry
              args={[
                0.055,
                0.34,
                0.025,
              ]}
            />

            <meshStandardMaterial
              color="#3d433f"
              metalness={0.68}
              roughness={0.28}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function WheelHub({
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
      <mesh
        rotation-x={
          Math.PI / 2
        }
      >
        <cylinderGeometry
          args={[
            0.18,
            0.18,
            0.08,
            18,
          ]}
        />

        <meshStandardMaterial
          color="#737874"
          metalness={0.62}
          roughness={0.35}
        />
      </mesh>

      <mesh
        rotation-x={
          Math.PI / 2
        }
      >
        <cylinderGeometry
          args={[
            0.065,
            0.065,
            0.11,
            14,
          ]}
        />

        <meshStandardMaterial
          color="#343936"
          metalness={0.58}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}


function SideWindows({
  side,
  glazed,
}: {
  side: number
  glazed: boolean
}) {
  const color =
    glazed
      ? '#14282e'
      : '#3a403d'

  const roughness =
    glazed
      ? 0.09
      : 0.82

  return (
    <>
      {[
        frontSideWindow,
        rearSideWindow,
        quarterWindow,
      ].map(
        (shape, index) => (
          <mesh
            key={index}
            position={[
              0,
              0,
              side,
            ]}
          >
            <shapeGeometry
              args={[shape]}
            />

            <meshStandardMaterial
              color={color}
              metalness={
                glazed
                  ? 0.06
                  : 0
              }
              roughness={
                roughness
              }
              side={DoubleSide}
            />
          </mesh>
        ),
      )}
    </>
  )
}


function FrontLighting({
  lights,
}: {
  lights: VehicleLightingState
}) {
  const headlights =
    Boolean(
      lights.headlights,
    )

  return (
    <>
      {[-0.55, 0.55].map(
        (z) => (
          <group
            key={z}
            position={[
              2.055,
              0.98,
              z,
            ]}
          >
            <RoundedBox
              args={[
                0.085,
                0.22,
                0.5,
              ]}
              radius={0.045}
              smoothness={3}
            >
              <meshStandardMaterial
                color="#d8cfb8"
                metalness={0.08}
                roughness={0.2}
              />
            </RoundedBox>

            <mesh
              position={[
                0.047,
                0.02,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.018,
                  0.075,
                  0.35,
                ]}
              />

              <meshStandardMaterial
                color={
                  headlights
                    ? '#fff3c8'
                    : '#dfd3ae'
                }
                emissive="#fff0ba"
                emissiveIntensity={
                  headlights
                    ? 2.5
                    : 0
                }
                roughness={0.26}
              />
            </mesh>
          </group>
        ),
      )}

      {[-0.72, 0.72].map(
        (z) => {
          const active =
            z < 0
              ? Boolean(
                  lights.leftIndicator,
                )
              : Boolean(
                  lights.rightIndicator,
                )

          return (
            <mesh
              key={z}
              position={[
                2.07,
                0.83,
                z,
              ]}
            >
              <boxGeometry
                args={[
                  0.03,
                  0.11,
                  0.17,
                ]}
              />

              <meshStandardMaterial
                color={
                  active
                    ? '#f2aa26'
                    : '#aa7226'
                }
                emissive="#ee9b18"
                emissiveIntensity={
                  active
                    ? 2
                    : 0
                }
                roughness={0.34}
              />
            </mesh>
          )
        },
      )}
    </>
  )
}


function RearLighting({
  lights,
}: {
  lights: VehicleLightingState
}) {
  const braking =
    Boolean(
      lights.brakeLights,
    )

  const reversing =
    Boolean(
      lights.reverseLights,
    )

  return (
    <>
      {[-0.59, 0.59].map(
        (z) => (
          <group
            key={z}
            position={[
              -2.045,
              1.02,
              z,
            ]}
          >
            <RoundedBox
              args={[
                0.08,
                0.34,
                0.3,
              ]}
              radius={0.04}
              smoothness={3}
            >
              <meshStandardMaterial
                color={
                  braking
                    ? '#d7372e'
                    : '#812a27'
                }
                emissive="#d9332c"
                emissiveIntensity={
                  braking
                    ? 2.2
                    : 0
                }
                roughness={0.28}
              />
            </RoundedBox>

            <mesh
              position={[
                -0.045,
                -0.08,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.018,
                  0.075,
                  0.15,
                ]}
              />

              <meshStandardMaterial
                color={
                  reversing
                    ? '#f2efe4'
                    : '#a4a59f'
                }
                emissive="#eee8d5"
                emissiveIntensity={
                  reversing
                    ? 1.6
                    : 0
                }
              />
            </mesh>
          </group>
        ),
      )}

      {[-0.73, 0.73].map(
        (z) => {
          const active =
            z < 0
              ? Boolean(
                  lights.leftIndicator,
                )
              : Boolean(
                  lights.rightIndicator,
                )

          return (
            <mesh
              key={z}
              position={[
                -2.055,
                0.88,
                z,
              ]}
            >
              <boxGeometry
                args={[
                  0.025,
                  0.095,
                  0.14,
                ]}
              />

              <meshStandardMaterial
                color={
                  active
                    ? '#e8a020'
                    : '#a86d22'
                }
                emissive="#df9416"
                emissiveIntensity={
                  active
                    ? 1.9
                    : 0
                }
              />
            </mesh>
          )
        },
      )}
    </>
  )
}


export function VehicleBody({
  position = [0, 0, 0],
  rotation = 0,
  stage = 'finished',
  color,
  lights = VEHICLE_LIGHTS_OFF,
}: VehicleBodyProps) {
  const resolvedColor =
    color ??
    STAGE_BODY_COLORS[
      stage
    ]

  const hasGlass =
    stage !== 'shell'

  const hasTrim =
    stage === 'assembly' ||
    stage === 'documented' ||
    stage === 'finished'

  const hasWheels =
    stage === 'documented' ||
    stage === 'finished'

  const hasDocument =
    stage === 'documented'

  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* Main hatchback shell */}
      <mesh
        position={[
          0,
          0,
          -BODY_WIDTH / 2,
        ]}
        castShadow
      >
        <extrudeGeometry
          args={[
            bodyProfile,
            {
              depth:
                BODY_WIDTH,
              bevelEnabled: true,
              bevelThickness:
                0.045,
              bevelSize: 0.045,
              bevelSegments: 2,
              curveSegments: 10,
            },
          ]}
        />

        <meshStandardMaterial
          color={resolvedColor}
          metalness={0.23}
          roughness={0.28}
        />
      </mesh>

      {/* Side glazing / open apertures */}
      <SideWindows
        side={
          SIDE_SURFACE
        }
        glazed={hasGlass}
      />

      <SideWindows
        side={
          -SIDE_SURFACE
        }
        glazed={hasGlass}
      />

      {/* Front windshield */}
      <mesh
        position={[
          1.03,
          1.41,
          0,
        ]}
        rotation-z={-0.56}
      >
        <boxGeometry
          args={[
            0.06,
            0.61,
            1.4,
          ]}
        />

        <meshStandardMaterial
          color={
            hasGlass
              ? '#14282e'
              : '#3a403d'
          }
          metalness={
            hasGlass
              ? 0.05
              : 0
          }
          roughness={
            hasGlass
              ? 0.08
              : 0.82
          }
        />
      </mesh>

      {/* Rear glass */}
      <mesh
        position={[
          -1.52,
          1.37,
          0,
        ]}
        rotation-z={0.25}
      >
        <boxGeometry
          args={[
            0.06,
            0.53,
            1.36,
          ]}
        />

        <meshStandardMaterial
          color={
            hasGlass
              ? '#14282e'
              : '#3a403d'
          }
          metalness={
            hasGlass
              ? 0.05
              : 0
          }
          roughness={
            hasGlass
              ? 0.08
              : 0.82
          }
        />
      </mesh>

      {hasTrim && (
        <>
          {/* Lower side trim */}
          {[
            -SIDE_SURFACE,
            SIDE_SURFACE,
          ].map((z) => (
            <group key={z}>
              <mesh
                position={[
                  0,
                  0.5,
                  z,
                ]}
              >
                <boxGeometry
                  args={[
                    3.42,
                    0.12,
                    0.045,
                  ]}
                />

                <meshStandardMaterial
                  color="#252a27"
                  roughness={0.64}
                />
              </mesh>

              {/* B-pillar */}
              <mesh
                position={[
                  -0.06,
                  1.37,
                  z * 1.008,
                ]}
              >
                <boxGeometry
                  args={[
                    0.07,
                    0.5,
                    0.025,
                  ]}
                />

                <meshStandardMaterial
                  color="#202522"
                  roughness={0.5}
                />
              </mesh>

              {/* Door handles */}
              {[
                -0.72,
                0.25,
              ].map((x) => (
                <RoundedBox
                  key={x}
                  args={[
                    0.2,
                    0.045,
                    0.04,
                  ]}
                  radius={0.015}
                  smoothness={2}
                  position={[
                    x,
                    1.04,
                    z * 1.01,
                  ]}
                >
                  <meshStandardMaterial
                    color={
                      resolvedColor
                    }
                    metalness={0.2}
                    roughness={0.32}
                  />
                </RoundedBox>
              ))}
            </group>
          ))}

          {/* Mirrors */}
          {[-0.79, 0.79].map(
            (z) => (
              <RoundedBox
                key={z}
                args={[
                  0.26,
                  0.17,
                  0.15,
                ]}
                radius={0.06}
                smoothness={3}
                position={[
                  0.79,
                  1.35,
                  z,
                ]}
              >
                <meshStandardMaterial
                  color="#222724"
                  roughness={0.5}
                />
              </RoundedBox>
            ),
          )}

          {/* Front bumper */}
          <RoundedBox
            args={[
              0.13,
              0.38,
              1.52,
            ]}
            radius={0.055}
            smoothness={3}
            position={[
              2.03,
              0.58,
              0,
            ]}
          >
            <meshStandardMaterial
              color="#242927"
              roughness={0.64}
            />
          </RoundedBox>

          {/* Upper grille */}
          <RoundedBox
            args={[
              0.06,
              0.25,
              1.02,
            ]}
            radius={0.035}
            smoothness={3}
            position={[
              2.105,
              0.73,
              0,
            ]}
          >
            <meshStandardMaterial
              color="#111614"
              metalness={0.14}
              roughness={0.48}
            />
          </RoundedBox>

          {/* Grille bars */}
          {[
            -0.34,
            0,
            0.34,
          ].map((z) => (
            <mesh
              key={z}
              position={[
                2.142,
                0.73,
                z,
              ]}
            >
              <boxGeometry
                args={[
                  0.012,
                  0.035,
                  0.24,
                ]}
              />

              <meshStandardMaterial
                color="#8e9490"
                metalness={0.68}
                roughness={0.27}
              />
            </mesh>
          ))}

          {/* Lower air intake */}
          <RoundedBox
            args={[
              0.045,
              0.14,
              1.12,
            ]}
            radius={0.025}
            smoothness={2}
            position={[
              2.13,
              0.48,
              0,
            ]}
          >
            <meshStandardMaterial
              color="#111614"
              roughness={0.58}
            />
          </RoundedBox>

          {/* Compact central badge */}
          <mesh
            position={[
              2.15,
              0.75,
              0,
            ]}
            rotation-x={
              Math.PI / 4
            }
          >
            <boxGeometry
              args={[
                0.025,
                0.17,
                0.17,
              ]}
            />

            <meshStandardMaterial
              color="#c4c8c5"
              metalness={0.76}
              roughness={0.22}
            />
          </mesh>

          {/* Rear bumper */}
          <RoundedBox
            args={[
              0.12,
              0.32,
              1.48,
            ]}
            radius={0.05}
            smoothness={3}
            position={[
              -2.03,
              0.61,
              0,
            ]}
          >
            <meshStandardMaterial
              color="#252a27"
              roughness={0.64}
            />
          </RoundedBox>

          <FrontLighting
            lights={lights}
          />

          <RearLighting
            lights={lights}
          />

          {/* Front plate */}
          <mesh
            position={[
              2.108,
              0.49,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.027,
                0.15,
                0.58,
              ]}
            />

            <meshStandardMaterial
              color="#dddeda"
              roughness={0.52}
            />
          </mesh>

          {/* Rear plate */}
          <mesh
            position={[
              -2.108,
              0.62,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.027,
                0.15,
                0.58,
              ]}
            />

            <meshStandardMaterial
              color="#dddeda"
              roughness={0.52}
            />
          </mesh>

          {/* Rear antenna */}
          <mesh
            position={[
              -0.78,
              1.79,
              0,
            ]}
            rotation-z={-0.22}
          >
            <cylinderGeometry
              args={[
                0.018,
                0.024,
                0.28,
                10,
              ]}
            />

            <meshStandardMaterial
              color="#252a27"
              metalness={0.3}
              roughness={0.45}
            />
          </mesh>
        </>
      )}

      {/* Roof rails on finished vehicle */}
      {stage === 'finished' && (
        <>
          {[-0.55, 0.55].map(
            (z) => (
              <RoundedBox
                key={z}
                args={[
                  1.65,
                  0.06,
                  0.06,
                ]}
                radius={0.02}
                smoothness={2}
                position={[
                  -0.15,
                  1.82,
                  z,
                ]}
              >
                <meshStandardMaterial
                  color="#252a27"
                  roughness={0.5}
                />
              </RoundedBox>
            ),
          )}
        </>
      )}

      {/* Wheel state */}
      {[
        [-1.28, -0.81],
        [-1.28, 0.81],
        [1.28, -0.81],
        [1.28, 0.81],
      ].map(
        ([x, z], index) =>
          hasWheels ? (
            <Wheel
              key={index}
              position={[
                x,
                0.38,
                z,
              ]}
            />
          ) : (
            <WheelHub
              key={index}
              position={[
                x,
                0.38,
                z,
              ]}
            />
          ),
      )}

      {hasDocument && (
        <mesh
          position={[
            1.055,
            1.47,
            -0.31,
          ]}
          rotation-z={-0.56}
        >
          <boxGeometry
            args={[
              0.018,
              0.21,
              0.31,
            ]}
          />

          <meshStandardMaterial
            color="#f4f2eb"
            roughness={0.9}
          />
        </mesh>
      )}
    </group>
  )
}