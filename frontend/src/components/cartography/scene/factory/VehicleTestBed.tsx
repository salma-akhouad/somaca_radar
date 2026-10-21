export function VehicleTestBed() {
  return (
    <group
      position={[13, 0, -11]}
    >
      {/* Test platform */}
      <mesh
        position={[0, 0.09, 0]}
        receiveShadow
      >
        <boxGeometry args={[4.6, 0.18, 3.2]} />

        <meshStandardMaterial
          color="#777b76"
          metalness={0.18}
          roughness={0.68}
        />
      </mesh>


      {/* Yellow vehicle path through test area */}
      <mesh
        position={[0, 0.2, 0]}
      >
        <boxGeometry args={[4.5, 0.025, 1.35]} />

        <meshStandardMaterial
          color="#e1b31c"
          roughness={0.78}
        />
      </mesh>


      {/* Four roller/test modules */}
      {[
        [-1.2, -0.48],
        [-1.2, 0.48],
        [1.2, -0.48],
        [1.2, 0.48],
      ].map(([x, z], index) => (
        <group
          key={index}
          position={[x, 0.27, z]}
        >
          <mesh
            rotation-z={Math.PI / 2}
          >
            <cylinderGeometry args={[0.25, 0.25, 0.65, 18]} />

            <meshStandardMaterial
              color="#3e433f"
              metalness={0.45}
              roughness={0.45}
            />
          </mesh>
        </group>
      ))}


      {/* Test control cabinet */}
      <mesh
        position={[2.8, 0.75, -1.2]}
        castShadow
      >
        <boxGeometry args={[0.8, 1.5, 0.65]} />

        <meshStandardMaterial
          color="#565b57"
          roughness={0.65}
        />
      </mesh>


      {/* Screen */}
      <mesh
        position={[2.8, 1.0, -0.86]}
      >
        <boxGeometry args={[0.45, 0.3, 0.015]} />

        <meshStandardMaterial
          color="#d4e6dd"
          emissive="#7dac94"
          emissiveIntensity={0.55}
          roughness={0.25}
        />
      </mesh>
    </group>
  )
}