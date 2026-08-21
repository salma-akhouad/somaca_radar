interface VehicleFlowMarkerProps { position: [number, number, number]; rotation?: number }

export function VehicleFlowMarker({ position, rotation = 0 }: VehicleFlowMarkerProps) {
  return <group position={position} rotation-y={rotation}><mesh position={[0, .045, -.12]} rotation-x={-Math.PI / 2}><planeGeometry args={[.48, 1.25]} /><meshStandardMaterial color="#f4c329" roughness={.78} /></mesh><mesh position={[0, .047, .72]} rotation={[-Math.PI / 2, 0, 0]}><coneGeometry args={[.48, .88, 3]} /><meshStandardMaterial color="#f4c329" roughness={.78} /></mesh></group>
}
