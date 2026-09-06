import {
  RoundedBox,
  Text,
} from '@react-three/drei'

import {
  DoubleSide,
  Shape,
} from 'three'

import type {
  PoleOperationalLevel,
} from '../../../../api/types'

import {
  MachineVisual,
} from './MachineVisuals'

import type {
  PoleConfig,
} from './data/montageLayoutData'


interface ProductionStationProps {
  pole: PoleConfig
  selected?: boolean
  operationalLevel?: PoleOperationalLevel
  onSelect?: (pole: PoleConfig) => void
}


const machineSlots: Array<
  [number, number, number]
> = [
    [-0.48, 0, -0.08],
    [0.7, 0, 0.18],
    [0.08, 0, 0.58],
  ]


const stationBorderColor =
  '#917b38'

const selectedBorderColor =
  '#c3a34b'

const stationPlateColor =
  '#e2e1da'

const selectedPlateColor =
  '#f1ead3'


const WARNING_COLORS: Record<
  Exclude<
    PoleOperationalLevel,
    'operational'
  >,
  string
> = {
  /*
   * Stronger orange than the SOMACA production yellow,
   * so Attention requise remains visible in the factory.
   */
  alert: '#c66e16',

  /*
   * Muted industrial warning red.
   */
  critical: '#c54840',

  /*
   * Light graphite/white-grey treatment for Inconnu.
   * Intentionally much lighter than the old dark grey.
   */
  stopped: '#b9c1bc',
}


const WARNING_OUTER =
  new Shape()

WARNING_OUTER.moveTo(
  0,
  0.68,
)

WARNING_OUTER.lineTo(
  -0.78,
  -0.58,
)

WARNING_OUTER.lineTo(
  0.78,
  -0.58,
)

WARNING_OUTER.closePath()


const WARNING_INNER =
  new Shape()

WARNING_INNER.moveTo(
  0,
  0.48,
)

WARNING_INNER.lineTo(
  -0.56,
  -0.42,
)

WARNING_INNER.lineTo(
  0.56,
  -0.42,
)

WARNING_INNER.closePath()


