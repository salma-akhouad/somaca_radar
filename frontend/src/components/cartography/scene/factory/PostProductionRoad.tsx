function RoadSurface({
  position,
  size,
}: {
  position: [
    number,
    number,
    number,
  ]

  size: [
    number,
    number,
  ]
}) {
  return (
    <mesh
      position={position}
      receiveShadow
    >
      <boxGeometry
        args={[
          size[0],
          0.018,
          size[1],
        ]}
      />

      <meshStandardMaterial
        color="#484d49"
        roughness={0.96}
        metalness={0}
      />
    </mesh>
  )
}


function Marking({
  position,
  size,
}: {
  position: [
    number,
    number,
    number,
  ]

  size: [
    number,
    number,
  ]
}) {
  return (
    <mesh
      position={position}
    >
      <boxGeometry
        args={[
          size[0],
          0.012,
          size[1],
        ]}
      />

      <meshStandardMaterial
        color="#c49a25"
        roughness={0.78}
      />
    </mesh>
  )
}


export function PostProductionRoad() {
  return (
    <group>
      {/* U exit */}

      <RoadSurface
        position={[
          17,
          0.012,
          -15.75,
        ]}
        size={[
          4.4,
          6.5,
        ]}
      />

      {/* Main post-production corridor */}

      <RoadSurface
        position={[
          29.1,
          0.013,
          -19,
        ]}
        size={[
          24.2,
          4.4,
        ]}
      />


      {/* U-exit edges stop before the corner */}

      <Marking
        position={[
          14.82,
          0.029,
          -14.7,
        ]}
        size={[
          0.075,
          4.4,
        ]}
      />

      <Marking
        position={[
          19.18,
          0.029,
          -14.7,
        ]}
        size={[
          0.075,
          4.4,
        ]}
      />


      {/* One continuous pair of road edges */}

      <Marking
        position={[
          30.2,
          0.03,
          -16.82,
        ]}
        size={[
          21.8,
          0.075,
        ]}
      />

      <Marking
        position={[
          30.2,
          0.03,
          -21.18,
        ]}
        size={[
          21.8,
          0.075,
        ]}
      />
    </group>
  )
}