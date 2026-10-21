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

  /*
   * Used by assembly vehicles.
   *
   * 0 = no wheels
   * 0 → 1 = wheels being installed
   * 1 = all wheels installed
   *
   * Finished/post-production cars default to 1.
   */
  wheelInstallProgress?: number
}


const BODY_WIDTH = 1.72

const SIDE_SURFACE =
  BODY_WIDTH / 2 +
  0.018


const STAGE_BODY_COLORS:
  Record<
    VehicleStage,
    string
  > = {
  shell: '#aeb3b0',
  glazing: '#c4c7c3',
  assembly: '#d5d7d3',
  documented: '#e1e2de',
  finished: '#eceee9',
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.max(
    minimum,
    Math.min(
      maximum,
      value,
    ),
  )
}

/* ===========================================================
   BODY PROFILE
   =========================================================== */

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


/* ===========================================================
   WINDOW SHAPES
   =========================================================== */

const frontSideWindow =
  new Shape()

frontSideWindow.moveTo(
  0.15,
  1.63,
)

frontSideWindow.lineTo(
  0.58,
  1.59,
)

frontSideWindow.lineTo(
  0.93,
  1.28,
)

frontSideWindow.lineTo(
  0.77,
  1.13,
)

frontSideWindow.lineTo(
  0.07,
  1.13,
)

frontSideWindow.closePath()


const rearSideWindow =
  new Shape()

rearSideWindow.moveTo(
  -0.77,
  1.63,
)

rearSideWindow.lineTo(
  0.06,
  1.63,
)

rearSideWindow.lineTo(
  -0.04,
  1.13,
)

rearSideWindow.lineTo(
  -0.85,
  1.13,
)

rearSideWindow.closePath()


const quarterWindow =
  new Shape()

quarterWindow.moveTo(
  -1.31,
  1.54,
)

quarterWindow.lineTo(
  -0.86,
  1.63,
)

quarterWindow.lineTo(
  -0.92,
  1.14,
)

quarterWindow.lineTo(
  -1.4,
  1.18,
)

quarterWindow.closePath()


/* ===========================================================
   WHEELS
   =========================================================== */

