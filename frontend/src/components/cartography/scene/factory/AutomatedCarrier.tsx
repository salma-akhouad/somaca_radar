interface AutomatedCarrierProps { position: [number, number, number]; rotation?: number }

export function AutomatedCarrier({ position, rotation = 0 }: AutomatedCarrierProps) {
  return <group position={position} rotation-y={rotation}><mesh castShadow position={[0, .3, 0]}><boxGeometry args={[2.7, .42, 1.55]} /><meshStandardMaterial color="#3d413f" metalness={.35} roughness={.55} /></mesh><mesh castShadow position={[0, .59, 0]}><boxGeometry args={[2.1, .16, 1.05]} /><meshStandardMaterial color="#686c67" metalness={.3} roughness={.58} /></mesh>{[-.9, .9].map((x) => <mesh key={x} position={[x, .525, -.79]}><boxGeometry args={[.3, .12, .035]} /><meshStandardMaterial color="#d7a915" roughness={.72} /></mesh>)}{[-.95, .95].flatMap((x) => [-.55, .55].map((z) => <mesh key={`${x}-${z}`} castShadow position={[x, .12, z]} rotation-z={Math.PI / 2}><cylinderGeometry args={[.17, .17, .12, 12]} /><meshStandardMaterial color="#282b29" roughness={.72} /></mesh>))}</group>
}
