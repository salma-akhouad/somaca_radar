export function PostProductionRoad() {
  return (
    <group>
      {/* =====================================================
          SECTION 1
          Production exit → final control
          ===================================================== */}

      <mesh
        position={[
          21,
          0.045,
          -19,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            10,
            0.09,
            4.2,
          ]}
        />

        <meshStandardMaterial
          color="#606561"
          roughness={0.94}
        />
      </mesh>


      {/* =====================================================
          SECTION 2
          Validation route
          ===================================================== */}

      <mesh
        position={[
          31.5,
          0.045,
          -19,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            11,
            0.09,
            4.2,
          ]}
        />

        <meshStandardMaterial
          color="#606561"
          roughness={0.94}
        />
      </mesh>


      {/* =====================================================
          SMALL DIAGONAL TRANSITION

          Gives the road a natural industrial routing
          instead of looking like one giant ruler.
          ===================================================== */}

      <mesh
        position={[
          39,
          0.045,
          -18,
        ]}
        rotation-y={-0.18}
        receiveShadow
      >
        <boxGeometry
          args={[
            6,
            0.09,
            4.2,
          ]}
        />

        <meshStandardMaterial
          color="#606561"
          roughness={0.94}
        />
      </mesh>


      {/* =====================================================
          PARKING APPROACH
          ===================================================== */}

      <mesh
        position={[
          44,
          0.045,
          -17,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            6,
            0.09,
            4.2,
          ]}
        />

        <meshStandardMaterial
          color="#606561"
          roughness={0.94}
        />
      </mesh>


      {/* Yellow guidance — first section */}
      <mesh
        position={[
          30,
          0.1,
          -19,
        ]}
      >
        <boxGeometry
          args={[
            27,
            0.025,
            0.1,
          ]}
        />

        <meshStandardMaterial
          color="#d9ad19"
        />
      </mesh>


      {/* Yellow guidance — parking approach */}
      <mesh
        position={[
          41.5,
          0.1,
          -17.55,
        ]}
        rotation-y={-0.18}
      >
        <boxGeometry
          args={[
            7,
            0.025,
            0.1,
          ]}
        />

        <meshStandardMaterial
          color="#d9ad19"
        />
      </mesh>
    </group>
  )
}