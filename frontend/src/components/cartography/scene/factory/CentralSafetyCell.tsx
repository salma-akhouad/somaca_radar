import {
  RoundedBox,
  Text,
} from '@react-three/drei'


export function CentralSafetyCell() {
  return (
    <group
      position={[
        0,
        0,
        0,
      ]}
    >
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
            5.8,
            0.02,
            4,
          ]}
        />

        <meshStandardMaterial
          color="#9ea29e"
          roughness={0.88}
        />
      </mesh>


      {/* Corner frame */}

      {[
        [-2.85, -1.95],
        [-2.85, 1.95],
        [2.85, -1.95],
        [2.85, 1.95],
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
                0.11,
                2.8,
                0.11,
              ]}
            />

            <meshStandardMaterial
              color="#3d4440"
              metalness={0.42}
              roughness={0.46}
            />
          </mesh>
        ),
      )}


      {/* Side glass */}

      {[
        -2.82,
        2.82,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              1.4,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.055,
                2.7,
                3.8,
              ]}
            />

            <meshStandardMaterial
              color="#c5d4d4"
              transparent
              opacity={0.3}
              roughness={0.16}
            />
          </mesh>
        ),
      )}


      {/* Rear glass */}

      <mesh
        position={[
          0,
          1.4,
          -1.92,
        ]}
      >
        <boxGeometry
          args={[
            5.65,
            2.7,
            0.055,
          ]}
        />

        <meshStandardMaterial
          color="#c5d4d4"
          transparent
          opacity={0.3}
          roughness={0.16}
        />
      </mesh>


      {/* Front glass with a visible entrance gap */}

      <mesh
        position={[
          -1.55,
          1.4,
          1.92,
        ]}
      >
        <boxGeometry
          args={[
            2.55,
            2.7,
            0.055,
          ]}
        />

        <meshStandardMaterial
          color="#c5d4d4"
          transparent
          opacity={0.3}
          roughness={0.16}
        />
      </mesh>


      <mesh
        position={[
          1.55,
          1.4,
          1.92,
        ]}
      >
        <boxGeometry
          args={[
            2.55,
            2.7,
            0.055,
          ]}
        />

        <meshStandardMaterial
          color="#c5d4d4"
          transparent
          opacity={0.3}
          roughness={0.16}
        />
      </mesh>


      {/* Strong readable room sign */}

      <RoundedBox
        args={[
          4.3,
          0.58,
          0.09,
        ]}
        radius={0.06}
        smoothness={2}
        position={[
          0,
          2.48,
          1.98,
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
          2.48,
          2.04,
        ]}
        fontSize={0.31}
        color="#f3f3ed"
        anchorX="center"
        anchorY="middle"
      >
        SUPERVISION UET
      </Text>


      {/* KPI display */}

      <group
        position={[
          0,
          1.62,
          -1.9,
        ]}
      >
        <RoundedBox
          args={[
            3.9,
            1.45,
            0.12,
          ]}
          radius={0.08}
          smoothness={2}
        >
          <meshStandardMaterial
            color="#202522"
            roughness={0.42}
          />
        </RoundedBox>


        <Text
          position={[
            0,
            0.44,
            0.07,
          ]}
          fontSize={0.22}
          color="#f1f1eb"
          anchorX="center"
          anchorY="middle"
        >
          PERFORMANCE PRODUCTION
        </Text>


        <Text
          position={[
            -1.15,
            0.02,
            0.07,
          ]}
          fontSize={0.2}
          color="#76aa7f"
          anchorX="center"
          anchorY="middle"
        >
          QUALITÉ 99%
        </Text>


        <Text
          position={[
            0,
            0.02,
            0.07,
          ]}
          fontSize={0.2}
          color="#d1aa34"
          anchorX="center"
          anchorY="middle"
        >
          OBJECTIF 97%
        </Text>


        <Text
          position={[
            1.2,
            0.02,
            0.07,
          ]}
          fontSize={0.2}
          color="#79a784"
          anchorX="center"
          anchorY="middle"
        >
          DISP. 96%
        </Text>


        <Text
          position={[
            0,
            -0.4,
            0.07,
          ]}
          fontSize={0.18}
          color="#dedfd9"
          anchorX="center"
          anchorY="middle"
        >
          PRODUCTION — OBJECTIFS TENUS
        </Text>
      </group>


      {/* Monitoring console */}

      <group
        position={[
          0,
          0,
          0.45,
        ]}
      >
        <RoundedBox
          args={[
            2.8,
            0.18,
            0.95,
          ]}
          radius={0.06}
          smoothness={2}
          position={[
            0,
            0.88,
            0,
          ]}
        >
          <meshStandardMaterial
            color="#505652"
            metalness={0.18}
            roughness={0.62}
          />
        </RoundedBox>


        {[
          -1.05,
          1.05,
        ].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                0.43,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.08,
                  0.86,
                  0.08,
                ]}
              />

              <meshStandardMaterial
                color="#3d4340"
                metalness={0.38}
                roughness={0.48}
              />
            </mesh>
          ),
        )}


        {[
          -0.65,
          0.65,
        ].map(
          (x) => (
            <group
              key={x}
              position={[
                x,
                1.28,
                0,
              ]}
            >
              <RoundedBox
                args={[
                  0.92,
                  0.58,
                  0.09,
                ]}
                radius={0.05}
                smoothness={2}
              >
                <meshStandardMaterial
                  color="#252b28"
                  roughness={0.48}
                />
              </RoundedBox>


              <mesh
                position={[
                  0,
                  0,
                  0.055,
                ]}
              >
                <boxGeometry
                  args={[
                    0.72,
                    0.4,
                    0.015,
                  ]}
                />

                <meshStandardMaterial
                  color="#8da59b"
                  emissive="#586e64"
                  emissiveIntensity={0.34}
                  roughness={0.3}
                />
              </mesh>
            </group>
          ),
        )}
      </group>


      {/* Small wall cabinet */}

      <RoundedBox
        args={[
          0.8,
          1.35,
          0.42,
        ]}
        radius={0.06}
        smoothness={2}
        position={[
          2.18,
          0.75,
          -1.55,
        ]}
      >
        <meshStandardMaterial
          color="#676d69"
          metalness={0.12}
          roughness={0.66}
        />
      </RoundedBox>
    </group>
  )
}