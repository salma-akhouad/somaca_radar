import {
  useEffect,
  useRef,
} from 'react'

import {
  OrbitControls,
} from '@react-three/drei'

import {
  useThree,
} from '@react-three/fiber'

import {
  MOUSE,
  Vector3,
} from 'three'

import type {
  OrbitControls as OrbitControlsImpl,
} from 'three-stdlib'


export type CameraAction =
  | 'none'
  | 'zoom-in'
  | 'zoom-out'
  | 'reset'


export type NavigationMode =
  | 'pan'
  | 'rotate'


interface SceneCameraControlsProps {
  command: {
    type: CameraAction
    id: number
  }

  navigationMode: NavigationMode

  onZoomChange: (
    zoom: number
  ) => void
}


const DEFAULT_POSITION =
  new Vector3(
    17,
    17,
    17,
  )


const DEFAULT_ZOOM = 100
const MIN_ZOOM = 70
const MAX_ZOOM = 180
const ZOOM_STEP = 10


const DEFAULT_DISTANCE =
  DEFAULT_POSITION.length()


const MIN_DISTANCE =
  DEFAULT_DISTANCE /
  (
    MAX_ZOOM /
    DEFAULT_ZOOM
  )


const MAX_DISTANCE =
  DEFAULT_DISTANCE /
  (
    MIN_ZOOM /
    DEFAULT_ZOOM
  )


function clampZoom(
  zoom: number,
) {
  return Math.min(
    MAX_ZOOM,
    Math.max(
      MIN_ZOOM,
      zoom,
    ),
  )
}


function clampDistance(
  distance: number,
) {
  return Math.min(
    MAX_DISTANCE,
    Math.max(
      MIN_DISTANCE,
      distance,
    ),
  )
}


function distanceToZoom(
  distance: number,
) {
  return Math.round(
    clampZoom(
      (
        DEFAULT_DISTANCE /
        distance
      ) * DEFAULT_ZOOM,
    ),
  )
}


function zoomToDistance(
  zoom: number,
) {
  return clampDistance(
    DEFAULT_DISTANCE /
    (
      clampZoom(zoom) /
      DEFAULT_ZOOM
    ),
  )
}


export function SceneCameraControls({
  command,
  navigationMode,
  onZoomChange,
}: SceneCameraControlsProps) {
  const controls =
    useRef<OrbitControlsImpl>(
      null,
    )

  const camera =
    useThree(
      (state) => state.camera,
    )


  function reportZoom() {
    const target =
      controls.current?.target ??
      new Vector3()

    onZoomChange(
      distanceToZoom(
        camera.position.distanceTo(
          target,
        ),
      ),
    )
  }


  useEffect(() => {
    reportZoom()
  }, [])


  useEffect(() => {
    if (
      !controls.current ||
      command.type === 'none'
    ) {
      return
    }

    const target =
      controls.current.target


    if (
      command.type === 'reset'
    ) {
      camera.position.copy(
        DEFAULT_POSITION,
      )

      target.set(
        0,
        0,
        0,
      )

      controls.current.update()

      onZoomChange(
        DEFAULT_ZOOM,
      )

      return
    }


    const currentZoom =
      distanceToZoom(
        camera.position.distanceTo(
          target,
        ),
      )


    const nextZoom =
      clampZoom(
        currentZoom +
        (
          command.type ===
          'zoom-in'
            ? ZOOM_STEP
            : -ZOOM_STEP
        ),
      )


    const direction =
      camera.position
        .clone()
        .sub(target)
        .normalize()


    camera.position
      .copy(target)
      .add(
        direction.multiplyScalar(
          zoomToDistance(
            nextZoom,
          ),
        ),
      )


    controls.current.update()

    onZoomChange(
      nextZoom,
    )
  }, [
    command.id,
  ])


  return (
    <OrbitControls
      ref={controls}
      makeDefault

      enableDamping
      dampingFactor={0.08}

      enableZoom
      enablePan
      enableRotate

      screenSpacePanning
      panSpeed={1.15}
      rotateSpeed={0.8}

      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}

      minPolarAngle={0.32}
      maxPolarAngle={
        Math.PI / 2.35
      }

      mouseButtons={{
        LEFT:
          navigationMode === 'pan'
            ? MOUSE.PAN
            : MOUSE.ROTATE,

        MIDDLE:
          MOUSE.DOLLY,

        RIGHT:
          navigationMode === 'pan'
            ? MOUSE.ROTATE
            : MOUSE.PAN,
      }}

      target={[
        0,
        0,
        0,
      ]}

      onChange={
        reportZoom
      }
    />
  )
}