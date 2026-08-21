interface PartsTrolleyProps { position: [number, number, number]; rotation?: number }

function Wheel({ position }: { position: [number, number, number] }) {
  return <mesh castShadow position={position} rotation-z={Math.PI / 2}><cylinderGeometry args={[.24, .24, .14, 14]} /><meshStandardMaterial color="#343735" roughness={.76} /></mesh>
}

export function PartsTrolley({ position, rotation = 0 }: PartsTrolleyProps) {
  return <group position={position} rotation-y={rotation}><mesh castShadow position={[0, .55, 0]}><boxGeometry args={[2.15, .14, 1.25]} /><meshStandardMaterial color="#555955" metalness={.35} roughness={.58} /></mesh><mesh castShadow position={[0, 1.25, 0]}><boxGeometry args={[1.9, 1.2, 1.02]} /><meshStandardMaterial color="#737770" metalness={.28} roughness={.66} /></mesh><mesh position={[0, 1.63, .52]}><boxGeometry args={[1.55, .5, .03]} /><meshStandardMaterial color="#424642" /></mesh><mesh position={[0, .67, -.66]}><boxGeometry args={[1.75, .08, .08]} /><meshStandardMaterial color="#d2a515" /></mesh><mesh castShadow position={[1.05, 1.44, 0]}><boxGeometry args={[.08, 1.7, .08]} /><meshStandardMaterial color="#5d615c" metalness={.45} roughness={.48} /></mesh><Wheel position={[-.8, .25, -.54]} /><Wheel position={[.8, .25, -.54]} /><Wheel position={[-.8, .25, .54]} /><Wheel position={[.8, .25, .54]} /></group>
}