function Wheel({
  position,
  scale = 1,
}: {
  position: [
    number,
    number,
    number,
  ]

  scale?: number
}) {
  return (
    <group
      position={position}
      scale={[
        scale,
        scale,
        scale,
      ]}
    >
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
          color="#929995"
          metalness={0.7}
          roughness={0.24}
        />
      </mesh>


      {[
        0,
        1,
        2,
        3,
        4,
      ].map(
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
              color="#454c48"
              metalness={0.68}
              roughness={0.26}
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


/* ===========================================================
   GLASS
   =========================================================== */

function GlassMaterial() {
  return (
    <meshStandardMaterial
      color="#203e47"
      roughness={0.14}
      metalness={0.06}
      transparent
      opacity={0.98}
      side={DoubleSide}
    />
  )
}


function WindowBorderMaterial() {
  return (
    <meshStandardMaterial
      color="#0d1313"
      roughness={0.42}
      side={DoubleSide}
    />
  )
}


function SideWindows({
  side,
  glazed,
}: {
  side: number

  glazed: boolean
}) {
  return (
    <>
      {[
        frontSideWindow,
        rearSideWindow,
        quarterWindow,
      ].map(
        (
          shape,
          index,
        ) => (
          <group key={index}>
            {/* black border */}

            <mesh
              position={[
                0,
                0,
                side,
              ]}
              scale={[
                1.035,
                1.035,
                1,
              ]}
            >
              <shapeGeometry
                args={[
                  shape,
                ]}
              />

              <WindowBorderMaterial />
            </mesh>


            {/* glass surface */}

            <mesh
              position={[
                0,
                0,
                side *
                1.012,
              ]}
              scale={[
                0.96,
                0.95,
                1,
              ]}
            >
              <shapeGeometry
                args={[
                  shape,
                ]}
              />

              {glazed ? (
                <GlassMaterial />
              ) : (
                <meshStandardMaterial
                  color="#454c48"
                  roughness={0.84}
                  side={DoubleSide}
                />
              )}
            </mesh>
          </group>
        ),
      )}


      {/* strongly readable B pillar */}

      <mesh
        position={[
          -0.04,
          1.38,
          side *
          1.022,
        ]}
      >
        <boxGeometry
          args={[
            0.085,
            0.55,
            0.028,
          ]}
        />

        <meshStandardMaterial
          color="#111716"
          roughness={0.48}
        />
      </mesh>


      {/* glass highlight visible from above */}

      {glazed && (
        <mesh
          position={[
            -0.15,
            1.59,
            side *
            1.027,
          ]}
        >
          <boxGeometry
            args={[
              1.4,
              0.025,
              0.018,
            ]}
          />

          <meshBasicMaterial
            color="#b4d2d5"
            transparent
            opacity={0.58}
            toneMapped={false}
          />
        </mesh>
      )}
    </>
  )
}


/* ===========================================================
   LIGHTING
   =========================================================== */

function FrontLighting({
  lights,
}: {
  lights:
  VehicleLightingState
}) {
  const headlights =
    Boolean(
      lights.headlights,
    )


  return (
    <>
      {[
        -0.55,
        0.55,
      ].map(
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


      {/* actual nearby headlamp illumination */}

      {headlights && (
        <>
          <pointLight
            position={[
              2.28,
              0.9,
              -0.52,
            ]}
            color="#fff0bd"
            intensity={0.82}
            distance={4.8}
            decay={2}
          />

          <pointLight
            position={[
              2.28,
              0.9,
              0.52,
            ]}
            color="#fff0bd"
            intensity={0.82}
            distance={4.8}
            decay={2}
          />


          <mesh
            position={[
              3,
              0.035,
              0,
            ]}
            rotation-x={
              -Math.PI / 2
            }
            scale={[
              1.7,
              0.75,
              1,
            ]}
          >
            <circleGeometry
              args={[
                1.15,
                32,
              ]}
            />

            <meshBasicMaterial
              color="#fff1c7"
              transparent
              opacity={0.085}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </>
      )}


      {/* front indicators */}

      {[
        -0.72,
        0.72,
      ].map(
        (z) => {
          const active =
            z < 0
              ? Boolean(
                lights
                  .leftIndicator,
              )
              : Boolean(
                lights
                  .rightIndicator,
              )


          return (
            <group key={z}>
              <mesh
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


              {active && (
                <pointLight
                  position={[
                    2.12,
                    0.83,
                    z,
                  ]}
                  color="#f0a020"
                  intensity={0.24}
                  distance={1.8}
                  decay={2}
                />
              )}
            </group>
          )
        },
      )}
    </>
  )
}


function RearLighting({
  lights,
}: {
  lights:
  VehicleLightingState
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
      {[
        -0.59,
        0.59,
      ].map(
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


      {braking && (
        <>
          <pointLight
            position={[
              -2.22,
              0.92,
              -0.56,
            ]}
            color="#d83b32"
            intensity={0.38}
            distance={2.7}
            decay={2}
          />

          <pointLight
            position={[
              -2.22,
              0.92,
              0.56,
            ]}
            color="#d83b32"
            intensity={0.38}
            distance={2.7}
            decay={2}
          />


          <mesh
            position={[
              -2.7,
              0.035,
              0,
            ]}
            rotation-x={
              -Math.PI / 2
            }
            scale={[
              1.25,
              0.7,
              1,
            ]}
          >
            <circleGeometry
              args={[
                0.8,
                28,
              ]}
            />

            <meshBasicMaterial
              color="#b8322c"
              transparent
              opacity={0.07}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </>
      )}


      {[
        -0.73,
        0.73,
      ].map(
        (z) => {
          const active =
            z < 0
              ? Boolean(
                lights
                  .leftIndicator,
              )
              : Boolean(
                lights
                  .rightIndicator,
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


/* ===========================================================
   MAIN VEHICLE
   =========================================================== */

export function VehicleBody({
  position = [
    0,
    0,
    0,
  ],

  rotation = 0,

  stage = 'finished',

  color,

  lights =
  VEHICLE_LIGHTS_OFF,

  wheelInstallProgress,
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


  /*
   * Non-production finished cars already have wheels.
   *
   * Production cars receive the explicit progress
   * supplied by OverheadAssemblyLine.
   */
  const resolvedWheelProgress =
    wheelInstallProgress ??
    (
      stage ===
        'documented' ||
        stage ===
        'finished'
        ? 1
        : 0
    )


  const hasDocument =
    stage === 'documented'


  const wheelPositions:
    Array<[
      number,
      number,
    ]> = [
      [
        -1.28,
        -0.81,
      ],

      [
        -1.28,
        0.81,
      ],

      [
        1.28,
        -0.81,
      ],

      [
        1.28,
        0.81,
      ],
    ]


  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* body */}

      <mesh
        position={[
          0,
          0,
          -BODY_WIDTH /
          2,
        ]}
        castShadow
      >
        <extrudeGeometry
          args={[
            bodyProfile,

            {
              depth:
                BODY_WIDTH,

              bevelEnabled:
                true,

              bevelThickness:
                0.045,

              bevelSize:
                0.045,

              bevelSegments: 2,

              curveSegments: 10,
            },
          ]}
        />

        <meshStandardMaterial
          color={
            resolvedColor
          }
          metalness={0.23}
          roughness={0.28}
        />
      </mesh>


      {/* side glazing */}

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


      {/* =====================================================
          WINDSHIELD
          ===================================================== */}

      <mesh
        position={[
          1.035,
          1.415,
          0,
        ]}
        rotation-z={-0.56}
        scale={[
          1.08,
          1.08,
          1.04,
        ]}
      >
        <boxGeometry
          args={[
            0.075,
            0.64,
            1.42,
          ]}
        />

        <WindowBorderMaterial />
      </mesh>


      <mesh
        position={[
          1.045,
          1.415,
          0,
        ]}
        rotation-z={-0.56}
      >
        <boxGeometry
          args={[
            0.078,
            0.58,
            1.31,
          ]}
        />

        {hasGlass ? (
          <GlassMaterial />
        ) : (
          <meshStandardMaterial
            color="#454c48"
            roughness={0.84}
          />
        )}
      </mesh>


      {/* upper windshield highlight */}

      {hasGlass && (
        <mesh
          position={[
            0.89,
            1.67,
            0,
          ]}
          rotation-z={-0.56}
        >
          <boxGeometry
            args={[
              0.018,
              0.06,
              1.18,
            ]}
          />

          <meshBasicMaterial
            color="#9ac2c6"
            transparent
            opacity={0.48}
            toneMapped={false}
          />
        </mesh>
      )}


      {/* =====================================================
          REAR WINDOW
          ===================================================== */}

      <mesh
        position={[
          -1.52,
          1.37,
          0,
        ]}
        rotation-z={0.25}
        scale={[
          1.08,
          1.08,
          1.04,
        ]}
      >
        <boxGeometry
          args={[
            0.075,
            0.55,
            1.38,
          ]}
        />

        <WindowBorderMaterial />
      </mesh>


      <mesh
        position={[
          -1.53,
          1.37,
          0,
        ]}
        rotation-z={0.25}
      >
        <boxGeometry
          args={[
            0.078,
            0.49,
            1.27,
          ]}
        />

        {hasGlass ? (
          <GlassMaterial />
        ) : (
          <meshStandardMaterial
            color="#454c48"
            roughness={0.84}
          />
        )}
      </mesh>


      {/* glass roof reflection strip */}

      {hasGlass && (
        <RoundedBox
          args={[
            1.48,
            0.018,
            0.78,
          ]}
          radius={0.08}
          smoothness={2}
          position={[
            -0.15,
            1.755,
            0,
          ]}
        >
          <meshStandardMaterial
            color="#365b63"
            roughness={0.18}
            metalness={0.08}
            transparent
            opacity={0.46}
          />
        </RoundedBox>
      )}


      {hasTrim && (
        <>
          {/* rocker trim */}

          {[
            -SIDE_SURFACE,
            SIDE_SURFACE,
          ].map(
            (z) => (
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


                {/* door handles */}

                {[
                  -0.72,
                  0.25,
                ].map(
                  (x) => (
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
                        z *
                        1.01,
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
                  ),
                )}
              </group>
            ),
          )}


          {/* mirrors */}

          {[
            -0.79,
            0.79,
          ].map(
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


          {/* front bumper */}

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


          {/* grille */}

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


          {/* lower intake */}

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


          {/* front badge */}

          <mesh
            position={[
              2.15,
              0.75,
              0,
            ]}
            rotation-x={
              Math.PI /
              4
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


          {/* rear bumper */}

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


          {/* plates */}

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


          {/* antenna */}

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


      {/* roof rails */}

      {stage ===
        'finished' && (
          <>
            {[
              -0.55,
              0.55,
            ].map(
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


      {/* =====================================================
          REAL WHEEL INSTALLATION
          ===================================================== */}

      {wheelPositions.map(
        (
          [
            x,
            z,
          ],
          index,
        ) => {
          /*
           * Install wheels progressively in pairs.
           */
          const start =
            index <
              2
              ? 0.18
              : 0.5


          const localProgress =
            clamp(
              (
                resolvedWheelProgress -
                start
              ) /
              0.28,
              0,
              1,
            )


          if (
            localProgress <=
            0
          ) {
            return (
              <WheelHub
                key={index}
                position={[
                  x,
                  0.38,
                  z,
                ]}
              />
            )
          }


          return (
            <Wheel
              key={index}
              position={[
                x,
                0.38,
                z,
              ]}
              scale={
                0.25 +
                localProgress *
                0.75
              }
            />
          )
        },
      )}


      {/* production document */}

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