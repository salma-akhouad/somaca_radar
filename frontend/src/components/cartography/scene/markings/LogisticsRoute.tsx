interface Point {
  x: number
  z: number
}


interface LogisticsRouteProps {
  points: Point[]

  width?: number
}


function RouteLine({
  start,
  end,
  offset,
  color,
  dashed = false,
}: {
  start: Point
  end: Point

  offset: number

  color: string

  dashed?: boolean
}) {
  const dx =
    end.x -
    start.x

  const dz =
    end.z -
    start.z

  const length =
    Math.sqrt(
      dx * dx +
      dz * dz,
    )

  if (
    length <= 0
  ) {
    return null
  }


  const perpendicularX =
    -dz /
    length

  const perpendicularZ =
    dx /
    length


  const centerX =
    (
      start.x +
      end.x
    ) /
    2 +
    perpendicularX *
    offset

  const centerZ =
    (
      start.z +
      end.z
    ) /
    2 +
    perpendicularZ *
    offset


  const rotation =
    -Math.atan2(
      dz,
      dx,
    )


  if (!dashed) {
    return (
      <mesh
        position={[
          centerX,
          0.04,
          centerZ,
        ]}
        rotation-y={
          rotation
        }
      >
        <boxGeometry
          args={[
            length,
            0.012,
            0.065,
          ]}
        />

        <meshStandardMaterial
          color={color}
          roughness={0.78}
        />
      </mesh>
    )
  }


  const dashSpacing =
    2.1

  const dashLength =
    0.85

  const dashCount =
    Math.max(
      1,
      Math.floor(
        length /
        dashSpacing,
      ),
    )


  return (
    <group>
      {Array.from({
        length:
          dashCount,
      }).map(
        (
          _,
          index,
        ) => {
          const progress =
            (
              index +
              0.5
            ) /
            dashCount

          const x =
            start.x +
            dx *
            progress

          const z =
            start.z +
            dz *
            progress


          return (
            <mesh
              key={index}
              position={[
                x,
                0.043,
                z,
              ]}
              rotation-y={
                rotation
              }
            >
              <boxGeometry
                args={[
                  dashLength,
                  0.013,
                  0.055,
                ]}
              />

              <meshStandardMaterial
                color={color}
                roughness={0.82}
              />
            </mesh>
          )
        },
      )}
    </group>
  )
}


export function LogisticsRoute({
  points,
  width = 1.85,
}: LogisticsRouteProps) {
  const segments =
    points.slice(
      0,
      -1,
    )


  return (
    <group>
      {segments.map(
        (
          start,
          index,
        ) => {
          const end =
            points[
              index + 1
            ]

          return (
            <group
              key={index}
            >
              <RouteLine
                start={start}
                end={end}
                offset={
                  width /
                  2
                }
                color="#c69b24"
              />

              <RouteLine
                start={start}
                end={end}
                offset={
                  -width /
                  2
                }
                color="#c69b24"
              />

              <RouteLine
                start={start}
                end={end}
                offset={0}
                color="#e7e7e0"
                dashed
              />
            </group>
          )
        },
      )}
    </group>
  )
}