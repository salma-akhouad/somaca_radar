interface RoadSectionProps {
  position: [
    number,
    number,
    number,
  ]

  length: number
  width?: number
  rotation?: number
}


function RoadSection({
  position,
  length,
  width = 4.4,
  rotation = 0,
}: RoadSectionProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* =====================================================
          ROAD SURFACE

          Very thin because this is a surface treatment on the
          factory floor, NOT another structural platform.
          ===================================================== */}

      <mesh
        position={[
          0,
          0.018,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            length,
            0.025,
            width,
          ]}
        />

        <meshStandardMaterial
          color="#555a57"
          roughness={0.96}
          metalness={0}
        />
      </mesh>


      {/* =====================================================
          SAFETY / ROUTE EDGES

          Two continuous yellow lines define the vehicle route.

          They deliberately sit near the edges rather than
          crossing through the centre of the road.
          ===================================================== */}

      {[
        -(width / 2 - 0.22),
        width / 2 - 0.22,
      ].map((z) => (
        <mesh
          key={z}
          position={[
            0,
            0.037,
            z,
          ]}
        >
          <boxGeometry
            args={[
              length - 0.15,
              0.012,
              0.085,
            ]}
          />

          <meshStandardMaterial
            color="#c89d18"
            roughness={0.72}
          />
        </mesh>
      ))}
    </group>
  )
}


export function PostProductionRoad() {
  return (
    <group>
      {/* =====================================================
          CONTINUOUS POST-PRODUCTION VEHICLE ROUTE

          Montage
             ↓
          Final control
             ↓
          Validation
             ↓
          Release
             ↓
          Finished vehicle parking

          Each section overlaps the next slightly so the eye
          reads ONE continuous industrial circulation route.
          ===================================================== */}


      {/* Production exit → final control */}
      <RoadSection
        position={[
          21.5,
          0,
          -19,
        ]}
        length={11}
      />


      {/* Final control → validation */}
      <RoadSection
        position={[
          31.5,
          0,
          -19,
        ]}
        length={10}
      />


      {/* =====================================================
          GENTLE ROUTE TRANSITION

          The route begins turning toward the finished vehicle
          release / parking side.

          A small rotation keeps it industrial and believable
          without making the trajectory unnecessarily complex.
          ===================================================== */}

      <RoadSection
        position={[
          39,
          0,
          -18.25,
        ]}
        length={6.5}
        rotation={-0.18}
      />


      {/* Parking approach */}
      <RoadSection
        position={[
          44.2,
          0,
          -17.25,
        ]}
        length={5.4}
      />
    </group>
  )
}