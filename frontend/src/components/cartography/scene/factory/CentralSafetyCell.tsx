import {
  RoundedBox,
  Text,
} from '@react-three/drei'


function MeetingChair({
  position,
  rotation,
}: {
  position: [
    number,
    number,
    number,
  ]

  rotation: number
}) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      <RoundedBox
        args={[
          0.62,
          0.12,
          0.62,
        ]}
        radius={0.055}
        smoothness={2}
        position={[
          0,
          0.48,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#64635e"
          roughness={0.78}
        />
      </RoundedBox>


      <RoundedBox
        args={[
          0.62,
          0.76,
          0.09,
        ]}
        radius={0.04}
        smoothness={2}
        position={[
          0,
          0.89,
          -0.27,
        ]}
      >
        <meshStandardMaterial
          color="#565853"
          roughness={0.78}
        />
      </RoundedBox>
    </group>
  )
}


function GlassPanel({
  position,
  size,
}: {
  position: [
    number,
    number,
    number,
  ]

  size: [
    number,
    number,
    number,
  ]
}) {
  return (
    <mesh
      position={position}
    >
      <boxGeometry
        args={size}
      />

      <meshStandardMaterial
        color="#d6dfde"
        transparent
        opacity={0.19}
        roughness={0.12}
      />
    </mesh>
  )
}


export function CentralSafetyCell() {
  return (
    <group>
      {/* Calm neutral meeting-room floor */}

      <mesh
        position={[
          0,
          0.026,
          0,
        ]}
      >
        <boxGeometry
          args={[
            7,
            0.02,
            5.4,
          ]}
        />

        <meshStandardMaterial
          color="#aaa9a3"
          roughness={0.9}
        />
      </mesh>


      {/* Frame */}

      {[
        [-3.45, -2.65],
        [-3.45, 2.65],
        [3.45, -2.65],
        [3.45, 2.65],
      ].map(
        (
          [
            x,
            z,
          ],
          index,
        ) => (
          <mesh
            key={index}
            position={[
              x,
              1.5,
              z,
            ]}
          >
            <boxGeometry
              args={[
                0.1,
                3,
                0.1,
              ]}
            />

            <meshStandardMaterial
              color="#434944"
              metalness={0.34}
              roughness={0.48}
            />
          </mesh>
        ),
      )}


      <GlassPanel
        position={[
          -3.42,
          1.5,
          0,
        ]}
        size={[
          0.045,
          2.9,
          5.2,
        ]}
      />


      <GlassPanel
        position={[
          3.42,
          1.5,
          0,
        ]}
        size={[
          0.045,
          2.9,
          5.2,
        ]}
      />


      <GlassPanel
        position={[
          0,
          1.5,
          -2.62,
        ]}
        size={[
          6.8,
          2.9,
          0.045,
        ]}
      />


      {/* Front wall with proper doorway */}

      <GlassPanel
        position={[
          -2.15,
          1.5,
          2.62,
        ]}
        size={[
          2.5,
          2.9,
          0.045,
        ]}
      />


      <GlassPanel
        position={[
          2.15,
          1.5,
          2.62,
        ]}
        size={[
          2.5,
          2.9,
          0.045,
        ]}
      />


      {/* Door frame */}

      {[
        -0.68,
        0.68,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              1.35,
              2.63,
            ]}
          >
            <boxGeometry
              args={[
                0.07,
                2.7,
                0.07,
              ]}
            />

            <meshStandardMaterial
              color="#414743"
              metalness={0.32}
              roughness={0.46}
            />
          </mesh>
        ),
      )}


      <mesh
        position={[
          0,
          2.67,
          2.63,
        ]}
      >
        <boxGeometry
          args={[
            1.42,
            0.07,
            0.07,
          ]}
        />

        <meshStandardMaterial
          color="#414743"
          metalness={0.32}
          roughness={0.46}
        />
      </mesh>


      {/* Door intentionally open */}

      <group
        position={[
          -0.66,
          0,
          2.63,
        ]}
        rotation-y={
          -Math.PI / 3
        }
      >
        <GlassPanel
          position={[
            0.64,
            1.34,
            0,
          ]}
          size={[
            1.28,
            2.62,
            0.045,
          ]}
        />


        <mesh
          position={[
            1.05,
            1.25,
            0.06,
          ]}
        >
          <sphereGeometry
            args={[
              0.055,
              10,
              10,
            ]}
          />

          <meshStandardMaterial
            color="#555c57"
            metalness={0.55}
            roughness={0.3}
          />
        </mesh>
      </group>


      {/* Small clean header, not black billboard */}

      <RoundedBox
        args={[
          3.9,
          0.5,
          0.08,
        ]}
        radius={0.055}
        smoothness={2}
        position={[
          0,
          2.95,
          2.68,
        ]}
      >
        <meshStandardMaterial
          color="#f0f1ec"
          roughness={0.82}
        />
      </RoundedBox>


      <Text
        position={[
          0,
          2.95,
          2.73,
        ]}
        fontSize={0.26}
        color="#303532"
        anchorX="center"
        anchorY="middle"
      >
        SALLE DE RÉUNION UET
      </Text>


      {/* Smaller oval meeting table */}

      <mesh
        position={[
          0,
          0.77,
          -0.15,
        ]}
        scale={[
          1.3,
          1,
          0.9,
        ]}
      >
        <cylinderGeometry
          args={[
            0.86,
            0.86,
            0.14,
            28,
          ]}
        />

        <meshStandardMaterial
          color="#87684d"
          roughness={0.7}
        />
      </mesh>


      <mesh
        position={[
          0,
          0.38,
          -0.15,
        ]}
      >
        <cylinderGeometry
          args={[
            0.16,
            0.3,
            0.76,
            14,
          ]}
        />

        <meshStandardMaterial
          color="#424844"
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>


      <MeetingChair
        position={[
          0,
          0,
          1.45,
        ]}
        rotation={
          Math.PI
        }
      />


      <MeetingChair
        position={[
          0,
          0,
          -1.75,
        ]}
        rotation={0}
      />


      <MeetingChair
        position={[
          -1.6,
          0,
          -0.15,
        ]}
        rotation={
          Math.PI / 2
        }
      />


      <MeetingChair
        position={[
          1.6,
          0,
          -0.15,
        ]}
        rotation={
          -Math.PI / 2
        }
      />


      {/* Simple planning whiteboard */}

      <RoundedBox
        args={[
          2.8,
          1.25,
          0.08,
        ]}
        radius={0.05}
        smoothness={2}
        position={[
          0,
          1.65,
          -2.59,
        ]}
      >
        <meshStandardMaterial
          color="#efefe9"
          roughness={0.78}
        />
      </RoundedBox>


      <Text
        position={[
          0,
          1.93,
          -2.53,
        ]}
        fontSize={0.2}
        color="#343936"
        anchorX="center"
        anchorY="middle"
      >
        POINT UET
      </Text>


      <Text
        position={[
          0,
          1.58,
          -2.53,
        ]}
        fontSize={0.16}
        color="#626762"
        anchorX="center"
        anchorY="middle"
      >
        PRODUCTION • QUALITÉ • SÉCURITÉ
      </Text>


      <Text
        position={[
          0,
          1.31,
          -2.53,
        ]}
        fontSize={0.15}
        color="#707570"
        anchorX="center"
        anchorY="middle"
      >
        OBJECTIFS DU JOUR
      </Text>
    </group>
  )
}