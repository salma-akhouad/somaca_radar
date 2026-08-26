import { Text } from '@react-three/drei'
import { SupervisorWorkstation } from './SupervisorWorkstation'

interface SupervisorBoothProps {
  position: [number, number, number]
  rotation?: number
}

export function SupervisorBooth({
  position,
  rotation = 0,
}: SupervisorBoothProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* =====================================================
          FLOOR
          Slightly darker than the factory floor so the room
          clearly reads as an enclosed office space.
          ===================================================== */}

      <mesh
        position={[0, 0.04, 0]}
        receiveShadow
      >
        <boxGeometry args={[5.8, 0.08, 4.8]} />

        <meshStandardMaterial
          color="#aeb0aa"
          roughness={0.92}
        />
      </mesh>


      {/* =====================================================
          WALLS
          Industrial warm light gray.
          ===================================================== */}

      {/* Back wall */}
      <mesh
        position={[0, 1.4, -2.35]}
        castShadow
      >
        <boxGeometry args={[5.8, 2.8, 0.14]} />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* Left wall */}
      <mesh
        position={[-2.83, 1.4, 0]}
        castShadow
      >
        <boxGeometry args={[0.14, 2.8, 4.7]} />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* Front wall */}
      <mesh
        position={[0, 1.4, 2.35]}
        castShadow
      >
        <boxGeometry args={[5.8, 2.8, 0.14]} />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* =====================================================
          RIGHT WALL WITH DOOR OPENING
          Door stays on the outer side of the room.
          ===================================================== */}

      {/* Right wall — back section */}
      <mesh
        position={[2.83, 1.4, -1.55]}
        castShadow
      >
        <boxGeometry args={[0.14, 2.8, 1.55]} />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* Right wall — front section */}
      <mesh
        position={[2.83, 1.4, 1.55]}
        castShadow
      >
        <boxGeometry args={[0.14, 2.8, 1.55]} />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* =====================================================
          DOOR
          ===================================================== */}

      <mesh
        position={[2.78, 1.05, 0]}
        rotation-y={Math.PI / 2}
        castShadow
      >
        <boxGeometry args={[1.05, 2.1, 0.08]} />

        <meshStandardMaterial
          color="#404441"
          roughness={0.7}
        />
      </mesh>


      {/* Door handle */}
      <mesh
        position={[2.72, 1.05, -0.33]}
      >
        <sphereGeometry args={[0.055, 10, 10]} />

        <meshStandardMaterial
          color="#c4c5bf"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>


      {/* =====================================================
          FRONT WALL IDENTITY
          Stable 3D text physically attached to the wall.
          ===================================================== */}

      <Text
        position={[0.7, 1.42, 2.435]}
        fontSize={0.28}
        color="#252826"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.6}
      >
        BUREAU DE PRODUCTION
      </Text>


      {/* Small industrial-yellow identity accent */}
      <mesh
        position={[0.7, 1.13, 2.43]}
      >
        <boxGeometry args={[1.45, 0.045, 0.03]} />

        <meshStandardMaterial
          color="#d5a917"
        />
      </mesh>


      {/* =====================================================
          WORKSTATION
          Kept away from the entrance.
          Clear path remains from the door into the room.
          ===================================================== */}

      <group
        position={[-0.75, 0.08, 0.55]}
        scale={[0.5, 0.5, 0.5]}
      >
        <SupervisorWorkstation
          position={[0, 0, 0]}
          rotation={0}
        />
      </group>


      {/* =====================================================
          DOCUMENT SHELF
          ===================================================== */}

      <group position={[1.65, 0, -1.65]}>
        <mesh
          position={[0, 1.05, 0]}
          castShadow
        >
          <boxGeometry args={[1.25, 2.1, 0.5]} />

          <meshStandardMaterial
            color="#737770"
            roughness={0.72}
            metalness={0.12}
          />
        </mesh>


        {/* Shelf separators */}
        {[-0.45, 0.05, 0.55].map((y) => (
          <mesh
            key={y}
            position={[0, 1.05 + y, 0.27]}
          >
            <boxGeometry args={[1.05, 0.04, 0.04]} />

            <meshStandardMaterial
              color="#414542"
              roughness={0.7}
            />
          </mesh>
        ))}


        {/* Document binders */}
        {[-0.38, -0.12, 0.14, 0.4].map((x) => (
          <mesh
            key={x}
            position={[x, 1.35, 0.28]}
          >
            <boxGeometry args={[0.17, 0.42, 0.08]} />

            <meshStandardMaterial
              color="#48544d"
              roughness={0.76}
            />
          </mesh>
        ))}
      </group>


      {/* =====================================================
          PRINTER / EQUIPMENT CABINET
          ===================================================== */}

      <group position={[-2.0, 0, -1.5]}>
        <mesh
          position={[0, 0.48, 0]}
          castShadow
        >
          <boxGeometry args={[0.78, 0.96, 0.68]} />

          <meshStandardMaterial
            color="#656966"
            roughness={0.7}
          />
        </mesh>


        <mesh
          position={[0, 1.03, 0]}
          castShadow
        >
          <boxGeometry args={[0.65, 0.18, 0.54]} />

          <meshStandardMaterial
            color="#343735"
            roughness={0.65}
          />
        </mesh>


        {/* Printer paper slot */}
        <mesh
          position={[0, 1.13, 0.05]}
        >
          <boxGeometry args={[0.42, 0.025, 0.24]} />

          <meshStandardMaterial
            color="#d8d8d2"
            roughness={0.8}
          />
        </mesh>
      </group>


      {/* =====================================================
          PRODUCTION INFORMATION BOARD
          ===================================================== */}

      <mesh
        position={[-0.55, 1.78, -2.27]}
      >
        <boxGeometry args={[2.05, 1.05, 0.05]} />

        <meshStandardMaterial
          color="#ddd9cf"
          roughness={0.82}
        />
      </mesh>


      {/* Board frame */}
      <mesh
        position={[-0.55, 1.78, -2.235]}
      >
        <boxGeometry args={[2.18, 1.16, 0.025]} />

        <meshStandardMaterial
          color="#777b76"
          roughness={0.68}
          metalness={0.18}
        />
      </mesh>


      {/* Board content */}
      {[
        [-1.1, 1.98],
        [-0.65, 1.98],
        [-0.2, 1.98],
        [-1.1, 1.68],
        [-0.65, 1.68],
        [-0.2, 1.68],
      ].map(([x, y], index) => (
        <mesh
          key={index}
          position={[x, y, -2.205]}
        >
          <boxGeometry args={[0.22, 0.035, 0.015]} />

          <meshStandardMaterial
            color={
              index % 3 === 0
                ? '#d5a917'
                : '#868b86'
            }
          />
        </mesh>
      ))}


      {/* =====================================================
          SMALL INDUSTRIAL WALL CLOCK
          ===================================================== */}

      <mesh
        position={[1.7, 2.05, -2.24]}
      >
        <cylinderGeometry
          args={[0.35, 0.35, 0.06, 24]}
        />

        <meshStandardMaterial
          color="#f0efe9"
          roughness={0.7}
        />
      </mesh>


      {/* Clock border */}
      <mesh
        position={[1.7, 2.05, -2.205]}
      >
        <torusGeometry
          args={[0.32, 0.035, 8, 24]}
        />

        <meshStandardMaterial
          color="#4b4f4b"
          roughness={0.65}
        />
      </mesh>


      {/* Clock hands */}
      <mesh
        position={[1.7, 2.12, -2.16]}
        rotation-z={0.3}
      >
        <boxGeometry args={[0.025, 0.2, 0.02]} />

        <meshStandardMaterial
          color="#333633"
        />
      </mesh>

      <mesh
        position={[1.78, 2.05, -2.155]}
        rotation-z={Math.PI / 2}
      >
        <boxGeometry args={[0.025, 0.16, 0.02]} />

        <meshStandardMaterial
          color="#333633"
        />
      </mesh>


      {/* =====================================================
          SAFETY / PROCEDURE NOTICE
          ===================================================== */}

      <group position={[-2.74, 1.55, 0.6]}>
        <mesh
          rotation-y={Math.PI / 2}
        >
          <boxGeometry args={[0.85, 1.0, 0.035]} />

          <meshStandardMaterial
            color="#eee9dc"
            roughness={0.85}
          />
        </mesh>


        {/* Yellow header */}
        <mesh
          position={[-0.022, 0.32, 0]}
          rotation-y={Math.PI / 2}
        >
          <boxGeometry args={[0.55, 0.14, 0.012]} />

          <meshStandardMaterial
            color="#d5a917"
          />
        </mesh>


        {/* Graphite information lines */}
        {[-0.02, -0.18, -0.34].map((y) => (
          <mesh
            key={y}
            position={[-0.023, y, 0]}
            rotation-y={Math.PI / 2}
          >
            <boxGeometry args={[0.44, 0.035, 0.012]} />

            <meshStandardMaterial
              color="#666a66"
            />
          </mesh>
        ))}
      </group>


      {/* =====================================================
          SMALL PLANT
          Softens the office without making it decorative.
          ===================================================== */}

      {/* Pot */}
      <mesh
        position={[-2.2, 0.3, 1.55]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.24,
            0.19,
            0.6,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#675f55"
          roughness={0.85}
        />
      </mesh>


      {/* Stem */}
      <mesh
        position={[-2.2, 0.85, 1.55]}
      >
        <cylinderGeometry
          args={[
            0.035,
            0.045,
            0.85,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#46603d"
          roughness={0.8}
        />
      </mesh>


      {/* Leaves */}
      {[
        [-0.22, 1.05, 0],
        [0.2, 1.15, 0.05],
        [-0.17, 1.32, -0.05],
        [0.16, 1.45, 0],
      ].map(
        ([x, y, z], index) => (
          <mesh
            key={index}
            position={[
              -2.2 + x,
              y,
              1.55 + z,
            ]}
            scale={[
              0.32,
              0.12,
              0.18,
            ]}
          >
            <sphereGeometry
              args={[
                1,
                10,
                8,
              ]}
            />

            <meshStandardMaterial
              color="#58724a"
              roughness={0.82}
            />
          </mesh>
        ),
      )}


      {/* =====================================================
          ENTRANCE SAFETY MARKING
          ===================================================== */}

      <mesh
        position={[2.87, 0.04, 0]}
      >
        <boxGeometry args={[0.08, 0.02, 1.35]} />

        <meshStandardMaterial
          color="#d5a917"
        />
      </mesh>
    </group>
  )
}