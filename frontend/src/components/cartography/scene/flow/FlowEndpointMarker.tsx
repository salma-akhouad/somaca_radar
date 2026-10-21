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
            3.8,
            1.65,
          ]}
        />

        <meshStandardMaterial
          color="#343a37"
          roughness={0.8}
        />
      </mesh>

      {[
        -0.75,
        0.75,
      ].map(
        (z) => (
          <mesh
            key={z}
            position={[
              0,
              0.066,
              z,
            ]}
          >
            <boxGeometry
              args={[
                3.65,
                0.026,
                0.075,
              ]}
            />

            <meshStandardMaterial
              color="#d0a62c"
              roughness={0.7}
            />
          </mesh>
        ),
      )}

      <Text
        position={[
          0,
          0.085,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.62}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.018}
        outlineColor="#202522"
      >
        {label}
      </Text>
    </group>
  )
}