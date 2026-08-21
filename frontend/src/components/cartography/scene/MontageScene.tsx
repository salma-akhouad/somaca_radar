import { FactoryFloor } from './FactoryFloor'
import { SceneCameraControls } from './SceneCameraControls'
import type { CameraAction, InteractionMode } from './SceneCameraControls'
import { IndustrialLane } from './markings/IndustrialLane'
import { PedestrianPassage } from './markings/PedestrianPassage'
import { RestrictedZone } from './markings/RestrictedZone'
import { UetArea } from './factory/UetArea'
import { SupervisorWorkstation } from './factory/SupervisorWorkstation'
import { PartsTrolley } from './factory/PartsTrolley'
import { AutomatedCarrier } from './factory/AutomatedCarrier'
import { VehicleFlowMarker } from './flow/VehicleFlowMarker'

interface MontageSceneProps { command: { type: CameraAction; id: number }; interactionMode: InteractionMode; onZoomChange: (zoom: number) => void }

export function MontageScene({ command, interactionMode, onZoomChange }: MontageSceneProps) {
  return <><color attach="background" args={['#e7e7e1']} /><fog attach="fog" args={['#e7e7e1', 40, 95]} /><hemisphereLight args={['#fffdf6', '#a5a69f', 1.25]} /><ambientLight intensity={.35} /><directionalLight castShadow position={[18, 26, 14]} intensity={1.45} shadow-mapSize={[1024, 1024]} shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} /><FactoryFloor /><IndustrialLane position={[0, .024, -3]} length={28} /><IndustrialLane position={[14, .024, -1.8]} length={1.2} width={1.1} rotation={Math.PI / 2} /><PedestrianPassage position={[0, .036, -3]} /><VehicleFlowMarker position={[-7, .043, -3]} rotation={-Math.PI / 2} /><VehicleFlowMarker position={[7, .043, -3]} rotation={-Math.PI / 2} /><UetArea position={[-10, 0, 7]} /><SupervisorWorkstation position={[7.5, 0, 7]} rotation={-.18} /><PartsTrolley position={[-9, 0, -10]} rotation={.2} /><AutomatedCarrier position={[3.5, 0, -10]} rotation={-.15} /><RestrictedZone position={[11, 0, -10]} /><SceneCameraControls command={command} interactionMode={interactionMode} onZoomChange={onZoomChange} /></>
}
