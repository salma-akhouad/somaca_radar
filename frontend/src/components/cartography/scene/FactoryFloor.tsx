export function FactoryFloor() {
  return <group>
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#d6d7d1" roughness={.88} metalness={.04} />
    </mesh>
    <gridHelper args={[60, 30, '#b6b7b1', '#cdcec8']} position={[0, .012, 0]} />
  </group>
}
