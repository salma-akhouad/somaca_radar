import {
  RoundedBox,
} from '@react-three/drei'


const structuralColor =
  '#5a605c'

const wallColor =
  '#b9bbb6'

const lowerWallColor =
  '#8f938e'


function Column({
  position,
}: {
  position: [
    number,
    number,
    number,
  ]
}) {
  return (
    <RoundedBox
      args={[
        0.36,
        7.6,
        0.36,
      ]}
      radius={0.045}
      smoothness={2}
      position={position}
    >
      <meshStandardMaterial
        color={
          structuralColor
        }
        metalness={0.38}
        roughness={0.5}
      />
    </RoundedBox>
  )
}


function CeilingLuminaire({
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
      {/* Ceiling mount */}

      <mesh
        position={[
          0,
          1.05,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.13,
            0.13,
            0.1,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#414743"
          metalness={0.48}
          roughness={0.42}
        />
      </mesh>


      {/* Suspension cable */}

      <mesh
        position={[
          0,
          0.5,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.025,
            0.025,
            1.05,
            8,
          ]}
        />

        <meshStandardMaterial
          color="#343936"
          metalness={0.58}
          roughness={0.36}
        />
      </mesh>


      {/* Driver housing */}

      <RoundedBox
        args={[
          0.48,
          0.2,
          0.48,
        ]}
        radius={0.06}
        smoothness={2}
        position={[
          0,
          -0.08,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#242927"
          metalness={0.24}
          roughness={0.54}
        />
      </RoundedBox>


      {/* Industrial reflector */}

      <mesh
        position={[
          0,
          -0.32,
          0,
        ]}
      >
        <coneGeometry
          args={[
            0.78,
            0.5,
            18,
            1,
            true,
          ]}
        />

        <meshStandardMaterial
          color="#282d2a"
          metalness={0.16}
          roughness={0.56}
          side={2}
        />
      </mesh>


      {/* Bright visible diffuser */}

      <mesh
        position={[
          0,
          -0.575,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.66,
            0.66,
            0.045,
            18,
          ]}
        />

        <meshStandardMaterial
          color="#fff7dc"
          emissive="#fff0c8"
          emissiveIntensity={2.2}
          roughness={0.14}
          toneMapped={false}
        />
      </mesh>


      {/* Small luminous core visible from high camera */}

      <mesh
        position={[
          0,
          -0.603,
          0,
        ]}
        rotation-x={
          -Math.PI / 2
        }
      >
        <circleGeometry
          args={[
            0.52,
            18,
          ]}
        />

        <meshBasicMaterial
          color="#fff6d9"
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}


export function FactoryEnvelope() {
  return (
    <group>
      <mesh
        position={[
          15,
          3.2,
          39,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            126,
            6.4,
            0.32,
          ]}
        />

        <meshStandardMaterial
          color={wallColor}
          roughness={0.88}
        />
      </mesh>

      <mesh
        position={[
          15,
          0.85,
          38.8,
        ]}
      >
        <boxGeometry
          args={[
            126,
            1.7,
            0.06,
          ]}
        />

        <meshStandardMaterial
          color={
            lowerWallColor
          }
          roughness={0.82}
        />
      </mesh>

      <mesh
        position={[
          -49,
          3.2,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            0.32,
            6.4,
            78,
          ]}
        />

        <meshStandardMaterial
          color={wallColor}
          roughness={0.88}
        />
      </mesh>

      <mesh
        position={[
          -48.8,
          0.85,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.06,
            1.7,
            78,
          ]}
        />

        <meshStandardMaterial
          color={
            lowerWallColor
          }
          roughness={0.82}
        />
      </mesh>


      {[
        [-40, 39],
        [-20, 39],
        [0, 39],
        [20, 39],
        [40, 39],
        [60, 39],
      ].map(
        ([x, z]) => (
          <Column
            key={`rear-${x}`}
            position={[
              x,
              3.8,
              z,
            ]}
          />
        ),
      )}


      {[
        -30,
        -10,
        10,
        30,
      ].map(
        (z) => (
          <Column
            key={`left-${z}`}
            position={[
              -49,
              3.8,
              z,
            ]}
          />
        ),
      )}


      {[
        -30,
        -10,
        10,
        30,
      ].map(
        (z) => (
          <Column
            key={`right-${z}`}
            position={[
              79,
              3.8,
              z,
            ]}
          />
        ),
      )}


      {[
        -30,
        -10,
        10,
        30,
      ].map(
        (z) => (
          <mesh
            key={`roof-x-${z}`}
            position={[
              15,
              7.5,
              z,
            ]}
          >
            <boxGeometry
              args={[
                128,
                0.14,
                0.18,
              ]}
            />

            <meshStandardMaterial
              color="#68706b"
              metalness={0.3}
              roughness={0.56}
            />
          </mesh>
        ),
      )}


      {[
        -35,
        -10,
        15,
        40,
        65,
      ].map(
        (x) => (
          <mesh
            key={`roof-z-${x}`}
            position={[
              x,
              7.5,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.18,
                0.14,
                78,
              ]}
            />

            <meshStandardMaterial
              color="#68706b"
              metalness={0.3}
              roughness={0.56}
            />
          </mesh>
        ),
      )}


      {[
        [-20, 16],
        [20, 16],
        [60, 16],
        [-20, -16],
        [20, -16],
        [60, -16],
      ].map(
        ([x, z]) => (
          <CeilingLuminaire
            key={`${x}-${z}`}
            position={[
              x,
              6.4,
              z,
            ]}
          />
        ),
      )}
    </group>
  )
}