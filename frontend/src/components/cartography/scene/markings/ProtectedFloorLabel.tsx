import {
  Text,
} from '@react-three/drei'


interface ProtectedFloorLabelProps {
  position: [
    number,
    number,
    number,
  ]

  text: string

  width?: number

  depth?: number

  fontSize?: number
}


export function ProtectedFloorLabel({
  position,
  text,
  width = 4,
  depth = 0.78,
  fontSize = 0.32,
}: ProtectedFloorLabelProps) {
  return (
    <group
      position={position}
    >
      <mesh
        position={[
          0,
          0.052,
          0,
        ]}
      >
        <boxGeometry
          args={[
            width,
            0.022,
            depth,
          ]}
        />

        <meshStandardMaterial
          color="#353a37"
          roughness={0.82}
        />
      </mesh>


      <Text
        position={[
          0,
          0.078,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={
          fontSize
        }
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  )
}