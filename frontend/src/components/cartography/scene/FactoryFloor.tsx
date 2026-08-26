import { useMemo } from 'react'
import {
  CanvasTexture,
  NearestFilter,
  RepeatWrapping,
} from 'three'

export function FactoryFloor() {
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas')

    canvas.width = 4
    canvas.height = 4

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Could not create factory floor texture')
    }

    /*
      Two industrial gray tones.

      The difference is intentionally visible,
      but not so strong that the floor competes
      with the yellow production flow.
    */
    const lightGray = '#cfd0ca'
    const darkGray = '#aeb0aa'

    for (let x = 0; x < 4; x += 1) {
      for (let y = 0; y < 4; y += 1) {
        const isDark = (x + y) % 2 === 0

        context.fillStyle = isDark
          ? darkGray
          : lightGray

        context.fillRect(
          x,
          y,
          1,
          1,
        )
      }
    }

    const texture = new CanvasTexture(canvas)

    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping

    /*
      Higher values = smaller/more numerous floor squares.
    */
    texture.repeat.set(15, 15)

    /*
      Prevents the edges of the tiny procedural texture
      from becoming blurry.
    */
    texture.magFilter = NearestFilter

    return texture
  }, [])

  return (
    <group>
      <mesh
        rotation-x={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />

        <meshStandardMaterial
          map={floorTexture}
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>

      {/* Very subtle industrial grid */}
      <gridHelper
        args={[
          60,
          30,
          '#a8aaa4',
          '#c2c3bd',
        ]}
        position={[0, 0.012, 0]}
      />
    </group>
  )
}