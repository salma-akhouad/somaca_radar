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

const MIN_ZOOM = 68

const MAX_ZOOM = 195

const ZOOM_STEP = 12


/*
 * Keep the useful factory in reach without
 * letting the target escape into dead space.
 */
const TARGET_MIN_X = -40

const TARGET_MAX_X = 64

const TARGET_MIN_Z = -31

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
   * Correct camera and target together.
   * This preserves the current viewing angle.
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

      /*
       * Laptop/touchpad-friendly controls:
       *
       * left drag  = rotate / change elevation
       * right drag = move the map
       * wheel      = zoom
       */
      mouseButtons={{
        LEFT:
          MOUSE.ROTATE,

        MIDDLE:
          MOUSE.DOLLY,

        RIGHT:
          MOUSE.PAN,
      }}

      touches={{
        ONE:
          TOUCH.ROTATE,

        TWO:
          TOUCH.DOLLY_PAN,
      }}

      screenSpacePanning

      panSpeed={0.82}

      rotateSpeed={0.56}

      zoomSpeed={0.82}

      minDistance={
        MIN_DISTANCE
      }

      maxDistance={
        MAX_DISTANCE
      }

      /*
       * Enough vertical freedom to inspect
       * the factory without reaching a
       * ground-level or upside-down view.
       */
      minPolarAngle={0.26}

      maxPolarAngle={1.24}

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