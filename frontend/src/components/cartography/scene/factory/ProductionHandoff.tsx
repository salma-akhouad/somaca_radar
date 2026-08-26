import {
  Shape,
} from 'three'


const arrowShape = new Shape()

arrowShape.moveTo(-0.55, -0.12)
arrowShape.lineTo(0.12, -0.12)
arrowShape.lineTo(0.12, -0.3)
arrowShape.lineTo(0.62, 0)
arrowShape.lineTo(0.12, 0.3)
arrowShape.lineTo(0.12, 0.12)
arrowShape.lineTo(-0.55, 0.12)
arrowShape.closePath()


export function ProductionHandoff() {
  return (
    <group>
      {[-0.9, 0.9].map((x) => (
        <mesh
          key={x}
          position={[
            17 + x,
            0.041,
            -15.7,
          ]}
        >
          <boxGeometry
            args={[
              0.075,
              0.012,
              6.2,
            ]}
          />

          <meshStandardMaterial
            color="#b9932b"
            roughness={0.76}
          />
        </mesh>
      ))}


      <mesh
        position={[
          17,
          0.046,
          -15.5,
        ]}
        rotation-x={-Math.PI / 2}
        rotation-z={Math.PI / 2}
      >
        <shapeGeometry
          args={[arrowShape]}
        />

        <meshStandardMaterial
          color="#444a46"
          roughness={0.74}
        />
      </mesh>


      <mesh
        position={[
          17,
          0.046,
          -18,
        ]}
        rotation-x={-Math.PI / 2}
        rotation-z={Math.PI / 2}
      >
        <shapeGeometry
          args={[arrowShape]}
        />

        <meshStandardMaterial
          color="#444a46"
          roughness={0.74}
        />
      </mesh>


      <mesh
        position={[
          19.25,
          0.046,
          -19,
        ]}
        rotation-x={-Math.PI / 2}
      >
        <shapeGeometry
          args={[arrowShape]}
        />

        <meshStandardMaterial
          color="#444a46"
          roughness={0.74}
        />
      </mesh>
    </group>
  )
}