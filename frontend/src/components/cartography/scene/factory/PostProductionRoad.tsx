import {
  VEHICLE_JOURNEY,
} from './data/vehicleJourney'

interface RoadSegmentProps {
  start: [number, number, number]
  end: [number, number, number]
  width?: number
}

function RoadSegment({
  start,
  end,
  width = 4.4,
}: RoadSegmentProps) {
  const dx = end[0] - start[0]
  const dz = end[2] - start[2]

  const length =
    Math.sqrt(dx * dx + dz * dz)

  const centerX =
    (start[0] + end[0]) / 2

  const centerZ =
    (start[2] + end[2]) / 2

  const rotation =
    -Math.atan2(dz, dx)

  return (
    <mesh
      position={[
        centerX,
        0.012,
        centerZ,
      ]}
      rotation-y={rotation}
      receiveShadow
    >
      <boxGeometry
        args={[
          length,
          0.018,
          width,
        ]}
      />

      <meshStandardMaterial
        color="#4d514e"
        roughness={0.96}
        metalness={0}
      />
    </mesh>
  )
}

interface RoadEdgeProps {
  start: [number, number, number]
  end: [number, number, number]
  offset: number
}

function RoadEdge({
  start,
  end,
  offset,
}: RoadEdgeProps) {
  const dx = end[0] - start[0]
  const dz = end[2] - start[2]

  const length =
    Math.sqrt(dx * dx + dz * dz)

  const centerX =
    (start[0] + end[0]) / 2

  const centerZ =
    (start[2] + end[2]) / 2

  const rotation =
    -Math.atan2(dz, dx)

  const perpendicularX =
    -dz / length

  const perpendicularZ =
    dx / length

  return (
    <mesh
      position={[
        centerX +
          perpendicularX * offset,
        0.027,
        centerZ +
          perpendicularZ * offset,
      ]}
      rotation-y={rotation}
    >
      <boxGeometry
        args={[
          length,
          0.012,
          0.075,
        ]}
      />

      <meshStandardMaterial
        color="#b89229"
        roughness={0.78}
      />
    </mesh>
  )
}

export function PostProductionRoad() {
  const {
    lowered,
    handoffStraight,
    finalControlEntry,
    validationExit,
    releaseGate,
    parkingApproach,
    parkingEntry,
  } = VEHICLE_JOURNEY

  const roadSegments = [
    [
      lowered.position,
      handoffStraight.position,
    ],

    [
      handoffStraight.position,
      finalControlEntry.position,
    ],

    [
      finalControlEntry.position,
      validationExit.position,
    ],

    [
      validationExit.position,
      releaseGate.position,
    ],

    [
      releaseGate.position,
      parkingApproach.position,
    ],

    [
      parkingApproach.position,
      parkingEntry.position,
    ],
  ] as const

  return (
    <group>
      {roadSegments.map(
        ([start, end], index) => (
          <RoadSegment
            key={`road-${index}`}
            start={start}
            end={end}
          />
        ),
      )}

      {roadSegments.map(
        ([start, end], index) => (
          <group key={`edges-${index}`}>
            <RoadEdge
              start={start}
              end={end}
              offset={2.08}
            />

            <RoadEdge
              start={start}
              end={end}
              offset={-2.08}
            />
          </group>
        ),
      )}
    </group>
  )
}