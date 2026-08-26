import {
  RoundedBox,
  Text,
} from '@react-three/drei'

import {
  VEHICLE_JOURNEY,
} from './data/vehicleJourney'

export function ReleaseGate() {
  const release = VEHICLE_JOURNEY.releaseGate
  return (
    <group
      position={[
        release.position[0],
        0,
        release.position[2],
      ]}
    >
      {/* =====================================================
          FINISHED VEHICLE RELEASE PORTAL

          Purpose:
          validation complete
              ↓
          vehicle passes controlled release point
              ↓
          parking / outbound handling
          ===================================================== */}


      {/* Structural columns */}
      {[-2.25, 2.25].map(
        (z) => (
          <group key={z}>
            <RoundedBox
              args={[
                0.28,
                4.25,
                0.28,
              ]}
              radius={0.05}
              smoothness={3}
              position={[
                0,
                2.12,
                z,
              ]}
              castShadow
            >
              <meshStandardMaterial
                color="#444a46"
                metalness={0.46}
                roughness={0.44}
              />
            </RoundedBox>


            {/* Protective column foot */}
            <RoundedBox
              args={[
                0.46,
                0.48,
                0.46,
              ]}
              radius={0.06}
              smoothness={3}
              position={[
                0,
                0.24,
                z,
              ]}
            >
              <meshStandardMaterial
                color="#b4922c"
                roughness={0.66}
              />
            </RoundedBox>
          </group>
        ),
      )}


      {/* Upper portal beam */}
      <RoundedBox
        args={[
          0.3,
          0.34,
          4.8,
        ]}
        radius={0.05}
        smoothness={3}
        position={[
          0,
          4.15,
          0,
        ]}
        castShadow
      >
        <meshStandardMaterial
          color="#3b413d"
          metalness={0.42}
          roughness={0.45}
        />
      </RoundedBox>


      {/* =====================================================
          RELEASE STATUS MODULE
          ===================================================== */}

      <RoundedBox
        args={[
          0.16,
          0.62,
          0.72,
        ]}
        radius={0.04}
        smoothness={3}
        position={[
          0.1,
          3.53,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#2e3430"
          roughness={0.48}
        />
      </RoundedBox>


      {/* Green release indicator */}
      <mesh
        position={[
          0.19,
          3.64,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            0.085,
            16,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#6fa775"
          emissive="#4f8f59"
          emissiveIntensity={0.48}
          roughness={0.34}
        />
      </mesh>


      {/* Amber standby indicator */}
      <mesh
        position={[
          0.19,
          3.4,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            0.065,
            16,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#b99233"
          emissive="#8c6d25"
          emissiveIntensity={0.18}
          roughness={0.4}
        />
      </mesh>


      {/* =====================================================
          IDENTIFICATION

          Placed on the portal beam so it stays readable
          instead of being painted under passing vehicles.
          ===================================================== */}

      <Text
        position={[
          0.18,
          4.15,
          0,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
        fontSize={0.3}
        color="#ebeae4"
        anchorX="center"
        anchorY="middle"
      >
        SORTIE VÉHICULES FINIS
      </Text>
    </group>
  )
}