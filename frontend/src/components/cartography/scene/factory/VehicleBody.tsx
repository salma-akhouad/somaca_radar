import {
  RoundedBox,
} from '@react-three/drei'


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
}


interface WheelProps {
  position: [
    number,
    number,
    number,
  ]
}


function Wheel({
  position,
}: WheelProps) {
  return (
    <group position={position}>
      {/* Tire */}
      <mesh
        rotation-x={Math.PI / 2}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.37,
            0.37,
            0.24,
            28,
          ]}
        />

        <meshStandardMaterial
          color="#181c19"
          roughness={0.78}
        />
      </mesh>

      {/* Alloy wheel */}
      <mesh
        rotation-x={Math.PI / 2}
      >
        <cylinderGeometry
          args={[
            0.22,
            0.22,
            0.255,
            20,
          ]}
        />

        <meshStandardMaterial
          color="#747a75"
          metalness={0.72}
          roughness={0.28}
        />
      </mesh>

      {/* Hub */}
      <mesh
        rotation-x={Math.PI / 2}
      >
        <cylinderGeometry
          args={[
            0.07,
            0.07,
            0.27,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#2a2f2b"
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}


export function VehicleBody({
  position = [0, 0, 0],
  rotation = 0,
  stage = 'finished',

  // Warm pearl/off-white automotive paint.
  color = '#eceee9',
}: VehicleBodyProps) {
  const hasGlass =
    stage !== 'shell'

  const hasExteriorTrim =
    stage === 'assembly' ||
    stage === 'documented' ||
    stage === 'finished'

  const hasWheels =
    stage === 'documented' ||
    stage === 'finished'

  const hasDocument =
    stage === 'documented' ||
    stage === 'finished'


  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* =====================================================
          MAIN LOWER BODY
          ===================================================== */}

      <RoundedBox
        args={[3.75, 0.62, 1.6]}
        radius={0.16}
        smoothness={5}
        position={[0, 0.72, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={0.22}
          roughness={0.28}
        />
      </RoundedBox>


      {/* Hood / capot */}
      <RoundedBox
        args={[1.05, 0.28, 1.48]}
        radius={0.12}
        smoothness={4}
        position={[1.38, 1.02, 0]}
        rotation={[0, 0, -0.05]}
        castShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={0.22}
          roughness={0.27}
        />
      </RoundedBox>


      {/* Rear hatch volume */}
      <RoundedBox
        args={[0.72, 0.58, 1.5]}
        radius={0.14}
        smoothness={4}
        position={[-1.46, 1.03, 0]}
        rotation={[0, 0, 0.06]}
        castShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={0.22}
          roughness={0.28}
        />
      </RoundedBox>


      {/* =====================================================
          CABIN / ROOF
          ===================================================== */}

      <RoundedBox
        args={[2.18, 0.78, 1.34]}
        radius={0.22}
        smoothness={5}
        position={[-0.15, 1.38, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={0.2}
          roughness={0.27}
        />
      </RoundedBox>


      {/* Slight roof cap */}
      <RoundedBox
        args={[1.75, 0.12, 1.28]}
        radius={0.08}
        smoothness={4}
        position={[-0.2, 1.82, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={0.18}
          roughness={0.25}
        />
      </RoundedBox>


      {/* =====================================================
          WINDOWS / GLASS
          ===================================================== */}

      {hasGlass && (
        <>
          {/* Windshield */}
          <mesh
            position={[0.84, 1.43, 0]}
            rotation-z={-0.34}
          >
            <boxGeometry args={[0.07, 0.62, 1.12]} />

            <meshStandardMaterial
              color="#24343a"
              metalness={0.08}
              roughness={0.13}
            />
          </mesh>


          {/* Rear glass */}
          <mesh
            position={[-1.18, 1.43, 0]}
            rotation-z={0.28}
          >
            <boxGeometry args={[0.07, 0.57, 1.08]} />

            <meshStandardMaterial
              color="#24343a"
              metalness={0.08}
              roughness={0.13}
            />
          </mesh>


          {/* Side windows */}
          {[-0.69, 0.69].map(
            (z) => (
              <group key={z}>
                <RoundedBox
                  args={[0.82, 0.46, 0.035]}
                  radius={0.05}
                  smoothness={3}
                  position={[0.28, 1.46, z]}
                >
                  <meshStandardMaterial
                    color="#26383e"
                    roughness={0.12}
                    metalness={0.06}
                  />
                </RoundedBox>

                <RoundedBox
                  args={[0.72, 0.46, 0.035]}
                  radius={0.05}
                  smoothness={3}
                  position={[-0.62, 1.46, z]}
                >
                  <meshStandardMaterial
                    color="#26383e"
                    roughness={0.12}
                    metalness={0.06}
                  />
                </RoundedBox>
              </group>
            ),
          )}
        </>
      )}


      {/* =====================================================
          STEPWAY-LIKE DARK EXTERIOR TRIM
          ===================================================== */}

      {hasExteriorTrim && (
        <>
          {/* Side rocker cladding */}
          {[-0.82, 0.82].map(
            (z) => (
              <mesh
                key={z}
                position={[0, 0.52, z]}
              >
                <boxGeometry args={[3.3, 0.15, 0.08]} />

                <meshStandardMaterial
                  color="#242925"
                  roughness={0.66}
                />
              </mesh>
            ),
          )}


          {/* Front bumper */}
          <RoundedBox
            args={[0.2, 0.42, 1.48]}
            radius={0.08}
            smoothness={3}
            position={[1.96, 0.68, 0]}
          >
            <meshStandardMaterial
              color="#252a27"
              roughness={0.62}
            />
          </RoundedBox>


          {/* Rear bumper */}
          <RoundedBox
            args={[0.18, 0.38, 1.45]}
            radius={0.07}
            smoothness={3}
            position={[-1.97, 0.67, 0]}
          >
            <meshStandardMaterial
              color="#252a27"
              roughness={0.62}
            />
          </RoundedBox>


          {/* Roof rails */}
          {[-0.53, 0.53].map(
            (z) => (
              <RoundedBox
                key={z}
                args={[1.82, 0.07, 0.06]}
                radius={0.025}
                smoothness={2}
                position={[-0.18, 1.94, z]}
              >
                <meshStandardMaterial
                  color="#333936"
                  metalness={0.38}
                  roughness={0.4}
                />
              </RoundedBox>
            ),
          )}


          {/* Mirrors */}
          {[-0.83, 0.83].map(
            (z) => (
              <RoundedBox
                key={z}
                args={[0.28, 0.16, 0.14]}
                radius={0.06}
                smoothness={3}
                position={[0.67, 1.43, z]}
              >
                <meshStandardMaterial
                  color="#2e3430"
                  roughness={0.38}
                />
              </RoundedBox>
            ),
          )}
        </>
      )}


      {/* =====================================================
          FRONT IDENTITY
          ===================================================== */}

      {hasExteriorTrim && (
        <>
          {/* Grille */}
          <RoundedBox
            args={[0.06, 0.38, 0.92]}
            radius={0.03}
            smoothness={3}
            position={[2.065, 0.87, 0]}
          >
            <meshStandardMaterial
              color="#171c19"
              metalness={0.22}
              roughness={0.42}
            />
          </RoundedBox>


          {/* Headlights */}
          {[-0.5, 0.5].map(
            (z) => (
              <RoundedBox
                key={z}
                args={[0.075, 0.22, 0.42]}
                radius={0.05}
                smoothness={3}
                position={[2.07, 1.08, z]}
              >
                <meshStandardMaterial
                  color="#e6ece9"
                  emissive="#cdd8d3"
                  emissiveIntensity={0.25}
                  roughness={0.16}
                />
              </RoundedBox>
            ),
          )}


          {/* Rear lights */}
          {[-0.52, 0.52].map(
            (z) => (
              <RoundedBox
                key={z}
                args={[0.06, 0.35, 0.28]}
                radius={0.04}
                smoothness={3}
                position={[-2.07, 1.03, z]}
              >
                <meshStandardMaterial
                  color="#8e302b"
                  emissive="#6d211e"
                  emissiveIntensity={0.18}
                  roughness={0.26}
                />
              </RoundedBox>
            ),
          )}
        </>
      )}


      {/* =====================================================
          WHEELS
          ===================================================== */}

      {hasWheels && (
        <>
          <Wheel position={[-1.23, 0.39, -0.82]} />
          <Wheel position={[-1.23, 0.39, 0.82]} />

          <Wheel position={[1.24, 0.39, -0.82]} />
          <Wheel position={[1.24, 0.39, 0.82]} />
        </>
      )}


      {/* =====================================================
          PRODUCTION DOCUMENT ON WINDSHIELD
          ===================================================== */}

      {hasDocument && (
        <mesh
          position={[0.88, 1.52, -0.3]}
          rotation-z={-0.34}
        >
          <boxGeometry args={[0.025, 0.24, 0.34]} />

          <meshStandardMaterial
            color="#f5f3ec"
            roughness={0.88}
          />
        </mesh>
      )}
    </group>
  )
}