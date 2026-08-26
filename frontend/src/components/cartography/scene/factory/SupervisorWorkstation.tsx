interface SupervisorWorkstationProps {
  position: [number, number, number];
  rotation?: number;
}

function Chair({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.47, 0]}>
        <boxGeometry args={[0.72, 0.13, 0.72]} />
        <meshStandardMaterial color="#555954" roughness={0.8} />
      </mesh>

      <mesh castShadow position={[0, 0.88, 0.28]}>
        <boxGeometry args={[0.72, 0.72, 0.11]} />
        <meshStandardMaterial color="#464a46" roughness={0.78} />
      </mesh>

      <mesh castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.45, 10]} />
        <meshStandardMaterial
          color="#70736e"
          metalness={0.5}
          roughness={0.48}
        />
      </mesh>

      <mesh castShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.38, 0.05, 0.06, 12]} />
        <meshStandardMaterial color="#4a4d4a" roughness={0.68} />
      </mesh>
    </group>
  );
}

export function SupervisorWorkstation({
  position,
  rotation = 0,
}: SupervisorWorkstationProps) {
  return (
    <group position={position} rotation-y={rotation}>
      {/* Desk */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[4.1, 0.16, 1.65]} />
        <meshStandardMaterial
          color="#4d504d"
          roughness={0.7}
          metalness={0.22}
        />
      </mesh>

      {/* Desk legs */}
      {[-1.65, 1.65].flatMap((x) =>
        [-0.58, 0.58].map((z) => (
          <mesh
            key={`${x}-${z}`}
            castShadow
            position={[x, 0.53, z]}
          >
            <boxGeometry args={[0.13, 1.05, 0.13]} />
            <meshStandardMaterial
              color="#646864"
              metalness={0.45}
              roughness={0.48}
            />
          </mesh>
        ))
      )}

      {/* LEFT MONITOR — dark casing */}
      <mesh castShadow position={[-0.75, 1.55, -0.22]}>
        <boxGeometry args={[0.9, 0.62, 0.1]} />
        <meshStandardMaterial color="#242725" roughness={0.52} />
      </mesh>

      {/* LEFT MONITOR — powered-on screen */}
      <mesh position={[-0.75, 1.55, -0.155]}>
        <boxGeometry args={[0.74, 0.45, 0.012]} />
        <meshStandardMaterial
          color="#d7e7df"
          emissive="#8fbea8"
          emissiveIntensity={0.75}
          roughness={0.28}
        />
      </mesh>

      {/* RIGHT MONITOR — dark casing */}
      <mesh castShadow position={[0.72, 1.55, -0.22]}>
        <boxGeometry args={[0.9, 0.62, 0.1]} />
        <meshStandardMaterial color="#242725" roughness={0.52} />
      </mesh>

      {/* RIGHT MONITOR — powered-on screen */}
      <mesh position={[0.72, 1.55, -0.155]}>
        <boxGeometry args={[0.74, 0.45, 0.012]} />
        <meshStandardMaterial
          color="#d7e7df"
          emissive="#8fbea8"
          emissiveIntensity={0.75}
          roughness={0.28}
        />
      </mesh>

      {/* Computer / workstation cabinet */}
      <mesh castShadow position={[2.55, 0.72, 0.15]}>
        <boxGeometry args={[0.82, 1.44, 1.2]} />
        <meshStandardMaterial
          color="#666a66"
          metalness={0.25}
          roughness={0.65}
        />
      </mesh>

      {/* Cabinet detail */}
      <mesh position={[2.55, 0.78, 0.77]}>
        <boxGeometry args={[0.58, 0.025, 0.01]} />
        <meshStandardMaterial color="#333633" />
      </mesh>

      {/* Chairs */}
      <Chair position={[-0.9, 0, 1.55]} />
      <Chair position={[0.9, 0, 1.55]} />
    </group>
  );
}