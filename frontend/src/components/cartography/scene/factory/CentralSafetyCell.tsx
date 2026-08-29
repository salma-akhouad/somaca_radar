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
          0.65,
          0.12,
          0.65,
        ]}
        radius={0.05}
        smoothness={2}
        position={[
          0,
          0.47,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#454a47"
          roughness={0.74}
        />
      </RoundedBox>


      <RoundedBox
        args={[
          0.65,
          0.76,
          0.1,
        ]}
        radius={0.04}
        smoothness={2}
        position={[
          0,
          0.88,
          -0.29,
        ]}
      >
        <meshStandardMaterial
          color="#3f4541"
          roughness={0.74}
        />
      </RoundedBox>


      {[
        [-0.23, -0.23],
        [-0.23, 0.23],
        [0.23, -0.23],
        [0.23, 0.23],
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
              0.23,
              z,
            ]}
          >
            <boxGeometry
              args={[
                0.045,
                0.46,
                0.045,
              ]}
            />

            <meshStandardMaterial
              color="#353a37"
              metalness={0.32}
              roughness={0.5}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


export function CentralSafetyCell() {
  return (
    <group>
      {/* Floor */}

      <mesh
        position={[
          0,
          0.026,
          0,
        ]}
      >
        <boxGeometry
          args={[
            6,
            0.02,
            4.6,
          ]}
        />

        <meshStandardMaterial
          color="#a7aaa6"
          roughness={0.88}
        />
      </mesh>


      {/* Four graphite corner columns */}

      {[
        [-2.95, -2.25],
        [-2.95, 2.25],
        [2.95, -2.25],
        [2.95, 2.25],
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
              1.45,
              z,
            ]}
          >
            <boxGeometry
              args={[
                0.1,
                2.9,
                0.1,
              ]}
            />

            <meshStandardMaterial
              color="#3d4440"
              metalness={0.4}
              roughness={0.46}
            />
          </mesh>
        ),
      )}


      {/* Side glass */}

      {[
        -2.92,
        2.92,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              1.45,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.045,
                2.8,
                4.35,
              ]}
            />

            <meshStandardMaterial
              color="#d2dddd"
              transparent
              opacity={0.22}
              roughness={0.12}
            />
          </mesh>
        ),
      )}


      {/* Rear wall glass */}

      <mesh
        position={[
          0,
          1.45,
          -2.22,
        ]}
      >
        <boxGeometry
          args={[
            5.8,
            2.8,
            0.045,
          ]}
        />

        <meshStandardMaterial
          color="#d2dddd"
          transparent
          opacity={0.22}
          roughness={0.12}
        />
      </mesh>


      {/* Front glass — central door gap */}

      {[
        -1.85,
        1.85,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              1.45,
              2.22,
            ]}
          >
            <boxGeometry
              args={[
                2.05,
                2.8,
                0.045,
              ]}
            />

            <meshStandardMaterial
              color="#d2dddd"
              transparent
              opacity={0.22}
              roughness={0.12}
            />
          </mesh>
        ),
      )}


      {/* Meeting room label */}

      <RoundedBox
        args={[
          4.8,
          0.56,
          0.1,
        ]}
        radius={0.06}
        smoothness={2}
        position={[
          0,
          2.56,
          2.3,
        ]}
      >
        <meshStandardMaterial
          color="#343a37"
          roughness={0.7}
        />
      </RoundedBox>


      <Text
        position={[
          0,
          2.56,
          2.36,
        ]}
        fontSize={0.29}
        color="#f3f3ed"
        anchorX="center"
        anchorY="middle"
      >
        SALLE DE RÉUNION UET
      </Text>


      {/* Round meeting table */}

      <mesh
        position={[
          0,
          0.78,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            1.15,
            1.15,
            0.14,
            28,
          ]}
        />

        <meshStandardMaterial
          color="#765a40"
          roughness={0.7}
        />
      </mesh>


      <mesh
        position={[
          0,
          0.39,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.18,
            0.34,
            0.78,
            14,
          ]}
        />

        <meshStandardMaterial
          color="#3c423e"
          metalness={0.36}
          roughness={0.48}
        />
      </mesh>


      <MeetingChair
        position={[
          0,
          0,
          1.55,
        ]}
        rotation={
          Math.PI
        }
      />


      <MeetingChair
        position={[
          0,
          0,
          -1.55,
        ]}
        rotation={0}
      />


      <MeetingChair
        position={[
          -1.55,
          0,
          0,
        ]}
        rotation={
          Math.PI / 2
        }
      />


      <MeetingChair
        position={[
          1.55,
          0,
          0,
        ]}
        rotation={
          -Math.PI / 2
        }
      />


      {/* Small production planning screen */}

      <group
        position={[
          0,
          1.55,
          -2.2,
        ]}
      >
        <RoundedBox
          args={[
            2.65,
            1.05,
            0.1,
          ]}
          radius={0.07}
          smoothness={2}
        >
          <meshStandardMaterial
            color="#2d332f"
            roughness={0.44}
          />
        </RoundedBox>


        <Text
          position={[
            0,
            0.28,
            0.06,
          ]}
          fontSize={0.21}
          color="#f1f1eb"
          anchorX="center"
          anchorY="middle"
        >
          POINT UET
        </Text>


        <Text
          position={[
            0,
            -0.05,
            0.06,
          ]}
          fontSize={0.18}
          color="#79a784"
          anchorX="center"
          anchorY="middle"
        >
          QUALITÉ 99%
        </Text>


        <Text
          position={[
            0,
            -0.31,
            0.06,
          ]}
          fontSize={0.16}
          color="#dedfd9"
          anchorX="center"
          anchorY="middle"
        >
          PRODUCTION • SÉCURITÉ • OBJECTIFS
        </Text>
      </group>
    </group>
  )
}