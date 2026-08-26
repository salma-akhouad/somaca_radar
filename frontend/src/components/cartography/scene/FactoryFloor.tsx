import { useMemo } from 'react'
import {
  CanvasTexture,
  LinearFilter,
  RepeatWrapping,
} from 'three'


export function FactoryFloor() {
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas')

    /*
     * We generate a small concrete texture ourselves.
     *
     * This avoids downloading an external image while still
     * preventing the factory floor from looking perfectly flat.
     */
    canvas.width = 128
    canvas.height = 128

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error(
        'Could not create factory floor texture',
      )
    }


    /* Base industrial concrete */
    context.fillStyle = '#b9bab5'
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height,
    )


    /*
     * Very small variations in the concrete.
     *
     * IMPORTANT:
     * These are NOT tiles.
     *
     * They only create subtle irregularities like a real
     * industrial concrete surface.
     */
    for (let i = 0; i < 650; i += 1) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height

      const brightness =
        158 + Math.floor(Math.random() * 28)

      const alpha =
        0.025 + Math.random() * 0.045

      context.fillStyle =
        `rgba(${brightness}, ${brightness}, ${brightness - 3}, ${alpha})`

      context.fillRect(
        x,
        y,
        1 + Math.random() * 3,
        1 + Math.random() * 3,
      )
    }


    /*
     * Very subtle expansion / construction joints.
     *
     * Real large concrete factory floors are divided into
     * sections. These lines should remain quiet and should
     * NOT compete with safety markings.
     */
    context.strokeStyle =
      'rgba(90, 94, 90, 0.12)'

    context.lineWidth = 1

    context.beginPath()

    context.moveTo(64, 0)
    context.lineTo(64, 128)

    context.moveTo(0, 64)
    context.lineTo(128, 64)

    context.stroke()


    const texture =
      new CanvasTexture(canvas)

    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping

    /*
     * Repeating the texture gives us many concrete sections
     * across the much larger factory.
     */
    texture.repeat.set(10, 7)

    /*
     * Linear filtering softens the procedural texture.
     *
     * The previous NearestFilter emphasized individual pixels
     * and helped create the game-like appearance.
     */
    texture.magFilter = LinearFilter
    texture.minFilter = LinearFilter

    return texture
  }, [])


  return (
    <group>
      {/* =====================================================
          MAIN CONTINUOUS FACTORY FLOOR

          Everything in the cartography scene belongs to this
          same industrial environment.

          We deliberately extend it far beyond the currently
          modelled equipment so the user never encounters a
          sudden "end of factory" during normal navigation.
          ===================================================== */}

      <mesh
        position={[15, -0.025, 0]}
        rotation-x={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry
          args={[
            130,
            100,
          ]}
        />

        <meshStandardMaterial
          map={floorTexture}
          color="#c3c4bf"
          roughness={0.94}
          metalness={0}
        />
      </mesh>


      {/* =====================================================
          SUBTLE STRUCTURAL FLOOR GRID

          This gives scale to the factory without creating the
          old checkerboard appearance.
          ===================================================== */}

      <gridHelper
        args={[
          100,
          20,
          '#9fa19c',
          '#b0b2ad',
        ]}
        position={[
          15,
          0.006,
          0,
        ]}
        scale={[
          1.3,
          1,
          1,
        ]}
      />
    </group>
  )
}