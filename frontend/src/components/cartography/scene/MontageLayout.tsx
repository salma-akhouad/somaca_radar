import {
  IndustrialLane,
} from './markings/IndustrialLane'

import {
  useOperations,
} from '../../../operations/OperationsContext'

import {
  ProductionHandoff,
} from './factory/ProductionHandoff'

import {
  LoweringStation,
} from './factory/LoweringStation'

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
  SecondaryPedestrianPath,
} from './markings/SecondaryPedestrianPath'

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
  FactoryManager,
} from './factory/FactoryManager'

import {
  ProductionStation,
} from './factory/ProductionStation'

import {
  OverheadAssemblyLine,
} from './factory/OverheadAssemblyLine'

import {
  AutomatedCarrier,
} from './factory/AutomatedCarrier'

import {
  WheelStockArea,
} from './factory/WheelStockArea'

import {
  FactoryWorker,
} from './factory/FactoryWorker'

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
  UET_LAYOUT,
} from './factory/data/montageLayoutData'

import type {
  PoleConfig,
} from './factory/data/montageLayoutData'

import {
  AnimatedFinishedVehicle,
} from './factory/AnimatedFinishedVehicle'

import {
  SeatStockArea,
} from './factory/SeatStockArea'

import {
  WorkerAmenities,
} from './factory/WorkerAmenities'


import {
  SeatAutomatedCarrier,
} from './factory/SeatAutomatedCarrier'

import {
  FireSafetyStations,
} from './factory/FireSafetyStations'


interface MontageLayoutProps {
  selectedPoleId?:
  string | null

  onPoleSelect?:
  (
    pole:
      PoleConfig,
  ) => void
}


