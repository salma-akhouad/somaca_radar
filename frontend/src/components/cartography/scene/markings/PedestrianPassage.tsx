interface PedestrianPassageProps { position: [number, number, number]; rotation?: number }

export function PedestrianPassage({ position, rotation = 0 }: PedestrianPassageProps) {
  const stripes = [-1.35, -.81, -.27, .27, .81, 1.35]
  return <group position={position} rotation-y={rotation}><mesh position={[0, .027, -1.82]} rotation-x={-Math.PI / 2}><planeGeometry args={[3.8, .11]} /><meshStandardMaterial color="#e8b51b" roughness={.82} /></mesh><mesh position={[0, .027, 1.82]} rotation-x={-Math.PI / 2}><planeGeometry args={[3.8, .11]} /><meshStandardMaterial color="#e8b51b" roughness={.82} /></mesh>{stripes.map((z) => <mesh key={z} position={[0, .03, z]} rotation-x={-Math.PI / 2}><planeGeometry args={[3.5, .28]} /><meshStandardMaterial color="#f3f1e8" roughness={.92} /></mesh>)}</group>
}
