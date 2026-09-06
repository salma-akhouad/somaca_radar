import {
  Billboard,
} from '@react-three/drei'

import {
  DoubleSide,
  Shape,
} from 'three'

import type {
  PoleOperationalLevel,
} from '../../../../api/types'

import {
  useOperations,
} from '../../../../operations/OperationsContext'

import {
  montagePoles,
} from './data/montageLayoutData'

const COLORS: Record<
  Exclude<PoleOperationalLevel, 'operational'>,
  string
> = {
  alert: '#d49a24',
  critical: '#c84b42',
  stopped: '#5f6561',
}

const OUTER_TRIANGLE = new Shape()
OUTER_TRIANGLE.moveTo(0, 0.30)
OUTER_TRIANGLE.lineTo(-0.31, -0.24)
OUTER_TRIANGLE.lineTo(0.31, -0.24)
OUTER_TRIANGLE.closePath()

const INNER_TRIANGLE = new Shape()
INNER_TRIANGLE.moveTo(0, 0.22)
INNER_TRIANGLE.lineTo(-0.225, -0.18)
INNER_TRIANGLE.lineTo(0.225, -0.18)
INNER_TRIANGLE.closePath()

function PoleIndicator({
  level,
  position,
}: {
  level: PoleOperationalLevel
  position: [number, number, number]
}) {
  if (level === 'operational') {
    return null
  }

  const color = COLORS[level]

  return (
    <group
      position={[
        position[0],
        2.30,
        position[2],
      ]}
    >
      <mesh
        position={[0, -0.45, 0]}
        raycast={() => null}
      >
        <cylinderGeometry
          args={[0.018, 0.018, 0.62, 8]}
        />
        <meshStandardMaterial
          color="#555b57"
          roughness={0.82}
          metalness={0.18}
        />
      </mesh>

      <Billboard follow>
        <mesh raycast={() => null}>
          <shapeGeometry args={[OUTER_TRIANGLE]} />
          <meshBasicMaterial
            color={color}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>

        <mesh
          position={[0, -0.005, 0.006]}
          raycast={() => null}
        >
          <shapeGeometry args={[INNER_TRIANGLE]} />
          <meshBasicMaterial
            color="#f5f2e8"
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>

        <mesh
          position={[0, 0.02, 0.014]}
          raycast={() => null}
        >
          <boxGeometry args={[0.045, 0.18, 0.014]} />
          <meshBasicMaterial
            color="#353a37"
            toneMapped={false}
          />
        </mesh>

        <mesh
          position={[0, -0.125, 0.014]}
          raycast={() => null}
        >
          <circleGeometry args={[0.027, 16]} />
          <meshBasicMaterial
            color="#353a37"
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  )
}

export function LivePoleStatusOverlay() {
  const { poleStates } = useOperations()

  return (
    <>
      {poleStates.map((state) => {
        const pole =
          montagePoles.find(
            (item) => item.id === state.poleName,
          )
          ?? montagePoles.find(
            (item) =>
              item.id === `P-${String(state.poleId).padStart(2, '0')}`,
          )

        if (!pole) return null

        return (
          <PoleIndicator
            key={state.poleId}
            level={state.level}
            position={pole.position}
          />
        )
      })}
    </>
  )
}
