interface FactoryWorkerProps {
  position: [
    number,
    number,
    number,
  ]
  rotation?: number
}


export function FactoryWorker({
  position,
  rotation = 0,
}: FactoryWorkerProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* Legs */}
      {[-0.12, 0.12].map((x) => (
        <mesh
          key={x}
          position={[x, 0.42, 0]}
          castShadow
        >
          <cylinderGeometry
            args={[
              0.075,
              0.09,
              0.72,
              10,
            ]}
          />

          <meshStandardMaterial
            color="#343936"
            roughness={0.72}
          />
        </mesh>
      ))}

      {/* Safety shoes */}
      {[-0.12, 0.12].map((x) => (
        <mesh
          key={`shoe-${x}`}
          position={[x, 0.08, 0.06]}
          castShadow
        >
          <boxGeometry
            args={[0.16, 0.1, 0.27]}
          />

          <meshStandardMaterial
            color="#222624"
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* Torso */}
      <mesh
        position={[0, 1.08, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.23,
            0.29,
            0.7,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#49514d"
          roughness={0.66}
        />
      </mesh>

      {/* High-visibility vest */}
      <mesh
        position={[0, 1.12, 0.235]}
      >
        <boxGeometry
          args={[0.42, 0.5, 0.025]}
        />

        <meshStandardMaterial
          color="#c79b22"
          roughness={0.72}
        />
      </mesh>

      {/* Arms */}
      {[-0.34, 0.34].map((x) => (
        <mesh
          key={`arm-${x}`}
          position={[x, 1.08, 0]}
          rotation-z={
            x < 0
              ? -0.16
              : 0.16
          }
          castShadow
        >
          <cylinderGeometry
            args={[
              0.065,
              0.075,
              0.58,
              10,
            ]}
          />

          <meshStandardMaterial
            color="#535b56"
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Head */}
      <mesh
        position={[0, 1.63, 0]}
        castShadow
      >
        <sphereGeometry
          args={[0.17, 16, 12]}
        />

        <meshStandardMaterial
          color="#a77b61"
          roughness={0.82}
        />
      </mesh>

      {/* Hard hat */}
      <mesh
        position={[0, 1.82, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.19,
            0.19,
            0.09,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#d2a51f"
          roughness={0.58}
        />
      </mesh>

      <mesh
        position={[0, 1.78, 0.08]}
      >
        <boxGeometry
          args={[0.42, 0.045, 0.22]}
        />

        <meshStandardMaterial
          color="#d2a51f"
          roughness={0.58}
        />
      </mesh>
    </group>
  )
}