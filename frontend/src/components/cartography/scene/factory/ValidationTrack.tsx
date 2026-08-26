import { Text } from '@react-three/drei'
import {
  VEHICLE_JOURNEY,
} from './data/vehicleJourney'

export function ValidationTrack() {
  const validation = VEHICLE_JOURNEY.validation
  return (
    <group
      position={[
        validation.position[0],
        0,
        validation.position[2],
      ]}
    >
      {/* =====================================================
          VALIDATION TRACK

          IMPORTANT:
          PostProductionRoad already provides the driving
          surface underneath this component.

          This component therefore owns ONLY:
          - test elements
          - measurement markings
          - visual identification

          No second floor/platform.
          ===================================================== */}


      {/* Track edge reference lines */}
      {[-1.72, 1.72].map((z) => (
        <mesh
          key={z}
          position={[
            0,
            0.044,
            z,
          ]}
        >
          <boxGeometry
            args={[
              9.2,
              0.012,
              0.055,
            ]}
          />

          <meshStandardMaterial
            color="#d8d7ce"
            roughness={0.82}
          />
        </mesh>
      ))}


      {/* =====================================================
          LOW ROAD-INPUT TEST STRIPS

          These represent controlled low-profile road inputs
          rather than huge obstacles.

          The car should look like it is being tested,
          not climbing stairs.
          ===================================================== */}

      {[
        -2.5,
        -1.65,
        -0.8,
      ].map((x, index) => (
        <mesh
          key={x}
          position={[
            x,
            index === 1
              ? 0.075
              : 0.065,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.24,
              index === 1
                ? 0.075
                : 0.055,
              3.15,
            ]}
          />

          <meshStandardMaterial
            color={
              index === 1
                ? '#666b67'
                : '#737874'
            }
            metalness={0.08}
            roughness={0.76}
          />
        </mesh>
      ))}


      {/* =====================================================
          OFFSET WHEEL TEST PADS

          Instead of every test element crossing the entire
          road, these act on individual wheel paths.

          This gives the track more mechanical realism.
          ===================================================== */}

      {[
        [0.35, -0.72],
        [1.05, 0.72],
        [1.75, -0.72],
        [2.45, 0.72],
      ].map(([x, z], index) => (
        <mesh
          key={`${x}-${z}`}
          position={[
            x,
            index % 2 === 0
              ? 0.065
              : 0.075,
            z,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.52,
              index % 2 === 0
                ? 0.055
                : 0.075,
              0.72,
            ]}
          />

          <meshStandardMaterial
            color="#686d69"
            metalness={0.08}
            roughness={0.74}
          />
        </mesh>
      ))}


      {/* =====================================================
          BRAKING / POSITION REFERENCE MARKINGS

          These are painted markings, so they remain almost
          perfectly flush with the road.
          ===================================================== */}

      {[
        3.35,
        3.75,
        4.15,
      ].map((x) => (
        <mesh
          key={x}
          position={[
            x,
            0.045,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.07,
              0.012,
              3.35,
            ]}
          />

          <meshStandardMaterial
            color="#deddd5"
            roughness={0.8}
          />
        </mesh>
      ))}


      {/* =====================================================
          SMALL VALIDATION SENSOR POSTS

          These give the zone an industrial measurement
          identity without blocking the vehicle route.
          ===================================================== */}

      {[-2.9, 2.9].map((z) => (
        <group
          key={z}
          position={[
            2.8,
            0,
            z > 0
              ? 2.05
              : -2.05,
          ]}
        >
          <mesh
            position={[
              0,
              0.7,
              0,
            ]}
            castShadow
          >
            <boxGeometry
              args={[
                0.12,
                1.4,
                0.12,
              ]}
            />

            <meshStandardMaterial
              color="#4b504d"
              metalness={0.4}
              roughness={0.48}
            />
          </mesh>


          {/* Sensor head */}
          <mesh
            position={[
              0,
              1.34,
              z > 0
                ? -0.08
                : 0.08,
            ]}
          >
            <boxGeometry
              args={[
                0.28,
                0.18,
                0.2,
              ]}
            />

            <meshStandardMaterial
              color="#303532"
              metalness={0.2}
              roughness={0.5}
            />
          </mesh>


          {/* Small active sensor */}
          <mesh
            position={[
              0,
              1.34,
              z > 0
                ? -0.185
                : 0.185,
            ]}
          >
            <circleGeometry
              args={[
                0.045,
                16,
              ]}
            />

            <meshStandardMaterial
              color="#9fb7ac"
              emissive="#78998a"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}


      {/* Floor identification */}
      <Text
        position={[
          0,
          0.056,
          -2.25,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.48}
        color="#3f4441"
        anchorX="center"
        anchorY="middle"
      >
        PISTE DE VALIDATION
      </Text>
    </group>
  )
}