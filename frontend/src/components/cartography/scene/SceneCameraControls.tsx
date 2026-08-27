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


interface SceneCameraControlsProps {
  command: {
    type: CameraAction
    id: number
  }

  onZoomChange:
    (zoom: number) => void
}


const DEFAULT_POSITION =
  new Vector3(
    24,
    24,
    30,
  )

const DEFAULT_TARGET =
  new Vector3(
    10,
    0,
    -2,
  )

const DEFAULT_ZOOM = 100
const MIN_ZOOM = 55
const MAX_ZOOM = 190
const ZOOM_STEP = 10

const TARGET_MIN_X = -40
const TARGET_MAX_X = 64

const TARGET_MIN_Z = -32
const TARGET_MAX_Z = 32


const DEFAULT_DISTANCE =
  DEFAULT_POSITION.distanceTo(
    DEFAULT_TARGET,
  )


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


function clampTarget(
  target: Vector3,
) {
  target.x =
    Math.min(
      TARGET_MAX_X,
      Math.max(
        TARGET_MIN_X,
        target.x,
      ),
    )

  target.z =
    Math.min(
      TARGET_MAX_Z,
      Math.max(
        TARGET_MIN_Z,
        target.z,
      ),
    )

  target.y = 0
}


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
      ) *
      DEFAULT_ZOOM,
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
  onZoomChange,
}: SceneCameraControlsProps) {
  const controls =
    useRef<
      OrbitControlsImpl
    >(null)

  const camera =
    useThree(
      (state) =>
        state.camera,
    )


  function reportZoom() {
    const target =
      controls.current
        ?.target ??
      DEFAULT_TARGET

    if (
      controls.current
    ) {
      clampTarget(
        controls.current
          .target,
      )
    }

    onZoomChange(
      distanceToZoom(
        camera.position
          .distanceTo(
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
      command.type ===
        'none'
    ) {
      return
    }

    const target =
      controls.current.target

    if (
      command.type ===
      'reset'
    ) {
      camera.position.copy(
        DEFAULT_POSITION,
      )

      target.copy(
        DEFAULT_TARGET,
      )

      controls.current
        .update()

      onZoomChange(
        DEFAULT_ZOOM,
      )

      return
    }

    const currentZoom =
      distanceToZoom(
        camera.position
          .distanceTo(
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
        direction
          .multiplyScalar(
            zoomToDistance(
              nextZoom,
            ),
          ),
      )

    controls.current
      .update()

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
      screenSpacePanning={false}
      panSpeed={0.9}
      rotateSpeed={0.62}
      minDistance={
        MIN_DISTANCE
      }
      maxDistance={
        MAX_DISTANCE
      }
      minPolarAngle={0.32}
      maxPolarAngle={
        Math.PI / 2.3
      }
      mouseButtons={{
        LEFT: MOUSE.PAN,
        MIDDLE:
          MOUSE.DOLLY,
        RIGHT:
          MOUSE.ROTATE,
      }}
      target={[
        DEFAULT_TARGET.x,
        DEFAULT_TARGET.y,
        DEFAULT_TARGET.z,
      ]}
      onChange={
        reportZoom
      }
    />
  )
}