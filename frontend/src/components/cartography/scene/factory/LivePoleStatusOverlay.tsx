import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

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
  PoleOperationalLevel,
  string
> = {
  operational: '#55ad68',
  alert: '#e6a11c',
  critical: '#df4436',
  stopped: '#3d4140',
}

function PoleIndicator({
  level,
  position,
}: {
  level: PoleOperationalLevel
  position: [number, number, number]
}) {
  const group = useRef<Group>(null)

  useFrame((state) => {
    if (
      !group.current
      || level !== 'critical'
    ) {
      return
    }

    const pulse =
      1
      + (
        Math.sin(
          state.clock.elapsedTime * 3,
        )
        + 1
      ) * 0.08

    group.current.scale.set(
      pulse,
      pulse,
      pulse,
    )
  })

  if (level === 'operational') {
    return null
  }

  return (
    <group
      ref={group}
      position={[
        position[0],
        2.05,
        position[2],
      ]}
    >
      <mesh>
        <sphereGeometry
          args={[0.11, 12, 10]}
        />

        <meshBasicMaterial
          color={COLORS[level]}
          toneMapped={false}
        />
      </mesh>
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
            (item) =>
              item.id === state.poleName,
          )
          ??
          montagePoles.find(
            (item) =>
              item.id ===
              `P-${String(
                state.poleId,
              ).padStart(2, '0')}`,
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