function WarningFace({
  color,
  back = false,
}: {
  color: string
  back?: boolean
}) {
  return (
    <group
      rotation-y={
        back
          ? Math.PI
          : 0
      }
    >
      {/* Colored warning border */}
      <mesh>
        <shapeGeometry
          args={[
            WARNING_OUTER,
          ]}
        />

        <meshBasicMaterial
          color={color}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>


      {/* Warm-white sign surface */}
      <mesh
        position={[
          0,
          -0.025,
          0.018,
        ]}
      >
        <shapeGeometry
          args={[
            WARNING_INNER,
          ]}
        />

        <meshBasicMaterial
          color="#f6f3e9"
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>


      {/*
       * Heavy exclamation mark made from geometry rather
       * than font text, so it stays genuinely bold and black.
       */}
      <mesh
        position={[
          0,
          0.08,
          0.042,
        ]}
      >
        <boxGeometry
          args={[
            0.105,
            0.40,
            0.025,
          ]}
        />

        <meshBasicMaterial
          color="#171a18"
          toneMapped={false}
        />
      </mesh>


      <mesh
        position={[
          0,
          -0.27,
          0.042,
        ]}
      >
        <circleGeometry
          args={[
            0.072,
            24,
          ]}
        />

        <meshBasicMaterial
          color="#171a18"
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}


function WarningPlacard({
  level,
}: {
  level: PoleOperationalLevel
}) {
  if (
    level === 'operational'
  ) {
    return null
  }

  const color =
    WARNING_COLORS[level]

  return (
    <group
      /*
       * The sign sits directly beneath the production beam.
       * No suspension bar: the warning itself remains clear.
       */
      position={[
        0.18,
        2.12,
        -0.68,
      ]}
    >
      {/* Front face */}
      <group
        position={[
          0,
          0,
          0.026,
        ]}
      >
        <WarningFace
          color={color}
        />
      </group>


      {/* Back face: identical appearance */}
      <group
        position={[
          0,
          0,
          -0.026,
        ]}
      >
        <WarningFace
          color={color}
          back
        />
      </group>
    </group>
  )
}

export function ProductionStation({
  pole,
  selected = false,
  operationalLevel =
  'operational',
  onSelect,
}: ProductionStationProps) {
  return (
    <group
      position={pole.position}

      rotation-y={
        pole.rotation ??
        0
      }

      /*
       * One click contract for the whole production station:
       * equipment, pole, nameplate and warning placard all
       * resolve to the same production post.
       */
      onClick={(event) => {
        event.stopPropagation()

        if (
          event.delta <= 5
        ) {
          onSelect?.(pole)
        }
      }}

      onPointerEnter={(event) => {
        event.stopPropagation()

        document.body.style.cursor =
          'pointer'
      }}

      onPointerLeave={() => {
        document.body.style.cursor =
          'default'
      }}
    >
      {selected && (
        <mesh
          position={[
            0,
            0.018,
            0,
          ]}
          rotation-x={
            -Math.PI / 2
          }
        >
          <circleGeometry
            args={[
              1.7,
              48,
            ]}
          />

          <meshStandardMaterial
            color="#c6b269"
            transparent
            opacity={0.12}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      )}


      {[
        -1.42,
        1.42,
      ].map((x) => (
        <mesh
          key={`side-${x}`}
          position={[
            x,
            0.041,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.055,
              0.012,
              1.9,
            ]}
          />

          <meshStandardMaterial
            color={
              selected
                ? selectedBorderColor
                : stationBorderColor
            }
            roughness={0.78}
          />
        </mesh>
      ))}


      {[
        -0.95,
        0.95,
      ].map((z) => (
        <mesh
          key={`edge-${z}`}
          position={[
            0,
            0.041,
            z,
          ]}
        >
          <boxGeometry
            args={[
              2.9,
              0.012,
              0.055,
            ]}
          />

          <meshStandardMaterial
            color={
              selected
                ? selectedBorderColor
                : stationBorderColor
            }
            roughness={0.78}
          />
        </mesh>
      ))}


      <RoundedBox
        args={[
          0.2,
          3.05,
          0.2,
        ]}
        radius={0.035}
        smoothness={2}
        position={[
          -1.2,
          1.53,
          -0.68,
        ]}
        castShadow
      >
        <meshStandardMaterial
          color="#484e4a"
          metalness={0.48}
          roughness={0.42}
        />
      </RoundedBox>


      <RoundedBox
        args={[
          0.44,
          0.32,
          0.44,
        ]}
        radius={0.055}
        smoothness={2}
        position={[
          -1.2,
          0.16,
          -0.68,
        ]}
      >
        <meshStandardMaterial
          color="#aa8b32"
          roughness={0.68}
        />
      </RoundedBox>


      <RoundedBox
        args={[
          2.05,
          0.13,
          0.13,
        ]}
        radius={0.035}
        smoothness={2}
        position={[
          -0.22,
          2.95,
          -0.68,
        ]}
        castShadow
      >
        <meshStandardMaterial
          color="#484e4a"
          metalness={0.48}
          roughness={0.42}
        />
      </RoundedBox>


      <mesh
        position={[
          0.48,
          2.36,
          -0.68,
        ]}
      >
        <cylinderGeometry
          args={[
            0.022,
            0.022,
            1.05,
            8,
          ]}
        />

        <meshStandardMaterial
          color="#292e2b"
          roughness={0.64}
        />
      </mesh>


      {/* Physical station identifier plate */}
      <RoundedBox
        args={[
          0.72,
          0.34,
          0.055,
        ]}
        radius={0.04}
        smoothness={2}
        position={[
          -1.2,
          3.34,
          -0.68,
        ]}
      >
        <meshStandardMaterial
          color={
            selected
              ? selectedPlateColor
              : stationPlateColor
          }
          metalness={0.06}
          roughness={0.68}
        />
      </RoundedBox>


      {/* First face of the pole identifier */}
      <Text
        position={[
          -1.2,
          3.34,
          -0.715,
        ]}
        rotation-y={
          Math.PI
        }
        fontSize={0.18}
        color="#303531"
        anchorX="center"
        anchorY="middle"
      >
        {pole.id}
      </Text>


      {/* Second face of the same pole identifier */}
      <Text
        position={[
          -1.2,
          3.34,
          -0.645,
        ]}
        fontSize={0.18}
        color="#303531"
        anchorX="center"
        anchorY="middle"
      >
        {pole.id}
      </Text>


      <mesh
        position={[
          -1.2,
          3.08,
          -0.68,
        ]}
      >
        <boxGeometry
          args={[
            0.46,
            0.045,
            0.05,
          ]}
        />

        <meshStandardMaterial
          color={
            selected
              ? '#c4a34a'
              : '#967e36'
          }
          roughness={0.7}
        />
      </mesh>


      <WarningPlacard
        level={
          operationalLevel
        }
      />


      {pole.machines.map(
        (
          machine,
          index,
        ) => (
          <MachineVisual
            key={
              machine.id
            }
            kind={
              machine.kind
            }
            status={
              machine.status
            }
            position={
              machineSlots[
              index %
              machineSlots.length
              ]
            }
          />
        ),
      )}
    </group>
  )
}