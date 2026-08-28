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
  TOUCH,
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

const MIN_ZOOM = 72

const MAX_ZOOM = 190

const ZOOM_STEP = 12


/*
 * These bounds still cover the complete
 * useful factory while keeping the target
 * away from large empty exterior areas.
 */
const TARGET_MIN_X = -36

const TARGET_MAX_X = 60

const TARGET_MIN_Z = -27

const TARGET_MAX_Z = 30


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


function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.max(
    minimum,
    Math.min(
      maximum,
      value,
    ),
  )
}


function distanceToZoom(
  distance: number,
) {
  return Math.round(
    clamp(
      (
        DEFAULT_DISTANCE /
        distance
      ) *
      DEFAULT_ZOOM,

      MIN_ZOOM,

      MAX_ZOOM,
    ),
  )
}


function zoomToDistance(
  zoom: number,
) {
  return clamp(
    DEFAULT_DISTANCE /
    (
      clamp(
        zoom,
        MIN_ZOOM,
        MAX_ZOOM,
      ) /
      DEFAULT_ZOOM
    ),

    MIN_DISTANCE,

    MAX_DISTANCE,
  )
}


function constrainView(
  cameraPosition:
    Vector3,

  target:
    Vector3,
) {
  const safeX =
    clamp(
      target.x,
      TARGET_MIN_X,
      TARGET_MAX_X,
    )


  const safeZ =
    clamp(
      target.z,
      TARGET_MIN_Z,
      TARGET_MAX_Z,
    )


  const correctionX =
    safeX -
    target.x


  const correctionZ =
    safeZ -
    target.z


  target.set(
    safeX,
    0,
    safeZ,
  )


  /*
   * Move target and camera together.
   * The viewing direction therefore stays
   * stable instead of snapping.
   */
  cameraPosition.x +=
    correctionX


  cameraPosition.z +=
    correctionZ
}


export function SceneCameraControls({
  command,
  onZoomChange,
}: SceneCameraControlsProps) {
  const controls =
    useRef<OrbitControlsImpl>(
      null,
    )


  const camera =
    useThree(
      (state) =>
        state.camera,
    )


  function handleChange() {
    if (
      !controls.current
    ) {
      return
    }


    constrainView(
      camera.position,

      controls.current.target,
    )


    onZoomChange(
      distanceToZoom(
        camera.position
          .distanceTo(
            controls.current
              .target,
          ),
      ),
    )
  }


  useEffect(() => {
    if (
      controls.current
    ) {
      constrainView(
        camera.position,

        controls.current
          .target,
      )
    }


    onZoomChange(
      distanceToZoom(
        camera.position
          .distanceTo(
            controls.current
              ?.target ??
            DEFAULT_TARGET,
          ),
      ),
    )
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


      controls.current.update()


      onZoomChange(
        DEFAULT_ZOOM,
      )

      return
    }


    constrainView(
      camera.position,
      target,
    )


    const currentZoom =
      distanceToZoom(
        camera.position
          .distanceTo(
            target,
          ),
      )


    const nextZoom =
      clamp(
        currentZoom +
        (
          command.type ===
          'zoom-in'
            ? ZOOM_STEP
            : -ZOOM_STEP
        ),

        MIN_ZOOM,

        MAX_ZOOM,
      )


    const direction =
      camera.position
        .clone()
        .sub(
          target,
        )
        .normalize()


    camera.position
      .copy(
        target,
      )
      .add(
        direction
          .multiplyScalar(
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

      screenSpacePanning={
        false
      }

      panSpeed={0.74}

      rotateSpeed={0.46}

      zoomSpeed={0.8}

      minDistance={
        MIN_DISTANCE
      }

      maxDistance={
        MAX_DISTANCE
      }

      minPolarAngle={0.42}

      maxPolarAngle={
        Math.PI / 2.58
      }

      mouseButtons={{
        LEFT:
          MOUSE.PAN,

        MIDDLE:
          MOUSE.DOLLY,

        RIGHT:
          MOUSE.ROTATE,
      }}

      touches={{
        ONE:
          TOUCH.PAN,

        TWO:
          TOUCH.DOLLY_PAN,
      }}

      target={[
        DEFAULT_TARGET.x,
        DEFAULT_TARGET.y,
        DEFAULT_TARGET.z,
      ]}

      onChange={
        handleChange
      }
    />
  )
}