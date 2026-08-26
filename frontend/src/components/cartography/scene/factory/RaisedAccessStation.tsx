export function RaisedAccessStation() {
  return (
    <group
      position={[-7.8, 0, 5]}
    >
      {/* Main work platform */}
      <mesh
        position={[0, 0.18, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[4.3, 0.36, 3.1]} />

        <meshStandardMaterial
          color="#8f928d"
          metalness={0.12}
          roughness={0.72}
        />
      </mesh>


      {/* Yellow safety perimeter */}
      <mesh
        position={[0, 0.38, 1.48]}
      >
        <boxGeometry args={[4.2, 0.06, 0.08]} />

        <meshStandardMaterial color="#e1b31c" />
      </mesh>


      {/* LEFT STAIRS */}
      {[0, 1, 2].map((step) => (
        <mesh
          key={`left-${step}`}
          position={[
            -2.45 - step * 0.28,
            0.06 + step * 0.09,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.55,
              0.12 + step * 0.06,
              1.35,
            ]}
          />

          <meshStandardMaterial
            color="#777b76"
            roughness={0.7}
          />
        </mesh>
      ))}


      {/* RIGHT STAIRS */}
      {[0, 1, 2].map((step) => (
        <mesh
          key={`right-${step}`}
          position={[
            2.45 + step * 0.28,
            0.06 + step * 0.09,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.55,
              0.12 + step * 0.06,
              1.35,
            ]}
          />

          <meshStandardMaterial
            color="#777b76"
            roughness={0.7}
          />
        </mesh>
      ))}


      {/* Tool cabinets */}
      <mesh
        position={[-1.45, 0.75, -1.8]}
        castShadow
      >
        <boxGeometry args={[0.9, 1.5, 0.65]} />

        <meshStandardMaterial
          color="#555a56"
          roughness={0.65}
        />
      </mesh>

      <mesh
        position={[1.45, 0.75, -1.8]}
        castShadow
      >
        <boxGeometry args={[0.9, 1.5, 0.65]} />

        <meshStandardMaterial
          color="#555a56"
          roughness={0.65}
        />
      </mesh>
    </group>
  )
}