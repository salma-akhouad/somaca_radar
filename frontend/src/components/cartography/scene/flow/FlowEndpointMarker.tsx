import {
  Text,
} from '@react-three/drei'


interface FlowEndpointMarkerProps {
  position:
    [number, number, number]

  label:
    'ENTRÉE' | 'SORTIE'
}


export function FlowEndpointMarker({
  position,
  label,
}: FlowEndpointMarkerProps) {
  return (
    <group position={position}>
      {/* Graphite floor sign */}
      <mesh
        position={[
          0,
          0.05,
          0,
        ]}
        rotation-x={
          -Math.PI / 2
        }
      >
        <planeGeometry
          args={[
            3.1,
            1.4,
          ]}
        />

        <meshStandardMaterial
          color="#454946"
          roughness={0.76}
        />
      </mesh>


      {/* Yellow leading edge */}
      <mesh
        position={[
          0,
          0.065,
          -0.66,
        ]}
      >
        <boxGeometry
          args={[
            3.05,
            0.025,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color="#cda52d"
        />
      </mesh>


      <Text
        position={[
          0,
          0.075,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.46}
        color="#f7f5ed"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}