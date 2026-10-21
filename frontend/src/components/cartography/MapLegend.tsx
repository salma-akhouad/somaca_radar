import {
  useState,
} from 'react'


const items = [
  [
    'Opérationnel',
    'legend-dot legend-dot--operational',
  ],
  [
    'Attention requise',
    'legend-dot legend-dot--alert',
  ],
  [
    'Critique',
    'legend-dot legend-dot--critical',
  ],
  [
    'Inconnu',
    'legend-dot legend-dot--stopped',
  ],
  [
    'Flux véhicule',
    'legend-flow',
  ],
  [
    'Passage piéton',
    'legend-pedestrian',
  ],
  [
    'Zone restreinte',
    'legend-restricted',
  ],
] as const


export function MapLegend() {
  const [
    open,
    setOpen,
  ] = useState(false)

  return (
    <div className="map-legend">
      <button
        type="button"
        className="legend-trigger"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (value) =>
              !value,
          )
        }
      >
        Légende

        <span>
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div className="legend-panel">
          {items.map(
            ([
              label,
              className,
            ]) => (
              <div
                key={label}
                className="legend-item"
              >
                <span
                  className={
                    className
                  }
                />

                {label}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}