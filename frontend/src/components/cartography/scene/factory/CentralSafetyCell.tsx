import {
  Text,
} from '@react-three/drei'


function FireExtinguisher({
  x,
}: {
  x: number
}) {
  return (
    <group
      position={[
        x,
        0,
        0,
      ]}
    >
      <mesh
        position={[
          0,
          0.42,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.11,
            0.14,
            0.65,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#a63731"
          roughness={0.64}
        />
      </mesh>

      <mesh
        position={[
          0,
          0.78,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.05,
            0.07,
            0.14,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#353a37"
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}


export function CentralSafetyCell() {
  return (
    <group
      position={[
        0,
        0,
        4,
      ]}
    >
      {/* floor */}

      <mesh
        position={[
          0,
          0.025,
          0,
        ]}
      >
        <boxGeometry
          args={[
            5.4,
            0.02,
            3.4,
          ]}
        />

        <meshStandardMaterial
          color="#9da19d"
          roughness={0.88}
        />
      </mesh>


      {/* glass walls */}

      {[
        -2.65,
        2.65,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              1.35,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.06,
                2.7,
                3.3,
              ]}
            />

            <meshStandardMaterial
              color="#b8c7c6"
              transparent
              opacity={0.34}
              roughness={0.18}
            />
          </mesh>
        ),
      )}


      {[
        -1.65,
        1.65,
      ].map(
        (z) => (
          <mesh
            key={z}
            position={[
              0,
              1.35,
              z,
            ]}
          >
            <boxGeometry
              args={[
                5.25,
                2.7,
                0.06,
              ]}
            />

            <meshStandardMaterial
              color="#b8c7c6"
              transparent
              opacity={0.34}
              roughness={0.18}
            />
          </mesh>
        ),
      )}


      {/* frame */}

      {[
        [-2.65, -1.65],
        [-2.65, 1.65],
        [2.65, -1.65],
        [2.65, 1.65],
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
              1.4,
              z,
            ]}
          >
            <boxGeometry
              args={[
                0.1,
                2.8,
                0.1,
              ]}
            />

            <meshStandardMaterial
              color="#444a46"
              metalness={0.38}
              roughness={0.48}
            />
          </mesh>
        ),
      )}


      {/* KPI screen */}

      <group
        position={[
          0,
          1.55,
          -1.7,
        ]}
      >
        <mesh>
          <boxGeometry
            args={[
              3.4,
              1.35,
              0.12,
            ]}
          />

          <meshStandardMaterial
            color="#202623"
            roughness={0.44}
          />
        </mesh>

        <Text
          position={[
            0,
            0.42,
            -0.07,
          ]}
          rotation={[
            0,
            Math.PI,
            0,
          ]}
          fontSize={0.21}
          color="#eeeeea"
          anchorX="center"
          anchorY="middle"
        >
          PERFORMANCE UET
        </Text>

        <Text
          position={[
            -0.9,
            0,
            -0.07,
          ]}
          rotation={[
            0,
            Math.PI,
            0,
          ]}
          fontSize={0.2}
          color="#6fa879"
          anchorX="center"
          anchorY="middle"
        >
          QUALITÉ 99%
        </Text>

        <Text
          position={[
            0.2,
            0,
            -0.07,
          ]}
          rotation={[
            0,
            Math.PI,
            0,
          ]}
          fontSize={0.2}
          color="#d0aa39"
          anchorX="center"
          anchorY="middle"
        >
          OBJECTIF 97%
        </Text>

        <Text
          position={[
            1.15,
            0,
            -0.07,
          ]}
          rotation={[
            0,
            Math.PI,
            0,
          ]}
          fontSize={0.2}
          color="#8eb39a"
          anchorX="center"
          anchorY="middle"
        >
          DISP. 96%
        </Text>
      </group>


      {/* emergency station */}

      <group
        position={[
          -3.3,
          0,
          0,
        ]}
      >
        <mesh
          position={[
            0,
            1.15,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.85,
              1.9,
              0.45,
            ]}
          />

          <meshStandardMaterial
            color="#9c3933"
            roughness={0.62}
          />
        </mesh>

        <Text
          position={[
            0,
            2.3,
            0,
          ]}
          rotation={[
            0,
            Math.PI / 2,
            0,
          ]}
          fontSize={0.22}
          color="#8f302b"
          anchorX="center"
          anchorY="middle"
        >
          INCENDIE
        </Text>

        <group
          position={[
            0,
            0,
            0.7,
          ]}
        >
          <FireExtinguisher
            x={-0.38}
          />

          <FireExtinguisher
            x={0}
          />

          <FireExtinguisher
            x={0.38}
          />
        </group>
      </group>


      <Text
        position={[
          0,
          0.055,
          2.15,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.34}
        color="#343936"
        anchorX="center"
        anchorY="middle"
      >
        SUPERVISION UET
      </Text>
    </group>
  )
}