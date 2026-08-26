import {
  IndustrialLane,
} from './markings/IndustrialLane'

import {
  RestrictedTechnicalArea,
} from './factory/RestrictedTechnicalArea'

import {
  PedestrianPassage,
} from './markings/PedestrianPassage'

import {
  PedestrianPath,
} from './markings/PedestrianPath'

import {
  RestrictedZone,
} from './markings/RestrictedZone'

import {
  UetArea,
} from './factory/UetArea'

import {
  SupervisorBooth,
} from './factory/SupervisorBooth'

import {
  ProductionStation,
} from './factory/ProductionStation'

import {
  OverheadAssemblyLine,
} from './factory/OverheadAssemblyLine'

import {
  RaisedAccessStation,
} from './factory/RaisedAccessStation'

import {
  FinalControlZone,
} from './factory/FinalControlZone'

import {
  ValidationTrack,
} from './factory/ValidationTrack'

import {
  ReleaseGate,
} from './factory/ReleaseGate'

import {
  FinishedVehiclePark,
} from './factory/FinishedVehiclePark'

import {
  PostProductionRoad,
} from './factory/PostProductionRoad'

import {
  VehicleFlowMarker,
} from './flow/VehicleFlowMarker'

import {
  FlowEndpointMarker,
} from './flow/FlowEndpointMarker'

import {
  montagePoles,
} from './factory/data/montageLayoutData'


export function MontageLayout() {
  return (
    <group>
      {/* =====================================================
          LARGER PRODUCTION U

          We increased the physical footprint because
          24 poteaux need genuine breathing room.
          ===================================================== */}

      <IndustrialLane
        position={[-17, 0.024, 0]}
        length={32}
        width={1.65}
        rotation={Math.PI / 2}
      />

      <IndustrialLane
        position={[0, 0.024, 16]}
        length={34}
        width={1.65}
      />

      <IndustrialLane
        position={[17, 0.024, 0]}
        length={32}
        width={1.65}
        rotation={Math.PI / 2}
      />


      {/* Seamless upper corners */}

      <IndustrialLane
        position={[-17, 0.025, 16]}
        length={1.9}
        width={1.9}
      />

      <IndustrialLane
        position={[17, 0.025, 16]}
        length={1.9}
        width={1.9}
      />


      {/* =====================================================
          ENTRY / EXIT
          ===================================================== */}

      <IndustrialLane
        position={[-17, 0.021, -18]}
        length={4.8}
        width={1.9}
        rotation={Math.PI / 2}
        color="#454b47"
      />

      <IndustrialLane
        position={[17, 0.021, -18]}
        length={4.8}
        width={1.9}
        rotation={Math.PI / 2}
        color="#454b47"
      />


      <FlowEndpointMarker
        position={[-17, 0, -20.4]}
        label="ENTRÉE"
      />

      <FlowEndpointMarker
        position={[17, 0, -20.4]}
        label="SORTIE"
      />


      {/* =====================================================
          VEHICLE FLOW
          ===================================================== */}

      {/* LEFT: entry → upward */}

      <VehicleFlowMarker
        position={[-17, 0.043, -11]}
        direction="up"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[-17, 0.043, -3]}
        direction="up"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[-17, 0.043, 6]}
        direction="up"
        scale={1.45}
      />


      {/* TOP: left → right */}

      <VehicleFlowMarker
        position={[-10, 0.043, 16]}
        direction="right"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[0, 0.043, 16]}
        direction="right"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[10, 0.043, 16]}
        direction="right"
        scale={1.45}
      />


      {/* RIGHT: top → exit */}

      <VehicleFlowMarker
        position={[17, 0.043, 8]}
        direction="down"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[17, 0.043, 0]}
        direction="down"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[17, 0.043, -10]}
        direction="down"
        scale={1.45}
      />


      {/* =====================================================
          UET AREAS

          Larger because every UET now contains 6 poteaux.
          ===================================================== */}

      <UetArea
        position={[23, 0, 0]}
        width={10}
        depth={28}
        label="UET 1"
      />

      <UetArea
        position={[0, 0, 23]}
        width={30}
        depth={8}
        label="UET 2"
      />

      <UetArea
        position={[-23, 0, 0]}
        width={10}
        depth={28}
        label="UET 3"
      />

      <UetArea
        position={[0, 0, -23]}
        width={30}
        depth={8}
        label="UET 4"
      />


      {/* =====================================================
          ALL 24 POTEAUX

          This is the key architecture change.
          ===================================================== */}

      {montagePoles.map(
        (pole) => (
          <ProductionStation
            key={pole.id}
            pole={pole}
          />
        ),
      )}


      {/* =====================================================
          OVERHEAD ASSEMBLY
          ===================================================== */}

      <OverheadAssemblyLine />


      {/* Raised intervention zone */}
      <RaisedAccessStation />


      {/* =====================================================
          PEDESTRIAN CIRCULATION
          ===================================================== */}

      <PedestrianPath
        position={[-20, 0.026, 0]}
        length={32}
        rotation={Math.PI / 2}
      />

      <PedestrianPath
        position={[20, 0.026, 0]}
        length={32}
        rotation={Math.PI / 2}
      />

      <PedestrianPath
        position={[0, 0.026, 19]}
        length={34}
      />


      {/* Controlled crossings */}

      <PedestrianPassage
        position={[-17, 0.036, 4]}
        rotation={Math.PI / 2}
        length={5.8}
        width={5}
      />

      <PedestrianPassage
        position={[0, 0.036, 16]}
        length={5.8}
        width={5}
      />

      <PedestrianPassage
        position={[17, 0.036, 4]}
        rotation={Math.PI / 2}
        length={5.8}
        width={5}
      />


      {/* =====================================================
          PRODUCTION OFFICE

          Moved away from the vehicle-release path.
          ===================================================== */}

      <SupervisorBooth
        position={[30, 0, 8]}
      />


      {/* =====================================================
          POST-PRODUCTION
          ===================================================== */}

      <PostProductionRoad />

      <FinalControlZone />

      <ValidationTrack />

      <ReleaseGate />

      <FinishedVehiclePark />


      {/* =====================================================
          RESTRICTED TECHNICAL AREA
          ===================================================== */}

      <RestrictedZone
        position={[
          21,
          0,
          -23.4,
        ]}
        width={6}
        depth={2.8}
      />

      <RestrictedTechnicalArea />
    </group>
  )
}