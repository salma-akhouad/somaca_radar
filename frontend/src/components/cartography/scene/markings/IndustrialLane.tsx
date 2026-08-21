interface IndustrialLaneProps {
  position: [number, number, number]
  length?: number
  width?: number
  rotation?: number
  corner?: boolean
}

export function IndustrialLane({ position, length = 18, width = 1.1, rotation = 0, corner = false }: IndustrialLaneProps) {
  if (corner) {
    const radius = length
    return <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} receiveShadow><ringGeometry args={[radius - width / 2, radius + width / 2, 32, 1, Math.PI, Math.PI / 2]} /><meshStandardMaterial color="#e8b51b" roughness={.78} metalness={0} /></mesh>
  }

  return <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} receiveShadow><planeGeometry args={[length, width]} /><meshStandardMaterial color="#e8b51b" roughness={.78} metalness={0} /></mesh>
}