export function MontageLayout({
  selectedPoleId,
  onPoleSelect,
}: MontageLayoutProps) {
  const {
    poleStates,
  } =
    useOperations()


  const operationalLevelByPoleId =
    new Map(
      poleStates.map(
        (state) => [
          state.poleId,
          state.level,
        ],
      ),
    )

  const uets =
    Object.values(
      UET_LAYOUT,
    )


  return (
    <group>
      <IndustrialLane
        position={[
          -17,
          0.024,
          0,
        ]}
        length={32}
        width={1.65}
        rotation={
          Math.PI / 2
        }
      />

      <IndustrialLane
        position={[
          0,
          0.024,
          16,
        ]}
        length={34}
        width={1.65}
      />

      <IndustrialLane
        position={[
          17,
          0.024,
          0,
        ]}
        length={32}
        width={1.65}
        rotation={
          Math.PI / 2
        }
      />

      <IndustrialLane
        position={[
          -17,
          0.025,
          16,
        ]}
        length={1.9}
        width={1.9}
      />

      <IndustrialLane
        position={[
          17,
          0.025,
          16,
        ]}
        length={1.9}
        width={1.9}
      />


      <IndustrialLane
        position={[
          -17,
          0.021,
          -18.2,
        ]}
        length={4.4}
        width={1.65}
        rotation={
          Math.PI / 2
        }
        color="#454b47"
      />

      <IndustrialLane
        position={[
          17,
          0.021,
          -18.2,
        ]}
        length={4.4}
        width={1.65}
        rotation={
          Math.PI / 2
        }
        color="#454b47"
      />


      <FlowEndpointMarker
        position={[
          -17,
          0,
          -20.4,
        ]}
        label="ENTRÉE"
      />

      <FlowEndpointMarker
        position={[
          17,
          0,
          -20.4,
        ]}
        label="SORTIE"
      />


      <VehicleFlowMarker
        position={[
          -17,
          0.043,
          -11,
        ]}
        direction="up"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[
          -17,
          0.043,
          -3,
        ]}
        direction="up"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[
          -17,
          0.043,
          6,
        ]}
        direction="up"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[
          -10,
          0.043,
          16,
        ]}
        direction="right"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[
          0,
          0.043,
          16,
        ]}
        direction="right"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[
          10,
          0.043,
          16,
        ]}
        direction="right"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[
          17,
          0.043,
          8,
        ]}
        direction="down"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[
          17,
          0.043,
          0,
        ]}
        direction="down"
        scale={1.45}
      />

      <VehicleFlowMarker
        position={[
          17,
          0.043,
          -10,
        ]}
        direction="down"
        scale={1.45}
      />


      {uets.map(
        (uet) => (
          <UetArea
            key={uet.id}
            position={
              uet.position
            }
            width={
              uet.width
            }
            depth={
              uet.depth
            }
            label={uet.id}
          />
        ),
      )}


      {montagePoles.map(
        (pole) => {
          const poleId =
            Number(
              pole.id.replace(
                'P-',
                '',
              ),
            )

          return (
            <ProductionStation
              key={pole.id}
              pole={pole}
              selected={
                selectedPoleId ===
                pole.id
              }
              operationalLevel={
                operationalLevelByPoleId.get(
                  poleId,
                )
                ?? 'operational'
              }
              onSelect={
                onPoleSelect
              }
            />
          )
        },
      )}

      <OverheadAssemblyLine />

      <LoweringStation />

      <ProductionHandoff />


      <WheelStockArea />

      <AutomatedCarrier />


      <SeatStockArea />

      <SeatAutomatedCarrier />


      <WorkerAmenities />


      <FireSafetyStations />


      {/* Existing production pedestrian network */}

      <PedestrianPath
        position={[
          -20,
          0.026,
          0,
        ]}
        length={32}
        rotation={
          Math.PI / 2
        }
      />

      <PedestrianPath
        position={[
          20,
          0.026,
          0,
        ]}
        length={32}
        rotation={
          Math.PI / 2
        }
      />

      <PedestrianPath
        position={[
          0,
          0.026,
          19,
        ]}
        length={40}
      />

      {/* Secondary employee route to ENTRÉE amenities */}

      <SecondaryPedestrianPath
        position={[
          -20,
          0.027,
          -21.5,
        ]}
        length={11}
        width={1.05}
        rotation={
          Math.PI / 2
        }
      />


      <SecondaryPedestrianPath
        position={[
          -25.5,
          0.027,
          -27,
        ]}
        length={11}
        width={1.05}
      />


      {/* Office / manager route */}

      <PedestrianPath
        position={[
          26.9,
          0.027,
          11,
        ]}
        length={13.8}
        width={1.05}
      />

      <PedestrianPath
        position={[
          33.75,
          0.027,
          9.5,
        ]}
        length={3.1}
        width={1.05}
        rotation={
          Math.PI / 2
        }
      />

      <PedestrianPath
        position={[
          18.5,
          0.027,
          17.5,
        ]}
        length={4.25}
        width={1.15}
        rotation={
          Math.PI / 4
        }
      />

      <PedestrianPath
        position={[
          -18.5,
          0.027,
          17.5,
        ]}
        length={4.25}
        width={1.15}
        rotation={
          -Math.PI / 4
        }
      />


      <PedestrianPassage
        position={[
          -17,
          0.036,
          4,
        ]}
        rotation={
          Math.PI / 2
        }
        length={5.8}
        width={5}
      />

      <PedestrianPassage
        position={[
          0,
          0.036,
          16,
        ]}
        length={5.8}
        width={5}
      />

      <PedestrianPassage
        position={[
          17,
          0.036,
          4,
        ]}
        rotation={
          Math.PI / 2
        }
        length={5.8}
        width={5}
      />


      <SupervisorBooth
        position={[
          30,
          0,
          8,
        ]}
      />


      <FactoryManager />


      {/* Right production operator */}

      <FactoryWorker
        position={[
          21.1,
          0,
          -7.2,
        ]}
        rotation={
          -Math.PI / 2
        }
        gender="man"
        role="production"
        phaseOffset={0}
        workerId="right-production"
      />


      {/* Left production operator */}

      <FactoryWorker
        position={[
          -21.1,
          0,
          7.2,
        ]}
        rotation={
          Math.PI / 2
        }
        gender="woman"
        role="production"
        phaseOffset={3.4}
        workerId="left-production"
      />


      {/* End-of-line quality operator */}

      <FactoryWorker
        position={[
          20.8,
          0,
          -16.2,
        ]}
        rotation={
          Math.PI
        }
        gender="man"
        role="quality"
        phaseOffset={5.1}
        workerId="quality"
      />


      {/* Wheel logistics operator */}

      <FactoryWorker
        position={[
          -21.4,
          0,
          0,
        ]}
        rotation={
          Math.PI / 2
        }
        gender="man"
        role="material"
        phaseOffset={1.6}
        workerId="wheel-material"
      />


      {/* Upper-line terminal operator */}

      <FactoryWorker
        position={[
          -8.2,
          0,
          20.7,
        ]}
        rotation={
          Math.PI
        }
        gender="woman"
        role="terminal"
        phaseOffset={6.2}
        workerId="terminal"
      />


      {/* Seat-stock operator.
          She loads the second AGV at STOCK SIÈGES. */}

      <FactoryWorker
        position={[
          54.8,
          0,
          21.4,
        ]}
        rotation={0}
        gender="woman"
        role="seat-stock"
        phaseOffset={2.1}
      />


      {/* Seat receiver.
          He takes the seat from the AGV and installs it
          while the vehicle is stopped on the right U branch. */}

      <FactoryWorker
        position={[
          20.6,
          0,
          4.2,
        ]}
        rotation={
          -Math.PI / 2
        }
        gender="man"
        role="seat-install"
        phaseOffset={4.7}
        workerId="seat-install"
      />


      <PostProductionRoad />

      <FinalControlZone />

      <ValidationTrack />

      <ReleaseGate />

      <FinishedVehiclePark />

      <AnimatedFinishedVehicle />


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