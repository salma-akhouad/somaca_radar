import {
  RoundedBox,
} from '@react-three/drei'


export type MachineKind =
  | 'printer'
  | 'tablet'
  | 'control'
  | 'inspection'
  | 'scanner'
  | 'pc'


interface MachineVisualProps {
  position: [
    number,
    number,
    number,
  ]

  rotation?: number
}


const machineMetal = '#626762'
const machineDark = '#303531'
const machineBlack = '#222725'
const screenColor = '#c9ded4'
const screenGlow = '#6fa58b'


export function IndustrialPrinter({
  position,
  rotation = 0,
}: MachineVisualProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      <RoundedBox
        args={[0.72, 0.9, 0.62]}
        radius={0.08}
        smoothness={3}
        position={[0, 0.45, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={machineMetal}
          metalness={0.2}
          roughness={0.55}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.62, 0.24, 0.56]}
        radius={0.06}
        smoothness={3}
        position={[0, 1.02, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={machineDark}
          roughness={0.48}
        />
      </RoundedBox>

      {/* Paper tray */}
      <mesh
        position={[0, 1.15, 0.12]}
      >
        <boxGeometry args={[0.42, 0.025, 0.28]} />

        <meshStandardMaterial
          color="#efeee8"
          roughness={0.92}
        />
      </mesh>

      {/* Status light */}
      <mesh
        position={[0.26, 0.86, 0.32]}
      >
        <sphereGeometry args={[0.045, 12, 12]} />

        <meshStandardMaterial
          color="#70bb78"
          emissive="#55a961"
          emissiveIntensity={0.7}
        />
      </mesh>
    </group>
  )
}


export function TabletTerminal({
  position,
  rotation = 0,
}: MachineVisualProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* Weighted base */}
      <mesh
        position={[0, 0.05, 0]}
      >
        <cylinderGeometry args={[0.32, 0.38, 0.1, 18]} />

        <meshStandardMaterial
          color={machineDark}
          metalness={0.35}
          roughness={0.48}
        />
      </mesh>

      {/* Pedestal */}
      <mesh
        position={[0, 0.62, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.07, 0.09, 1.2, 12]} />

        <meshStandardMaterial
          color={machineMetal}
          metalness={0.55}
          roughness={0.38}
        />
      </mesh>

      {/* Tablet casing */}
      <RoundedBox
        args={[0.72, 0.5, 0.08]}
        radius={0.06}
        smoothness={3}
        position={[0, 1.32, 0]}
        rotation={[-0.18, 0, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={machineBlack}
          roughness={0.35}
        />
      </RoundedBox>

      {/* Active display */}
      <mesh
        position={[0, 1.32, 0.047]}
        rotation-x={-0.18}
      >
        <boxGeometry args={[0.58, 0.37, 0.012]} />

        <meshStandardMaterial
          color={screenColor}
          emissive={screenGlow}
          emissiveIntensity={0.5}
          roughness={0.18}
        />
      </mesh>
    </group>
  )
}


export function ControlCabinet({
  position,
  rotation = 0,
}: MachineVisualProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      <RoundedBox
        args={[0.88, 1.55, 0.66]}
        radius={0.06}
        smoothness={3}
        position={[0, 0.78, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={machineMetal}
          metalness={0.3}
          roughness={0.5}
        />
      </RoundedBox>

      {/* Door seam */}
      <mesh
        position={[0, 0.78, 0.336]}
      >
        <boxGeometry args={[0.7, 1.3, 0.012]} />

        <meshStandardMaterial
          color="#555a56"
          roughness={0.55}
        />
      </mesh>

      {/* Screen */}
      <mesh
        position={[0, 1.12, 0.35]}
      >
        <boxGeometry args={[0.46, 0.3, 0.018]} />

        <meshStandardMaterial
          color={screenColor}
          emissive={screenGlow}
          emissiveIntensity={0.45}
          roughness={0.2}
        />
      </mesh>

      {[
        [-0.2, '#68b971'],
        [0, '#d5a917'],
        [0.2, '#777d78'],
      ].map(([x, color]) => (
        <mesh
          key={String(x)}
          position={[Number(x), 0.79, 0.355]}
        >
          <sphereGeometry args={[0.04, 10, 10]} />

          <meshStandardMaterial
            color={String(color)}
            emissive={String(color)}
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  )
}


export function InspectionDisplay({
  position,
  rotation = 0,
}: MachineVisualProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* Stable industrial base */}
      <mesh
        position={[0, 0.05, 0]}
      >
        <cylinderGeometry args={[0.3, 0.34, 0.1, 16]} />

        <meshStandardMaterial
          color={machineDark}
          roughness={0.55}
        />
      </mesh>

      <mesh
        position={[0, 0.68, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.065, 0.08, 1.3, 12]} />

        <meshStandardMaterial
          color={machineMetal}
          metalness={0.52}
          roughness={0.4}
        />
      </mesh>

      <RoundedBox
        args={[0.96, 0.62, 0.1]}
        radius={0.06}
        smoothness={3}
        position={[0, 1.45, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={machineBlack}
          roughness={0.36}
        />
      </RoundedBox>

      <mesh
        position={[0, 1.45, 0.056]}
      >
        <boxGeometry args={[0.78, 0.45, 0.012]} />

        <meshStandardMaterial
          color={screenColor}
          emissive={screenGlow}
          emissiveIntensity={0.46}
          roughness={0.18}
        />
      </mesh>
    </group>
  )
}


export function ScannerTerminal({
  position,
  rotation = 0,
}: MachineVisualProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      <RoundedBox
        args={[0.52, 0.36, 0.42]}
        radius={0.08}
        smoothness={3}
        position={[0, 0.95, 0]}
        rotation={[-0.14, 0, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={machineDark}
          roughness={0.42}
        />
      </RoundedBox>

      <mesh
        position={[0, 0.5, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.055, 0.075, 0.9, 12]} />

        <meshStandardMaterial
          color={machineMetal}
          metalness={0.45}
          roughness={0.4}
        />
      </mesh>

      {/* Scanner window */}
      <mesh
        position={[0, 1, 0.22]}
        rotation-x={-0.14}
      >
        <boxGeometry args={[0.28, 0.1, 0.012]} />

        <meshStandardMaterial
          color="#9cc6bb"
          emissive="#5d9f8d"
          emissiveIntensity={0.55}
        />
      </mesh>
    </group>
  )
}


export function WorkstationPC({
  position,
  rotation = 0,
}: MachineVisualProps) {
  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      {/* Small industrial stand */}
      <RoundedBox
        args={[0.72, 0.08, 0.58]}
        radius={0.04}
        smoothness={2}
        position={[0, 0.78, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={machineMetal}
          roughness={0.52}
          metalness={0.18}
        />
      </RoundedBox>

      <mesh
        position={[0, 0.38, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.055, 0.075, 0.75, 12]} />

        <meshStandardMaterial
          color={machineDark}
          metalness={0.42}
          roughness={0.42}
        />
      </mesh>

      {/* Monitor */}
      <RoundedBox
        args={[0.72, 0.46, 0.08]}
        radius={0.04}
        smoothness={3}
        position={[0, 1.18, -0.05]}
        castShadow
      >
        <meshStandardMaterial
          color={machineBlack}
          roughness={0.35}
        />
      </RoundedBox>

      <mesh
        position={[0, 1.18, -0.003]}
      >
        <boxGeometry args={[0.59, 0.34, 0.01]} />

        <meshStandardMaterial
          color="#d4e3dc"
          emissive="#73a78e"
          emissiveIntensity={0.42}
          roughness={0.18}
        />
      </mesh>
    </group>
  )
}


interface MachineVisualRouterProps
  extends MachineVisualProps {
  kind: MachineKind
}


export function MachineVisual({
  kind,
  position,
  rotation = 0,
}: MachineVisualRouterProps) {
  switch (kind) {
    case 'printer':
      return (
        <IndustrialPrinter
          position={position}
          rotation={rotation}
        />
      )

    case 'tablet':
      return (
        <TabletTerminal
          position={position}
          rotation={rotation}
        />
      )

    case 'control':
      return (
        <ControlCabinet
          position={position}
          rotation={rotation}
        />
      )

    case 'inspection':
      return (
        <InspectionDisplay
          position={position}
          rotation={rotation}
        />
      )

    case 'scanner':
      return (
        <ScannerTerminal
          position={position}
          rotation={rotation}
        />
      )

    case 'pc':
      return (
        <WorkstationPC
          position={position}
          rotation={rotation}
        />
      )
  }
}