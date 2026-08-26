import { Text } from '@react-three/drei'
import {
  VEHICLE_JOURNEY,
} from './data/vehicleJourney'

export function FinalControlZone() {
  const finalControl = VEHICLE_JOURNEY.finalControl
  return (
    <group
      position={[
        finalControl.position[0],
        0,
        finalControl.position[2],
      ]}
    >
      {/* =====================================================
          FINAL CONTROL AREA

          IMPORTANT:
          The road already exists underneath this component.

          Therefore this component does NOT create another
          large floor/platform.

          It only adds:
          - painted inspection markings
          - roller/test equipment
          - control equipment
          - identification
          ===================================================== */}


      {/* Inspection-zone side markings */}
      {[-1.78, 1.78].map((z) => (
        <mesh
          key={z}
          position={[
            0,
            0.043,
            z,
          ]}
        >
          <boxGeometry
            args={[
              7.6,
              0.012,
              0.09,
            ]}
          />

          <meshStandardMaterial
            color="#c89d18"
            roughness={0.75}
          />
        </mesh>
      ))}


      {/* Entry boundary */}
      <mesh
        position={[
          -3.72,
          0.043,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.09,
            0.012,
            3.65,
          ]}
        />

        <meshStandardMaterial
          color="#c89d18"
          roughness={0.75}
        />
      </mesh>


      {/* Exit boundary */}
      <mesh
        position={[
          3.72,
          0.043,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.09,
            0.012,
            3.65,
          ]}
        />

        <meshStandardMaterial
          color="#c89d18"
          roughness={0.75}
        />
      </mesh>


      {/* =====================================================
          ROLLER TEST EQUIPMENT

          These ARE physical objects, so they are allowed to
          rise above the road surface.

          The two roller banks correspond approximately to the
          front and rear axle positions of the future vehicle.
          ===================================================== */}

      {[-1.25, 1.25].map((x) => (
        <group key={x}>
          {[-0.68, 0.68].map((z) => (
            <mesh
              key={z}
              position={[
                x,
                0.16,
                z,
              ]}
              rotation-z={
                Math.PI / 2
              }
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
                color="#303532"
                metalness={0.58}
                roughness={0.38}
              />
            </mesh>
          ))}
        </group>
      ))}


      {/* Roller mounting plates */}
      {[-1.25, 1.25].map((x) => (
        <mesh
          key={x}
          position={[
            x,
            0.065,
            0,
          ]}
          receiveShadow
        >
          <boxGeometry
            args={[
              0.75,
              0.07,
              1.85,
            ]}
          />

          <meshStandardMaterial
            color="#686d69"
            metalness={0.25}
            roughness={0.66}
          />
        </mesh>
      ))}


      {/* =====================================================
          CONTROL CABINET

          Kept outside the vehicle trajectory so that the
          future Sandero has a clear central inspection area.
          ===================================================== */}

      <mesh
        position={[
          3.05,
          0.78,
          -2.25,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.9,
            1.56,
            0.68,
          ]}
        />

        <meshStandardMaterial
          color="#4d524f"
          metalness={0.18}
          roughness={0.64}
        />
      </mesh>


      {/* Cabinet front panel */}
      <mesh
        position={[
          3.05,
          1.02,
          -1.902,
        ]}
      >
        <boxGeometry
          args={[
            0.56,
            0.4,
            0.018,
          ]}
        />

        <meshStandardMaterial
          color="#252b28"
          roughness={0.45}
        />
      </mesh>


      {/* Active inspection display */}
      <mesh
        position={[
          3.05,
          1.04,
          -1.89,
        ]}
      >
        <boxGeometry
          args={[
            0.45,
            0.28,
            0.012,
          ]}
        />

        <meshStandardMaterial
          color="#b9cec4"
          emissive="#6f9885"
          emissiveIntensity={0.34}
          roughness={0.3}
        />
      </mesh>


      {/* Cabinet status indicators */}
      {[
        [-0.2, '#72a77a'],
        [0, '#c99c24'],
        [0.2, '#9a3e35'],
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
            args={[
              0.035,
              12,
              12,
            ]}
          />

          <meshStandardMaterial
            color={String(color)}
            emissive={String(color)}
            emissiveIntensity={0.24}
          />
        </mesh>
      ))}


      {/* =====================================================
          INSPECTION LIGHT POSTS

          These are NOT the car lights.

          They are fixed equipment used to visually frame the
          control station. The future Sandero will have its own
          controllable headlights, indicators and rear lamps.
          ===================================================== */}

      {[-2.75, 2.75].map((x) => (
        <group
          key={x}
          position={[
            x,
            0,
            2.18,
          ]}
        >
          {/* Vertical post */}
          <mesh
            position={[
              0,
              1.25,
              0,
            ]}
            castShadow
          >
            <boxGeometry
              args={[
                0.11,
                2.5,
                0.11,
              ]}
            />

            <meshStandardMaterial
              color="#484d4a"
              metalness={0.42}
              roughness={0.48}
            />
          </mesh>


          {/* Inspection lamp housing */}
          <mesh
            position={[
              0,
              2.28,
              -0.08,
            ]}
            rotation-x={-0.22}
          >
            <boxGeometry
              args={[
                0.72,
                0.28,
                0.16,
              ]}
            />

            <meshStandardMaterial
              color="#333835"
              roughness={0.48}
            />
          </mesh>


          {/* Neutral inspection lamp */}
          <mesh
            position={[
              0,
              2.25,
              -0.17,
            ]}
            rotation-x={-0.22}
          >
            <boxGeometry
              args={[
                0.56,
                0.14,
                0.025,
              ]}
            />

            <meshStandardMaterial
              color="#e2dfce"
              emissive="#d6d0ae"
              emissiveIntensity={0.35}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}


      {/* =====================================================
          RESERVED VEHICLE INSPECTION SPACE

          Intentionally empty for now.

               FRONT
                 →
          ┌─────────────────────┐
          │                     │
          │   future Sandero    │
          │                     │
          └─────────────────────┘

          Batch 2 creates the vehicle.
          Batch 5 activates its lighting tests.
          ===================================================== */}


      {/* Zone label painted on the floor */}
      <Text
        position={[
          0,
          0.055,
          -2.35,
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
        CONTRÔLE FINAL
      </Text>
    </group>
  )
}