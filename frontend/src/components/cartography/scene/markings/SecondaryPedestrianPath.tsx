interface SecondaryPedestrianPathProps {
  position: [
    number,
    number,
    number,
  ]

  length: number

  width?: number

  rotation?: number

  yellowOuter?: boolean
}


export function SecondaryPedestrianPath({
  position,
  length,
  width = 1,
  rotation = 0,
  yellowOuter = false,
}: SecondaryPedestrianPathProps) {
  const halfWidth =
    width / 2


  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* Two white pedestrian boundaries only */}

      {[
        -halfWidth,
        halfWidth,
      ].map(
        (offset) => (
          <mesh
            key={`white-${offset}`}
            position={[
              0,
              0.041,
              offset,
            ]}
          >
            <boxGeometry
              args={[
                length,
                0.012,
                0.065,
              ]}
            />

            <meshStandardMaterial
              color="#f1f1eb"
              roughness={0.82}
            />
          </mesh>
        ),
      )}


      {/* Optional thin safety outline outside the meeting-room path */}

      {yellowOuter &&
        [
          -halfWidth - 0.12,
          halfWidth + 0.12,
        ].map(
          (offset) => (
            <mesh
              key={`yellow-${offset}`}
              position={[
                0,
                0.038,
                offset,
              ]}
            >
              <boxGeometry
                args={[
                  length,
                  0.01,
                  0.045,
                ]}
              />

              <meshStandardMaterial
                color="#c69b24"
                roughness={0.8}
              />
            </mesh>
          ),
        )}
    </group>
  )
}