interface RestrictedZoneProps {
  position: [
    number,
    number,
    number,
  ]

  width?: number
  depth?: number
}


export function RestrictedZone({
  position,
  width = 4.8,
  depth = 3.1,
}: RestrictedZoneProps) {
  /*
   * Generate stripe positions from the actual zone width.
   *
   * This keeps the component reusable if another technical
   * restricted area later has different dimensions.
   */
  const stripeSpacing = 0.62

  const stripeCount =
    Math.max(
      3,
      Math.floor(
        width / stripeSpacing,
      ),
    )

  const stripes =
    Array.from(
      {
        length:
          stripeCount,
      },
      (_, index) => {
        const usableWidth =
          width - 0.55

        if (
          stripeCount === 1
        ) {
          return 0
        }

        return (
          -usableWidth / 2 +
          (
            usableWidth /
            (stripeCount - 1)
          ) *
            index
        )
      },
    )


  return (
    <group position={position}>
      {/* Very subtle restricted-area tint */}
      <mesh
        position={[
          0,
          0.027,
          0,
        ]}
        rotation-x={
          -Math.PI / 2
        }
      >
        <planeGeometry
          args={[
            width,
            depth,
          ]}
        />

        <meshStandardMaterial
          color="#8a4038"
          transparent
          opacity={0.075}
          roughness={0.92}
        />
      </mesh>


      {/* Diagonal restricted-access stripes */}
      {stripes.map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              0.037,
              0,
            ]}
            rotation={[
              0,
              -0.58,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.11,
                0.009,
                depth * 1.22,
              ]}
            />

            <meshStandardMaterial
              color="#87433b"
              roughness={0.84}
            />
          </mesh>
        ),
      )}


      {/* Restricted-zone boundary */}
      {[
        -depth / 2,
        depth / 2,
      ].map((z) => (
        <mesh
          key={z}
          position={[
            0,
            0.039,
            z,
          ]}
        >
          <boxGeometry
            args={[
              width,
              0.01,
              0.075,
            ]}
          />

          <meshStandardMaterial
            color="#87433b"
            roughness={0.84}
          />
        </mesh>
      ))}
    </group>
  )
}