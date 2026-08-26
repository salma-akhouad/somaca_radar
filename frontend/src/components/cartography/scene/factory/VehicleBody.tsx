import { RoundedBox } from '@react-three/drei'
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
  position?: [number, number, number]
  rotation?: number
  stage?: VehicleStage
  color?: string
  lights?: VehicleLightingState
}


interface WheelProps {
  position: [number, number, number]
}


const BODY_WIDTH = 1.72
const SIDE_SURFACE = BODY_WIDTH / 2 + 0.012


const bodyProfile = new Shape()

bodyProfile.moveTo(-2.02, 0.47)
bodyProfile.lineTo(-2.05, 0.76)
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
bodyProfile.lineTo(0.34, 1.74)
bodyProfile.bezierCurveTo(
  0.58,
  1.7,
  0.72,
  1.58,
  0.89,
  1.39,
)
bodyProfile.lineTo(1.19, 1.08)
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
bodyProfile.lineTo(1.72, 0.45)
bodyProfile.lineTo(-1.72, 0.45)
bodyProfile.closePath()


const frontWindowShape = new Shape()

frontWindowShape.moveTo(0.17, 1.62)
frontWindowShape.lineTo(0.58, 1.58)
frontWindowShape.lineTo(0.91, 1.29)
frontWindowShape.lineTo(0.78, 1.15)
frontWindowShape.lineTo(0.08, 1.15)
frontWindowShape.closePath()


const rearWindowShape = new Shape()

rearWindowShape.moveTo(-0.76, 1.62)
rearWindowShape.lineTo(0.08, 1.62)
rearWindowShape.lineTo(-0.03, 1.15)
rearWindowShape.lineTo(-0.83, 1.15)
rearWindowShape.closePath()


const quarterWindowShape = new Shape()

quarterWindowShape.moveTo(-1.28, 1.53)
quarterWindowShape.lineTo(-0.85, 1.62)
quarterWindowShape.lineTo(-0.91, 1.16)
quarterWindowShape.lineTo(-1.38, 1.19)
quarterWindowShape.closePath()


function Wheel({
  position,
}: WheelProps) {
  return (
    <group position={position}>
      <mesh
        rotation-x={Math.PI / 2}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.35,
            0.35,
            0.22,
            32,
          ]}
        />

        <meshStandardMaterial
          color="#171a18"
          roughness={0.76}
        />
      </mesh>

      <mesh
        rotation-x={Math.PI / 2}
      >
        <cylinderGeometry
          args={[
            0.235,
            0.235,
            0.235,
            24,
          ]}
        />

        <meshStandardMaterial
          color="#858a86"
          metalness={0.72}
          roughness={0.25}
        />
      </mesh>

      {[0, 1, 2, 3, 4].map((index) => (
        <mesh
          key={index}
          position={[0, 0, 0.13]}
          rotation-z={
            index * (Math.PI / 5)
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
            color="#404642"
            metalness={0.7}
            roughness={0.26}
          />
        </mesh>
      ))}

      <mesh
        rotation-x={Math.PI / 2}
      >
        <cylinderGeometry
          args={[
            0.065,
            0.065,
            0.255,
            18,
          ]}
        />

        <meshStandardMaterial
          color="#252a27"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}


