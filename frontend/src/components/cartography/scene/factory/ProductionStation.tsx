import {
  RoundedBox,
  Text,
} from '@react-three/drei'

import {
  useRef,
} from 'react'

import {
  MachineVisual,
} from './MachineVisuals'

import type {
  PoleConfig,
} from './data/montageLayoutData'


interface ProductionStationProps {
  pole: PoleConfig
  selected?: boolean
  onSelect?: (pole: PoleConfig) => void
}


const machineSlots: Array<
  [number, number, number]
> = [
    [-0.48, 0, -0.08],
    [0.7, 0, 0.18],
    [0.08, 0, 0.58],
  ]

const stationBorderColor = '#917b38'
const selectedBorderColor = '#c3a34b'
const stationPlateColor = '#e2e1da'
const selectedPlateColor = '#f1ead3'


export function ProductionStation({
  pole,
  selected = false,
  onSelect,
}: ProductionStationProps) {
  const pointerDown =
    useRef<{
      x: number
      y: number
    } | null>(null)
  return (
    <group
      position={pole.position}
      rotation-y={pole.rotation ?? 0}
      onPointerDown={(event) => {
        event.stopPropagation()

        pointerDown.current = {
          x: event.clientX,
          y: event.clientY,
        }
      }}

      onPointerUp={(event) => {
        event.stopPropagation()

        const start =
          pointerDown.current

        pointerDown.current = null

        if (!start) {
          return
        }

        const dx =
          event.clientX - start.x

        const dy =
          event.clientY - start.y

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy,
          )

        if (distance <= 5) {
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
          position={[0, 0.018, 0]}
          rotation-x={-Math.PI / 2}
        >
          <circleGeometry
            args={[1.7, 48]}
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
      {[-1.42, 1.42].map((x) => (
        <mesh
          key={`side-${x}`}
          position={[x, 0.041, 0]}
        >
          <boxGeometry
            args={[0.055, 0.012, 1.9]}
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

      {[-0.95, 0.95].map((z) => (
        <mesh
          key={`edge-${z}`}
          position={[0, 0.041, z]}
        >
          <boxGeometry
            args={[2.9, 0.012, 0.055]}
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
        args={[0.2, 3.05, 0.2]}
        radius={0.035}
        smoothness={2}
        position={[-1.2, 1.53, -0.68]}
        castShadow
      >
        <meshStandardMaterial
          color="#484e4a"
          metalness={0.48}
          roughness={0.42}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.44, 0.32, 0.44]}
        radius={0.055}
        smoothness={2}
        position={[-1.2, 0.16, -0.68]}
      >
        <meshStandardMaterial
          color="#aa8b32"
          roughness={0.68}
        />
      </RoundedBox>

      <RoundedBox
        args={[2.05, 0.13, 0.13]}
        radius={0.035}
        smoothness={2}
        position={[-0.22, 2.95, -0.68]}
        castShadow
      >
        <meshStandardMaterial
          color="#484e4a"
          metalness={0.48}
          roughness={0.42}
        />
      </RoundedBox>

      <mesh
        position={[0.48, 2.36, -0.68]}
      >
        <cylinderGeometry
          args={[0.022, 0.022, 1.05, 8]}
        />

        <meshStandardMaterial
          color="#292e2b"
          roughness={0.64}
        />
      </mesh>

      <RoundedBox
        args={[0.72, 0.34, 0.055]}
        radius={0.04}
        smoothness={2}
        position={[-1.2, 3.34, -0.68]}
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

      <Text
        position={[-1.2, 3.34, -0.715]}
        rotation-y={Math.PI}
        fontSize={0.18}
        color="#303531"
        anchorX="center"
        anchorY="middle"
      >
        {pole.id}
      </Text>

      <mesh
        position={[-1.2, 3.08, -0.68]}
      >
        <boxGeometry
          args={[0.46, 0.045, 0.05]}
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

      {pole.machines.map(
        (machine, index) => (
          <MachineVisual
            key={machine.id}
            kind={machine.kind}
            status={machine.status}
            position={
              machineSlots[
              index % machineSlots.length
              ]
            }
          />
        ),
      )}
    </group>
  )
}