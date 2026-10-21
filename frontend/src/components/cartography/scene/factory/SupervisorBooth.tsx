import {
  Text,
} from '@react-three/drei'

import {
  useRef,
} from 'react'

import {
  useFrame,
} from '@react-three/fiber'

import type {
  Group,
} from 'three'

import {
  SupervisorWorkstation,
} from './SupervisorWorkstation'

import {
  managerNeedsDoorOpen,
} from './data/managerInspection'


interface SupervisorBoothProps {
  position: [
    number,
    number,
    number,
  ]

  rotation?: number
}


export function SupervisorBooth({
  position,
  rotation = 0,
}: SupervisorBoothProps) {
  const door =
    useRef<Group>(null)


  useFrame(
    (
      state,
      delta,
    ) => {
      if (
        !door.current
      ) {
        return
      }


      const shouldOpen =
        managerNeedsDoorOpen(
          state.clock.elapsedTime,
        )


      const target =
        shouldOpen
          ? -Math.PI / 2
          : 0


      const response =
        1 -
        Math.exp(
          -5 *
          delta,
        )


      door.current.rotation.y +=
        (
          target -
          door.current.rotation.y
        ) *
        response
    },
  )


  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* floor */}

      <mesh
        position={[
          0,
          0.04,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            5.8,
            0.08,
            4.8,
          ]}
        />

        <meshStandardMaterial
          color="#aeb0aa"
          roughness={0.92}
        />
      </mesh>


      {/* rear wall */}

      <mesh
        position={[
          0,
          1.4,
          -2.35,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            5.8,
            2.8,
            0.14,
          ]}
        />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* left wall */}

      <mesh
        position={[
          -2.83,
          1.4,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.14,
            2.8,
            4.7,
          ]}
        />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* front wall */}

      <mesh
        position={[
          0,
          1.4,
          2.35,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            5.8,
            2.8,
            0.14,
          ]}
        />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* right wall upper section */}

      <mesh
        position={[
          2.83,
          1.4,
          -1.55,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.14,
            2.8,
            1.55,
          ]}
        />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* right wall lower section */}

      <mesh
        position={[
          2.83,
          1.4,
          1.55,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.14,
            2.8,
            1.55,
          ]}
        />

        <meshStandardMaterial
          color="#d4d5cf"
          roughness={0.88}
        />
      </mesh>


      {/* =====================================================
          ANIMATED DOOR
          ===================================================== */}

      <group
        ref={door}
        position={[
          2.78,
          0,
          -0.52,
        ]}
      >
        <mesh
          position={[
            0,
            1.05,
            0.52,
          ]}
          rotation-y={
            Math.PI / 2
          }
          castShadow
        >
          <boxGeometry
            args={[
              1.05,
              2.1,
              0.08,
            ]}
          />

          <meshStandardMaterial
            color="#404441"
            roughness={0.7}
          />
        </mesh>


        {/* door handle */}

        <mesh
          position={[
            -0.03,
            1.05,
            0.19,
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
            color="#c4c5bf"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>


      {/* office title */}

      <Text
        position={[
          0.7,
          1.42,
          2.435,
        ]}
        fontSize={0.28}
        color="#252826"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.6}
      >
        BUREAU DE PRODUCTION
      </Text>


      <mesh
        position={[
          0.7,
          1.13,
          2.43,
        ]}
      >
        <boxGeometry
          args={[
            1.45,
            0.045,
            0.03,
          ]}
        />

        <meshStandardMaterial
          color="#d5a917"
        />
      </mesh>


      {/* workstation */}

      <group
        position={[
          -0.75,
          0.08,
          0.55,
        ]}
        scale={[
          0.5,
          0.5,
          0.5,
        ]}
      >
        <SupervisorWorkstation
          position={[
            0,
            0,
            0,
          ]}
          rotation={0}
        />
      </group>


      {/* shelf */}

      <group
        position={[
          1.65,
          0,
          -1.65,
        ]}
      >
        <mesh
          position={[
            0,
            1.05,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              1.25,
              2.1,
              0.5,
            ]}
          />

          <meshStandardMaterial
            color="#737770"
            roughness={0.72}
            metalness={0.12}
          />
        </mesh>


        {[
          -0.45,
          0.05,
          0.55,
        ].map(
          (y) => (
            <mesh
              key={y}
              position={[
                0,
                1.05 +
                  y,
                0.27,
              ]}
            >
              <boxGeometry
                args={[
                  1.05,
                  0.04,
                  0.04,
                ]}
              />

              <meshStandardMaterial
                color="#414542"
                roughness={0.7}
              />
            </mesh>
          ),
        )}


        {[
          -0.38,
          -0.12,
          0.14,
          0.4,
        ].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                1.35,
                0.28,
              ]}
            >
              <boxGeometry
                args={[
                  0.17,
                  0.42,
                  0.08,
                ]}
              />

              <meshStandardMaterial
                color="#48544d"
                roughness={0.76}
              />
            </mesh>
          ),
        )}
      </group>


      {/* printer */}

      <group
        position={[
          -2,
          0,
          -1.5,
        ]}
      >
        <mesh
          position={[
            0,
            0.48,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.78,
              0.96,
              0.68,
            ]}
          />

          <meshStandardMaterial
            color="#656966"
            roughness={0.7}
          />
        </mesh>

        <mesh
          position={[
            0,
            1.03,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.65,
              0.18,
              0.54,
            ]}
          />

          <meshStandardMaterial
            color="#343735"
            roughness={0.65}
          />
        </mesh>

        <mesh
          position={[
            0,
            1.13,
            0.05,
          ]}
        >
          <boxGeometry
            args={[
              0.42,
              0.025,
              0.24,
            ]}
          />

          <meshStandardMaterial
            color="#d8d8d2"
            roughness={0.8}
          />
        </mesh>
      </group>


      {/* information board */}

      <mesh
        position={[
          -0.55,
          1.78,
          -2.27,
        ]}
      >
        <boxGeometry
          args={[
            2.05,
            1.05,
            0.05,
          ]}
        />

        <meshStandardMaterial
          color="#ddd9cf"
          roughness={0.82}
        />
      </mesh>

      <mesh
        position={[
          -0.55,
          1.78,
          -2.235,
        ]}
      >
        <boxGeometry
          args={[
            2.18,
            1.16,
            0.025,
          ]}
        />

        <meshStandardMaterial
          color="#777b76"
          roughness={0.68}
          metalness={0.18}
        />
      </mesh>


      {[
        [-1.1, 1.98],
        [-0.65, 1.98],
        [-0.2, 1.98],
        [-1.1, 1.68],
        [-0.65, 1.68],
        [-0.2, 1.68],
      ].map(
        (
          [
            x,
            y,
          ],
          index,
        ) => (
          <mesh
            key={index}
            position={[
              x,
              y,
              -2.205,
            ]}
          >
            <boxGeometry
              args={[
                0.22,
                0.035,
                0.015,
              ]}
            />

            <meshStandardMaterial
              color={
                index %
                  3 ===
                0
                  ? '#d5a917'
                  : '#868b86'
              }
            />
          </mesh>
        ),
      )}


      {/* clock */}

      <mesh
        position={[
          1.7,
          2.05,
          -2.24,
        ]}
      >
        <cylinderGeometry
          args={[
            0.35,
            0.35,
            0.06,
            24,
          ]}
        />

        <meshStandardMaterial
          color="#f0efe9"
          roughness={0.7}
        />
      </mesh>

      <mesh
        position={[
          1.7,
          2.05,
          -2.205,
        ]}
      >
        <torusGeometry
          args={[
            0.32,
            0.035,
            8,
            24,
          ]}
        />

        <meshStandardMaterial
          color="#4b4f4b"
          roughness={0.65}
        />
      </mesh>


      {/* safety notice */}

      <group
        position={[
          -2.74,
          1.55,
          0.6,
        ]}
      >
        <mesh
          rotation-y={
            Math.PI / 2
          }
        >
          <boxGeometry
            args={[
              0.85,
              1,
              0.035,
            ]}
          />

          <meshStandardMaterial
            color="#eee9dc"
            roughness={0.85}
          />
        </mesh>

        <mesh
          position={[
            -0.022,
            0.32,
            0,
          ]}
          rotation-y={
            Math.PI / 2
          }
        >
          <boxGeometry
            args={[
              0.55,
              0.14,
              0.012,
            ]}
          />

          <meshStandardMaterial
            color="#d5a917"
          />
        </mesh>
      </group>


      {/* plant */}

      <mesh
        position={[
          -2.2,
          0.3,
          1.55,
        ]}
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


      <mesh
        position={[
          -2.2,
          0.85,
          1.55,
        ]}
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


      {[
        [-0.22, 1.05, 0],
        [0.2, 1.15, 0.05],
        [-0.17, 1.32, -0.05],
        [0.16, 1.45, 0],
      ].map(
        (
          [
            x,
            y,
            z,
          ],
          index,
        ) => (
          <mesh
            key={index}
            position={[
              -2.2 +
                x,
              y,
              1.55 +
                z,
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


      {/* entrance threshold */}

      <mesh
        position={[
          2.87,
          0.04,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.08,
            0.02,
            1.35,
          ]}
        />

        <meshStandardMaterial
          color="#d5a917"
        />
      </mesh>
    </group>
  )
}