import {
  RoundedBox,
  Text,
} from '@react-three/drei'


export const BREAK_AREA_POSITION = [
  55,
  0,
  31,
] as const


function Chair({
  position,
  rotation = 0,
}: {
  position: [
    number,
    number,
    number,
  ]

  rotation?: number
}) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      <RoundedBox
        args={[
          0.58,
          0.1,
          0.58,
        ]}
        radius={0.05}
        smoothness={2}
        position={[
          0,
          0.48,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#5b615e"
          roughness={0.76}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          0.9,
          -0.25,
        ]}
      >
        <boxGeometry
          args={[
            0.58,
            0.74,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color="#555b58"
          roughness={0.76}
        />
      </mesh>

      {[
        [-0.22, -0.22],
        [-0.22, 0.22],
        [0.22, -0.22],
        [0.22, 0.22],
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
                0.05,
                0.46,
                0.05,
              ]}
            />

            <meshStandardMaterial
              color="#3d4340"
              metalness={0.34}
              roughness={0.48}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function BreakTable({
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
          2.3,
          0.12,
          1.15,
        ]}
        radius={0.06}
        smoothness={2}
        position={[
          0,
          0.78,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#9a9e9a"
          roughness={0.75}
        />
      </RoundedBox>

      {[
        [-0.9, -0.4],
        [-0.9, 0.4],
        [0.9, -0.4],
        [0.9, 0.4],
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
              0.38,
              z,
            ]}
          >
            <boxGeometry
              args={[
                0.07,
                0.76,
                0.07,
              ]}
            />

            <meshStandardMaterial
              color="#454b47"
              metalness={0.38}
              roughness={0.48}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function Tray() {
  return (
    <group
      position={[
        0,
        0.87,
        0,
      ]}
    >
      <RoundedBox
        args={[
          0.92,
          0.045,
          0.55,
        ]}
        radius={0.05}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#444a46"
          roughness={0.62}
        />
      </RoundedBox>

      <mesh
        position={[
          -0.2,
          0.17,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.07,
            0.08,
            0.32,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#b7c1bf"
          transparent
          opacity={0.8}
        />
      </mesh>

      {[
        0.08,
        0.3,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              0.1,
              0,
            ]}
          >
            <cylinderGeometry
              args={[
                0.065,
                0.055,
                0.18,
                10,
              ]}
            />

            <meshStandardMaterial
              color="#cbd0ce"
              transparent
              opacity={0.62}
            />
          </mesh>
        ),
      )}
    </group>
  )
}


function ToiletDoor({
  position,
  label,
}: {
  position: [
    number,
    number,
    number,
  ]

  label: string
}) {
  return (
    <group position={position}>
      <mesh
        position={[
          0,
          1.15,
          0,
        ]}
      >
        <boxGeometry
          args={[
            1.35,
            2.3,
            0.12,
          ]}
        />

        <meshStandardMaterial
          color="#626864"
          roughness={0.7}
        />
      </mesh>

      <Text
        position={[
          0,
          1.25,
          -0.07,
        ]}
        rotation={[
          0,
          Math.PI,
          0,
        ]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}


export function WorkerAmenities() {
  return (
    <group
      position={
        BREAK_AREA_POSITION
      }
    >
      <mesh
        position={[
          0,
          0.025,
          0,
        ]}
      >
        <boxGeometry
          args={[
            12,
            0.02,
            8,
          ]}
        />

        <meshStandardMaterial
          color="#a9aca7"
          roughness={0.92}
        />
      </mesh>


      <Text
        position={[
          -1.4,
          0.055,
          -3.25,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.42}
        color="#343936"
        anchorX="center"
        anchorY="middle"
      >
        ESPACE PAUSE
      </Text>


      <BreakTable
        position={[
          -2,
          0,
          -0.8,
        ]}
      />

      <group
        position={[
          -2,
          0,
          -0.8,
        ]}
      >
        <Tray />
      </group>


      <BreakTable
        position={[
          1.5,
          0,
          -0.8,
        ]}
      />


      <Chair
        position={[
          -3.5,
          0,
          -0.8,
        ]}
        rotation={
          -Math.PI / 2
        }
      />

      <Chair
        position={[
          -0.5,
          0,
          -0.8,
        ]}
        rotation={
          Math.PI / 2
        }
      />

      <Chair
        position={[
          0,
          0,
          -0.8,
        ]}
        rotation={
          -Math.PI / 2
        }
      />

      <Chair
        position={[
          3,
          0,
          -0.8,
        ]}
        rotation={
          Math.PI / 2
        }
      />


      <group
        position={[
          4.7,
          0,
          2.1,
        ]}
      >
        <ToiletDoor
          position={[
            -0.85,
            0,
            0,
          ]}
          label="FEMMES"
        />

        <ToiletDoor
          position={[
            0.85,
            0,
            0,
          ]}
          label="HOMMES"
        />
      </group>


      <group
        position={[
          -5,
          0,
          2.2,
        ]}
      >
        <mesh
          position={[
            0,
            0.9,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.72,
              1.8,
              0.65,
            ]}
          />

          <meshStandardMaterial
            color="#d1d3cf"
            roughness={0.72}
          />
        </mesh>

        <mesh
          position={[
            0,
            1.35,
            -0.34,
          ]}
        >
          <boxGeometry
            args={[
              0.42,
              0.24,
              0.02,
            ]}
          />

          <meshStandardMaterial
            color="#4c524e"
          />
        </mesh>

        <Text
          position={[
            0,
            0.055,
            1,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          fontSize={0.22}
          color="#4b504d"
          anchorX="center"
          anchorY="middle"
        >
          EAU
        </Text>
      </group>
    </group>
  )
}