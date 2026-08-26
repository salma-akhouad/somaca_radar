import {
  Icon,
} from '../common/Icon'

import type {
  NavigationMode,
} from './scene/SceneCameraControls'


interface MapControlsProps {
  zoom: number

  navigationMode:
    NavigationMode

  onToggleNavigation:
    () => void

  onZoomIn:
    () => void

  onZoomOut:
    () => void

  onReset:
    () => void
}


export function MapControls({
  zoom,
  navigationMode,
  onToggleNavigation,
  onZoomIn,
  onZoomOut,
  onReset,
}: MapControlsProps) {
  return (
    <div
      className="map-controls"
      aria-label="Contrôles de la cartographie"
    >
      <button
        className="
          map-control-button
          map-control-button--active
          map-navigation-mode
        "
        type="button"
        onClick={
          onToggleNavigation
        }
        title={
          navigationMode === 'pan'
            ? 'Déplacer la carte'
            : 'Changer l’angle de vue'
        }
      >
        <Icon
          name="hand"
          size={19}
        />

        <span>
          {navigationMode === 'pan'
            ? 'DÉPLACER'
            : 'ORIENTER'}
        </span>
      </button>


      <span
        className="map-controls__divider"
      />


      <button
        className="map-control-button"
        type="button"
        onClick={onZoomOut}
        aria-label="Zoom arrière"
      >
        <Icon
          name="minus"
          size={19}
        />
      </button>


      <span
        className="map-controls__zoom"
      >
        {zoom}%
      </span>


      <button
        className="map-control-button"
        type="button"
        onClick={onZoomIn}
        aria-label="Zoom avant"
      >
        <Icon
          name="plus"
          size={19}
        />
      </button>


      <span
        className="map-controls__divider"
      />


      <button
        className="map-control-button"
        type="button"
        onClick={onReset}
        aria-label="Recentrer"
      >
        <Icon
          name="focus"
          size={19}
        />
      </button>


      <button
        className="map-controls__3d"
        type="button"
      >
        3D
      </button>
    </div>
  )
}