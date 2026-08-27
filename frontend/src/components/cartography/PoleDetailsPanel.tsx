import type {
  MachineKind,
} from './scene/factory/MachineVisuals'

import type {
  MachineStatus,
} from './scene/factory/MachineStatus'

import type {
  PoleConfig,
} from './scene/factory/data/montageLayoutData'

interface PoleDetailsPanelProps {
  pole: PoleConfig
  onClose: () => void
}

const MACHINE_LABELS: Record<
  MachineKind,
  string
> = {
  printer: 'Imprimante industrielle',
  tablet: 'Terminal tablette',
  control: 'Armoire de contrôle',
  inspection: 'Écran d’inspection',
  scanner: 'Scanner',
  pc: 'Poste informatique',
}


const STATUS_LABELS: Record<
  MachineStatus,
  string
> = {
  online: 'Opérationnel',
  warning: 'Avertissement',
  fault: 'Défaut',
  offline: 'Hors ligne',
}


export function PoleDetailsPanel({
  pole,
  onClose,
}: PoleDetailsPanelProps) {
  return (
    <aside
      className="pole-details"
      aria-label={`Détails du poteau ${pole.id}`}
    >
      <div className="pole-details__header">
        <div>
          <span className="pole-details__eyebrow">
            POSTE DE PRODUCTION
          </span>

          <h2>{pole.id}</h2>

          <p>{pole.uet}</p>
        </div>

        <button
          className="pole-details__close"
          type="button"
          onClick={onClose}
          aria-label="Fermer les détails"
        >
          ×
        </button>
      </div>


      <div className="pole-details__summary">
        <span>
          Machines
        </span>

        <strong>
          {pole.machines.length}
        </strong>
      </div>


      <div className="pole-details__machines">
        {pole.machines.map((machine) => {
          const status =
            machine.status ?? 'online'

          return (
            <div
              key={machine.id}
              className="pole-machine"
            >
              <div className="pole-machine__identity">
                <span
                  className={`
                    pole-machine__status
                    pole-machine__status--${status}
                  `}
                />

                <div>
                  <strong>
                    {
                      MACHINE_LABELS[
                        machine.kind
                      ]
                    }
                  </strong>

                  <small>
                    {machine.id}
                  </small>
                </div>
              </div>

              <span
                className={`
                  pole-machine__badge
                  pole-machine__badge--${status}
                `}
              >
                {
                  STATUS_LABELS[
                    status
                  ]
                }
              </span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}