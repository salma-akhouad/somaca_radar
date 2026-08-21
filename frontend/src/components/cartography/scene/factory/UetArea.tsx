import { Html } from '@react-three/drei'

interface UetAreaProps { position: [number, number, number]; width?: number; depth?: number }

export function UetArea({ position, width = 8, depth = 6 }: UetAreaProps) {
  const edgeMaterial = '#d5a917'
  return <group position={position}><mesh position={[0, .018, 0]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[width, depth]} /><meshStandardMaterial color="#cfd0ca" roughness={.92} metalness={.02} /></mesh><mesh position={[0, .032, -depth / 2]}><boxGeometry args={[width, .014, .11]} /><meshStandardMaterial color={edgeMaterial} /></mesh><mesh position={[0, .032, depth / 2]}><boxGeometry args={[width, .014, .11]} /><meshStandardMaterial color={edgeMaterial} /></mesh><mesh position={[-width / 2, .032, 0]}><boxGeometry args={[.11, .014, depth]} /><meshStandardMaterial color={edgeMaterial} /></mesh><mesh position={[width / 2, .032, 0]}><boxGeometry args={[.11, .014, depth]} /><meshStandardMaterial color={edgeMaterial} /></mesh><Html position={[0, .11, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}><div className="uet-area-label">UET — EXEMPLE</div></Html></group>
}
