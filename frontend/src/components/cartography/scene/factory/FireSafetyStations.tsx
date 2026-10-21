import {
  RoundedBox,
  Text,
} from '@react-three/drei'


function Extinguisher({
  x,
}: {
  x: number
}) {
  return (
    <group
      position={[
        x,
        0,
        0.16,
      ]}
    >
      {/* Cylinder */}

      <mesh
        position={[
          0,
          0.55,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.13,
            0.16,
            0.7,
            14,
          ]}
        />

        <meshStandardMaterial
          color="#b7352e"
          roughness={0.6}
        />
      </mesh>


      {/* Shoulder */}

      <mesh
        position={[
          0,
          0.92,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.075,
            0.11,
            0.12,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#b7352e"
          roughness={0.58}
        />
      </mesh>


      {/* Valve */}

      <mesh
        position={[
          0,
          1.04,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.18,
            0.07,
            0.11,
          ]}
        />

        <meshStandardMaterial
          color="#272c29"
          metalness={0.3}
          roughness={0.46}
        />
      </mesh>


      {/* Hose */}

      <mesh
        position={[
          0.14,
          0.8,
          0.03,
        ]}
        rotation-z={-0.25}
      >
        <cylinderGeometry
          args={[
            0.025,
            0.025,
            0.48,
            8,
          ]}
        />

        <meshStandardMaterial
          color="#252a27"
          roughness={0.68}
        />
      </mesh>


      {/* White label */}

      <mesh
        position={[
          0,
          0.58,
          0.155,
        ]}
      >
        <boxGeometry
          args={[
            0.14,
            0.19,
            0.012,
          ]}
        />

        <meshStandardMaterial
          color="#ecece5"
          roughness={0.8}
        />
      </mesh>
    </group>
  )
}


function FireStation({
  position,
  rotation = 0,
  label,
}: {
  position: [
    number,
    number,
    number,
  ]

  rotation?: number

  label: string
}) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* Mounting post */}

      <mesh
        position={[
          0,
          1.25,
          0,
        ]}
      >
        <boxGeometry
          args={[
            1.35,
            2.5,
            0.1,
          ]}
        />

        <meshStandardMaterial
          color="#4a504c"
          metalness={0.35}
          roughness={0.5}
        />
      </mesh>


      <RoundedBox
        args={[
          1.5,
          0.48,
          0.09,
        ]}
        radius={0.04}
        smoothness={2}
        position={[
          0,
          2.25,
          0.08,
        ]}
      >
        <meshStandardMaterial
          color="#f1f0e8"
          roughness={0.84}
        />
      </RoundedBox>


      <Text
        position={[
          0,
          2.25,
          0.14,
        ]}
        fontSize={0.18}
        color="#a82e29"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>


      {/* Two separated extinguishers */}

      <Extinguisher
        x={-0.35}
      />

      <Extinguisher
        x={0.35}
      />
    </group>
  )
}


export function FireSafetyStations() {
  return (
    <group>
      <FireStation
        position={[
          28.6,
          0,
          -10.5,
        ]}
        rotation={
          -Math.PI / 2
        }
        label="INCENDIE UET 1"
      />


      <FireStation
        position={[
          -12,
          0,
          28,
        ]}
        rotation={
          Math.PI
        }
        label="INCENDIE UET 2"
      />


      <FireStation
        position={[
          -28.6,
          0,
          10.5,
        ]}
        rotation={
          Math.PI / 2
        }
        label="INCENDIE UET 3"
      />


      <FireStation
        position={[
          11.5,
          0,
          -28,
        ]}
        label="INCENDIE UET 4"
      />
    </group>
  )
}