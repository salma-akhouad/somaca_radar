interface RestrictedZoneProps { position: [number, number, number]; width?: number; depth?: number }

export function RestrictedZone({ position, width = 4.8, depth = 3.1 }: RestrictedZoneProps) {
  const stripes = [-1.7, -1.1, -.5, .1, .7, 1.3, 1.9]
  return <group position={position}><mesh position={[0, .026, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[width, depth]} /><meshStandardMaterial color="#bb493e" transparent opacity={.12} roughness={.9} /></mesh>{stripes.map((x) => <mesh key={x} position={[x, .033, 0]} rotation={[0, -.58, 0]}><boxGeometry args={[.18, .008, depth * 1.25]} /><meshStandardMaterial color="#c84b3c" roughness={.85} /></mesh>)}<mesh position={[0, .035, -depth / 2]} rotation-x={-Math.PI / 2}><planeGeometry args={[width, .1]} /><meshStandardMaterial color="#c84b3c" /></mesh><mesh position={[0, .035, depth / 2]} rotation-x={-Math.PI / 2}><planeGeometry args={[width, .1]} /><meshStandardMaterial color="#c84b3c" /></mesh></group>
}
