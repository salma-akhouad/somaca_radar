import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Canvas,
  useFrame,
} from '@react-three/fiber'

import {
  useLocation,
} from 'react-router-dom'

import {
  AppLoading,
} from '../common/AppLoading'
import {
  MapControls,
} from './MapControls'
import {
  MapLegend,
} from './MapLegend'
import {
  PoleDetailsPanel,
} from './PoleDetailsPanel'
import {
  MontageScene,
} from './scene/MontageScene'

import type {
  CameraAction,
  CameraCommand,
} from './scene/SceneCameraControls'

import {
  montagePoles,
} from './scene/factory/data/montageLayoutData'

import type {
  PoleConfig,
} from './scene/factory/data/montageLayoutData'


export type PolePanelTab =
  | 'machines'
  | 'details'


interface CartographyLocationState {
  focusPoleId?: number | null
  incidentId?: number | null
}


interface MapReadySignalProps {
  onReady: () => void
}


/*
 * useFrame runs as part of the real Three.js render loop.
 * The extra requestAnimationFrame lets the first canvas frame reach the screen
 * before the loading overlay is removed.
 */
function MapReadySignal({
  onReady,
}: MapReadySignalProps) {
  const hasReportedReady =
    useRef(false)

  useFrame(() => {
    if (
      hasReportedReady.current
    ) {
      return
    }

    hasReportedReady.current =
      true

    window.requestAnimationFrame(
      onReady,
    )
  })

  return null
}


export function MapStage() {
  const location =
    useLocation()

  const handledNavigationKey =
    useRef('')

  const [
    mapReady,
    setMapReady,
  ] =
    useState(false)

  const [
    zoom,
    setZoom,
  ] =
    useState(100)

  const [
    command,
    setCommand,
  ] =
    useState<CameraCommand>({
      type: 'none',
      id: 0,
    })

  const [
    selectedPole,
    setSelectedPole,
  ] =
    useState<PoleConfig | null>(
      null,
    )

  const [
    panelTab,
    setPanelTab,
  ] =
    useState<PolePanelTab>(
      'machines',
    )

  const [
    focusedIncidentId,
    setFocusedIncidentId,
  ] =
    useState<number | null>(
      null,
    )


  function sendCameraCommand(
    type: CameraAction,
    target?: [number, number],
  ) {
    setCommand(
      (current) => ({
        type,
        id: current.id + 1,
        target,
      }),
    )
  }


  function clearSelection() {
    setSelectedPole(
      null,
    )

    setPanelTab(
      'machines',
    )

    setFocusedIncidentId(
      null,
    )
  }


  function selectPole(
    pole: PoleConfig,
  ) {
    setSelectedPole(
      pole,
    )

    setPanelTab(
      'machines',
    )

    setFocusedIncidentId(
      null,
    )
  }


  function focusArea(
    x: number,
    z: number,
  ) {
    clearSelection()

    sendCameraCommand(
      'focus',
      [x, z],
    )
  }


  useEffect(() => {
    const state =
      location.state as
        CartographyLocationState
        | null

    const poleId =
      state?.focusPoleId

    if (!poleId) {
      return
    }

    const key =
      `${location.key}-${poleId}-${state?.incidentId ?? 'none'}`

    if (
      handledNavigationKey.current
      === key
    ) {
      return
    }

    handledNavigationKey.current =
      key

    const prototypeId =
      `P-${String(
        poleId,
      ).padStart(
        2,
        '0',
      )}`

    const pole =
      montagePoles.find(
        (item) =>
          item.id
          === prototypeId,
      )

    if (!pole) {
      return
    }

    const incidentId =
      state?.incidentId
      ?? null

    setSelectedPole(
      pole,
    )

    setFocusedIncidentId(
      incidentId,
    )

    setPanelTab(
      incidentId
        ? 'details'
        : 'machines',
    )

    sendCameraCommand(
      incidentId
        ? 'focus-detail'
        : 'focus',
      [
        pole.position[0],
        pole.position[2],
      ],
    )
  }, [
    location.key,
    location.state,
  ])


  return (
    <>
      {
        !mapReady
        && (
          <AppLoading />
        )
      }

      <section
        className="map-stage"
        aria-label="Cartographie 3D Montage"
      >
        <div className="map-stage__canvas">
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{
              position: [
                24,
                24,
                30,
              ],
              fov: 42,
              near: 0.1,
              far: 180,
            }}
            gl={{
              antialias: true,
            }}
            onPointerMissed={
              clearSelection
            }
          >
            <MontageScene
              command={
                command
              }
              onZoomChange={
                setZoom
              }
              selectedPole={
                selectedPole
              }
              onPoleSelect={
                selectPole
              }
              onFloorDoubleClick={
                focusArea
              }
            />

            <MapReadySignal
              onReady={
                () =>
                  setMapReady(
                    true,
                  )
              }
            />
          </Canvas>
        </div>

        <MapLegend />

        {
          selectedPole
          && (
            <PoleDetailsPanel
              pole={
                selectedPole
              }
              activeTab={
                panelTab
              }
              focusedIncidentId={
                focusedIncidentId
              }
              onTabChange={
                setPanelTab
              }
              onClose={
                clearSelection
              }
            />
          )
        }

        <MapControls
          zoom={
            zoom
          }
          onZoomIn={
            () =>
              sendCameraCommand(
                'zoom-in',
              )
          }
          onZoomOut={
            () =>
              sendCameraCommand(
                'zoom-out',
              )
          }
          onReset={
            () =>
              sendCameraCommand(
                'reset',
              )
          }
        />
      </section>
    </>
  )
}