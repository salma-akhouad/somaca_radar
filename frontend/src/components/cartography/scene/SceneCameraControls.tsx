import {
  useEffect,
  useRef,
} from 'react'

import {
  OrbitControls,
} from '@react-three/drei'

import {
  useFrame,
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
  | 'focus'
  | 'focus-detail'


export interface CameraCommand {
  type: CameraAction

  id: number

  target?: [
    number,
    number,
  ]
}


interface SceneCameraControlsProps {
  command:
    CameraCommand

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

const FOCUS_ZOOM = 158

const DETAIL_FOCUS_ZOOM = 178

const FOCUS_DURATION = 0.65


const TARGET_MIN_X = -43

const TARGET_MAX_X = 67

const TARGET_MIN_Z = -34

const TARGET_MAX_Z = 33


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


interface FocusAnimation {
  progress: number

  startCamera:
    Vector3

  endCamera:
    Vector3

  startTarget:
    Vector3

  endTarget:
    Vector3
}


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


function smoothStep(
  value: number,
) {
  const t =
    clamp(
      value,
      0,
      1,
    )

  return (
    t *
    t *
    (
      3 -
      2 * t
    )
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


function safeTarget(
  x: number,
  z: number,
) {
  return new Vector3(
    clamp(
      x,
      TARGET_MIN_X,
      TARGET_MAX_X,
    ),

    0,

    clamp(
      z,
      TARGET_MIN_Z,
      TARGET_MAX_Z,
    ),
  )
}


function constrainView(
  cameraPosition:
    Vector3,

  target:
    Vector3,
) {
  const safe =
    safeTarget(
      target.x,
      target.z,
    )


  const correctionX =
    safe.x -
    target.x


  const correctionZ =
    safe.z -
    target.z


  target.copy(
    safe,
  )


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


  const focusAnimation =
    useRef<FocusAnimation | null>(
      null,
    )


  const camera =
    useThree(
      (state) =>
        state.camera,
    )


  function handleChange() {
    if (
      !controls.current ||
      focusAnimation.current
    ) {
      return
    }


    constrainView(
      camera.position,
      controls.current.target,
    )


    onZoomChange(
      distanceToZoom(
        camera.position.distanceTo(
          controls.current.target,
        ),
      ),
    )
  }


  useFrame(
    (
      _state,
      delta,
    ) => {
      if (
        !controls.current ||
        !focusAnimation.current
      ) {
        return
      }


      const animation =
        focusAnimation.current


      animation.progress =
        Math.min(
          1,
          animation.progress +
          delta /
          FOCUS_DURATION,
        )


      const progress =
        smoothStep(
          animation.progress,
        )


      camera.position.lerpVectors(
        animation.startCamera,
        animation.endCamera,
        progress,
      )


      controls.current.target.lerpVectors(
        animation.startTarget,
        animation.endTarget,
        progress,
      )


      controls.current.update()


      onZoomChange(
        distanceToZoom(
          camera.position.distanceTo(
            controls.current.target,
          ),
        ),
      )


      if (
        animation.progress >=
        1
      ) {
        focusAnimation.current =
          null

        controls.current.enabled =
          true
      }
    },
  )


  useEffect(() => {
    if (
      controls.current
    ) {
      constrainView(
        camera.position,
        controls.current.target,
      )
    }


    onZoomChange(
      distanceToZoom(
        camera.position.distanceTo(
          controls.current?.target ??
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
      focusAnimation.current =
        null

      controls.current.enabled =
        true


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


    if (
      (
        command.type ===
          'focus'
        ||
        command.type ===
          'focus-detail'
      )
      &&
      command.target
    ) {
      const endTarget =
        safeTarget(
          command.target[0],
          command.target[1],
        )


      const direction =
        camera.position
          .clone()
          .sub(
            target,
          )
          .normalize()


      const focusZoom =
        command.type ===
          'focus-detail'
          ? DETAIL_FOCUS_ZOOM
          : FOCUS_ZOOM


      /*
       * Keep the user's current viewing direction while choosing
       * a slightly tighter distance for incident-driven focus.
       */
      const endCamera =
        endTarget
          .clone()
          .add(
            direction.multiplyScalar(
              zoomToDistance(
                focusZoom,
              ),
            ),
          )


      focusAnimation.current = {
        progress: 0,

        startCamera:
          camera.position.clone(),

        endCamera,

        startTarget:
          target.clone(),

        endTarget,
      }


      controls.current.enabled =
        false

      return
    }


    constrainView(
      camera.position,
      target,
    )


    const currentZoom =
      distanceToZoom(
        camera.position.distanceTo(
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