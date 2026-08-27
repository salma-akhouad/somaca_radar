import {
  Icon,
} from '../common/Icon'


interface MapControlsProps {
  zoom: number
  onZoomIn:() => void
  onZoomOut:() => void
  onReset:() => void
}


export function MapControls({
  zoom,
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

    </div>
  )
}