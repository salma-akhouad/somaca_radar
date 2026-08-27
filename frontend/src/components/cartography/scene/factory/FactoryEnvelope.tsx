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
      <RoundedBox
        args={[
          3.1,
          0.13,
          0.62,
        ]}
        radius={0.04}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#606762"
          metalness={0.34}
          roughness={0.48}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          -0.085,
          0,
        ]}
      >
        <boxGeometry
          args={[
            2.72,
            0.035,
            0.46,
          ]}
        />

        <meshStandardMaterial
          color="#eee9d1"
          emissive="#f1ebd0"
          emissiveIntensity={0.42}
          roughness={0.28}
        />
      </mesh>
    </group>
  )
}


export function FactoryEnvelope() {
  return (
    <group>
      {/* Rear wall */}
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

      {/* Left wall */}
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

      {/* Structural columns */}
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
      ].map((z) => (
        <Column
          key={`left-${z}`}
          position={[
            -49,
            3.8,
            z,
          ]}
        />
      ))}

      {[
        -30,
        -10,
        10,
        30,
      ].map((z) => (
        <Column
          key={`right-${z}`}
          position={[
            79,
            3.8,
            z,
          ]}
        />
      ))}

      {/* Lighter roof structure */}
      {[
        -30,
        -10,
        10,
        30,
      ].map((z) => (
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
      ))}

      {[
        -35,
        -10,
        15,
        40,
        65,
      ].map((x) => (
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
      ))}

      {/* Fixtures correspond to existing scene lights */}
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
            key={`lamp-${x}-${z}`}
            position={[
              x,
              7.24,
              z,
            ]}
          />
        ),
      )}
    </group>
  )
}