function WheelHub({
  position,
}: WheelProps) {
  return (
    <group position={position}>
      <mesh
        rotation-x={Math.PI / 2}
      >
        <cylinderGeometry
          args={[0.18, 0.18, 0.08, 20]}
        />

        <meshStandardMaterial
          color="#717672"
          metalness={0.65}
          roughness={0.34}
        />
      </mesh>

      <mesh
        rotation-x={Math.PI / 2}
      >
        <cylinderGeometry
          args={[0.065, 0.065, 0.11, 16]}
        />

        <meshStandardMaterial
          color="#343936"
          metalness={0.62}
          roughness={0.38}
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
  const materialProps = glazed
    ? {
      color: '#26363b',
      metalness: 0.08,
      roughness: 0.13,
    }
    : {
      color: '#171b19',
      metalness: 0,
      roughness: 0.72,
    }

  return (
    <>
      {[
        frontWindowShape,
        rearWindowShape,
        quarterWindowShape,
      ].map((shape, index) => (
        <mesh
          key={index}
          position={[0, 0, side]}
        >
          <shapeGeometry args={[shape]} />

          <meshStandardMaterial
            {...materialProps}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}


function FrontLighting({
  lights,
}: {
  lights: VehicleLightingState
}) {
  const headlightIntensity =
    lights.headlights
      ? 2.8
      : 0.12

  return (
    <>
      {[-0.53, 0.53].map(
        (z) => (
          <group
            key={z}
            position={[
              2.055,
              0.94,
              z,
            ]}
          >
            <RoundedBox
              args={[
                0.075,
                0.19,
                0.48,
              ]}
              radius={0.045}
              smoothness={3}
            >
              <meshStandardMaterial
                color="#d7dddd"
                metalness={0.16}
                roughness={0.16}
              />
            </RoundedBox>

            <mesh
              position={[
                0.043,
                0.035,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.018,
                  0.045,
                  0.35,
                ]}
              />

              <meshStandardMaterial
                color={
                  lights.headlights
                    ? '#fff4cf'
                    : '#d7dbd7'
                }
                emissive="#fff0bd"
                emissiveIntensity={
                  headlightIntensity
                }
              />
            </mesh>
          </group>
        ),
      )}

      {[-0.7, 0.7].map(
        (z) => {
          const active =
            z < 0
              ? lights.leftIndicator
              : lights.rightIndicator

          return (
            <mesh
              key={z}
              position={[
                2.07,
                0.84,
                z,
              ]}
            >
              <boxGeometry
                args={[
                  0.025,
                  0.1,
                  0.17,
                ]}
              />

              <meshStandardMaterial
                color={
                  active
                    ? '#e7a11e'
                    : '#8c6730'
                }
                emissive="#e99a16"
                emissiveIntensity={
                  active
                    ? 2.2
                    : 0.08
                }
                roughness={0.3}
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
  return (
    <>
      {[-0.57, 0.57].map(
        (z) => (
          <group
            key={z}
            position={[
              -2.045,
              1.01,
              z,
            ]}
          >
            <RoundedBox
              args={[
                0.07,
                0.33,
                0.31,
              ]}
              radius={0.04}
              smoothness={3}
            >
              <meshStandardMaterial
                color="#7d2927"
                emissive="#c82e27"
                emissiveIntensity={
                  lights.brakeLights
                    ? 2.3
                    : 0.16
                }
                roughness={0.25}
              />
            </RoundedBox>

            <mesh
              position={[
                -0.04,
                -0.08,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.015,
                  0.075,
                  0.16,
                ]}
              />

              <meshStandardMaterial
                color={
                  lights.reverseLights
                    ? '#f2eee0'
                    : '#aaa9a1'
                }
                emissive="#eee8d4"
                emissiveIntensity={
                  lights.reverseLights
                    ? 1.7
                    : 0.04
                }
              />
            </mesh>
          </group>
        ),
      )}

      {[-0.7, 0.7].map(
        (z) => {
          const active =
            z < 0
              ? lights.leftIndicator
              : lights.rightIndicator

          return (
            <mesh
              key={z}
              position={[
                -2.055,
                0.9,
                z,
              ]}
            >
              <boxGeometry
                args={[
                  0.02,
                  0.095,
                  0.14,
                ]}
              />

              <meshStandardMaterial
                color={
                  active
                    ? '#e19a1d'
                    : '#855f2c'
                }
                emissive="#df9416"
                emissiveIntensity={
                  active
                    ? 2
                    : 0.05
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
  color = '#eceee9',
  lights = VEHICLE_LIGHTS_OFF,
}: VehicleBodyProps) {
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
              depth: BODY_WIDTH,
              bevelEnabled: true,
              bevelThickness: 0.045,
              bevelSize: 0.045,
              bevelSegments: 2,
              curveSegments: 10,
            },
          ]}
        />

        <meshStandardMaterial
          color={color}
          metalness={0.24}
          roughness={0.27}
        />
      </mesh>


      <>
        <SideWindows
          side={SIDE_SURFACE}
          glazed={hasGlass}
        />

        <SideWindows
          side={-SIDE_SURFACE}
          glazed={hasGlass}
        />

        <mesh
          position={[1.03, 1.41, 0]}
          rotation-z={-0.56}
        >
          <boxGeometry args={[0.055, 0.6, 1.38]} />

          <meshStandardMaterial
            color={
              hasGlass
                ? '#26363b'
                : '#171b19'
            }
            metalness={
              hasGlass
                ? 0.08
                : 0
            }
            roughness={
              hasGlass
                ? 0.12
                : 0.72
            }
          />
        </mesh>

        <mesh
          position={[-1.52, 1.37, 0]}
          rotation-z={0.25}
        >
          <boxGeometry args={[0.055, 0.52, 1.34]} />

          <meshStandardMaterial
            color={
              hasGlass
                ? '#26363b'
                : '#171b19'
            }
            metalness={
              hasGlass
                ? 0.08
                : 0
            }
            roughness={
              hasGlass
                ? 0.12
                : 0.72
            }
          />
        </mesh>
      </>

      {hasTrim && (
        <>
          {[-SIDE_SURFACE, SIDE_SURFACE].map(
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
                      3.38,
                      0.11,
                      0.045,
                    ]}
                  />

                  <meshStandardMaterial
                    color="#292e2b"
                    roughness={0.62}
                  />
                </mesh>

                {[-0.36, 0.48].map(
                  (x) => (
                    <mesh
                      key={x}
                      position={[
                        x,
                        1.02,
                        z,
                      ]}
                    >
                      <boxGeometry
                        args={[
                          0.028,
                          0.76,
                          0.025,
                        ]}
                      />

                      <meshStandardMaterial
                        color="#8b8e89"
                        roughness={0.55}
                      />
                    </mesh>
                  ),
                )}

                {[-0.7, 0.25].map(
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
                        1.05,
                        z * 1.01,
                      ]}
                    >
                      <meshStandardMaterial
                        color={color}
                        metalness={0.22}
                        roughness={0.3}
                      />
                    </RoundedBox>
                  ),
                )}
              </group>
            ),
          )}


          {[-0.79, 0.79].map(
            (z) => (
              <RoundedBox
                key={z}
                args={[
                  0.25,
                  0.16,
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
                  color={color}
                  metalness={0.18}
                  roughness={0.3}
                />
              </RoundedBox>
            ),
          )}


          <RoundedBox
            args={[
              0.13,
              0.37,
              1.5,
            ]}
            radius={0.055}
            smoothness={3}
            position={[
              2.03,
              0.59,
              0,
            ]}
          >
            <meshStandardMaterial
              color="#252a27"
              roughness={0.64}
            />
          </RoundedBox>


          <RoundedBox
            args={[
              0.12,
              0.31,
              1.47,
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


          <RoundedBox
            args={[
              0.055,
              0.27,
              0.95,
            ]}
            radius={0.035}
            smoothness={3}
            position={[
              2.095,
              0.7,
              0,
            ]}
          >
            <meshStandardMaterial
              color="#171b19"
              metalness={0.18}
              roughness={0.4}
            />
          </RoundedBox>


          {[-0.36, 0.36].map(
            (z) => (
              <mesh
                key={z}
                position={[
                  2.127,
                  0.7,
                  z,
                ]}
              >
                <boxGeometry
                  args={[
                    0.012,
                    0.035,
                    0.23,
                  ]}
                />

                <meshStandardMaterial
                  color="#8c918d"
                  metalness={0.68}
                  roughness={0.26}
                />
              </mesh>
            ),
          )}


          <RoundedBox
            args={[
              0.035,
              0.13,
              0.34,
            ]}
            radius={0.025}
            smoothness={2}
            position={[
              2.145,
              0.71,
              0,
            ]}
          >
            <meshStandardMaterial
              color="#c3c6c2"
              metalness={0.75}
              roughness={0.22}
            />
          </RoundedBox>


          <FrontLighting
            lights={lights}
          />

          <RearLighting
            lights={lights}
          />


          <mesh
            position={[
              2.105,
              0.5,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.025,
                0.15,
                0.58,
              ]}
            />

            <meshStandardMaterial
              color="#eeeeea"
              roughness={0.5}
            />
          </mesh>


          <mesh
            position={[
              -2.105,
              0.62,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.025,
                0.15,
                0.58,
              ]}
            />

            <meshStandardMaterial
              color="#eeeeea"
              roughness={0.5}
            />
          </mesh>


          <mesh
            position={[
              -0.76,
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
              color="#292e2b"
              metalness={0.35}
              roughness={0.4}
            />
          </mesh>
        </>
      )}


      {hasWheels && (
        <>
          <Wheel
            position={[
              -1.28,
              0.38,
              -0.8,
            ]}
          />

          <Wheel
            position={[
              -1.28,
              0.38,
              0.8,
            ]}
          />

          <Wheel
            position={[
              1.28,
              0.38,
              -0.8,
            ]}
          />

          <Wheel
            position={[
              1.28,
              0.38,
              0.8,
            ]}
          />

          {[
            [-1.28, -SIDE_SURFACE],
            [-1.28, SIDE_SURFACE],
            [1.28, -SIDE_SURFACE],
            [1.28, SIDE_SURFACE],
          ].map(
            ([x, z], index) => (
              <mesh
                key={index}
                position={[
                  x,
                  0.38,
                  z,
                ]}
              >
                <torusGeometry
                  args={[
                    0.39,
                    0.045,
                    10,
                    28,
                  ]}
                />

                <meshStandardMaterial
                  color="#292e2b"
                  roughness={0.65}
                />
              </mesh>
            ),
          )}
        </>
      )}

      {!hasWheels && (
        <>
          <WheelHub
            position={[-1.28, 0.38, -0.8]}
          />

          <WheelHub
            position={[-1.28, 0.38, 0.8]}
          />

          <WheelHub
            position={[1.28, 0.38, -0.8]}
          />

          <WheelHub
            position={[1.28, 0.38, 0.8]}
          />
        </>
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