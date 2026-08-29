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
        aria-label="Vue générale"
        title="Vue générale"
      >
        <Icon
          name="focus"
          size={19}
        />
      </button>


      <span
        className="map-controls__divider"
      />


      <span
        style={{
          display:
            'inline-flex',

          alignItems:
            'center',

          gap:
            '6px',

          padding:
            '0 10px',

          fontSize:
            '10px',

          fontWeight:
            600,

          letterSpacing:
            '0.02em',

          whiteSpace:
            'nowrap',

          color:
            '#6d716e',
        }}
      >
        <Icon
          name="focus"
          size={13}
        />

        Double-cliquez pour centrer
      </span>
    </div>
  )
}