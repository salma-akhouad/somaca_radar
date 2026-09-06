import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import type {
  IncidentSeverity,
  IncidentStatus,
} from '../../api/types'

import { useOperations } from '../../operations/OperationsContext'

import type {
  PolePanelTab,
} from './MapStage'

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
  activeTab: PolePanelTab
  focusedIncidentId: number | null
  onTabChange: (tab: PolePanelTab) => void
  onClose: () => void
}

const MACHINE_LABELS: Record<MachineKind, string> = {
  printer: 'Imprimante industrielle',
  tablet: 'Terminal tablette',
  control: 'Armoire de contrôle',
  inspection: 'Écran d’inspection',
  scanner: 'Scanner',
  pc: 'Poste informatique',
}

const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  mineur: 'Mineur',
  majeur: 'Majeur',
  critique: 'Critique',
}

const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  en_attente: 'En attente',
  resolu: 'Résolu',
  ferme: 'Fermé',
  annule: 'Annulé',
}

const ACTIVE_INCIDENT_STATUSES = new Set<IncidentStatus>([
  'ouvert',
  'en_cours',
  'en_attente',
])

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

function toMachineStatus(
  stateName: string,
): MachineStatus {
  const normalized = stateName.trim().toLowerCase()

  if (
    normalized.includes('crit')
    || normalized.includes('panne')
  ) return 'fault'

  if (
    normalized.includes('attention')
    || normalized.includes('aler')
    || normalized.includes('dégrad')
    || normalized.includes('degrad')
  ) return 'warning'

  if (
    normalized.includes('inconnu')
    || normalized.includes('offline')
  ) return 'offline'

  return 'online'
}

function machinePriority(
  status: MachineStatus,
) {
  return {
    online: 0,
    offline: 1,
    warning: 2,
    fault: 3,
  }[status]
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function PoleDetailsPanel({
  pole,
  activeTab,
  focusedIncidentId,
  onTabChange,
  onClose,
}: PoleDetailsPanelProps) {
  const navigate = useNavigate()

  const {
    machines,
    incidents,
    statuts,
    etats,
  } = useOperations()

  const poleId = Number(
    pole.id.replace('P-', ''),
  )

  const latestStatusByMachine = useMemo(() => {
    const result = new Map<number, typeof statuts[number]>()

    statuts.forEach((status) => {
      const existing = result.get(status.id_machine)

      if (
        !existing
        || new Date(status.date_changement).getTime()
          > new Date(existing.date_changement).getTime()
      ) {
        result.set(status.id_machine, status)
      }
    })

    return result
  }, [statuts])

  const etatById = useMemo(
    () => new Map(
      etats.map((etat) => [etat.id_etat, etat]),
    ),
    [etats],
  )

  const poleMachines = useMemo(
    () => machines.filter(
      (machine) => machine.id_poteau === poleId,
    ),
    [machines, poleId],
  )

  const machineViews = useMemo(
    () => poleMachines
      .map((machine) => {
        const visualMachine = pole.machines.find(
          (item) => item.id === machine.nom_machine,
        )

        const latestStatus = latestStatusByMachine.get(
          machine.id_machine,
        )

        const etat = latestStatus
          ? etatById.get(latestStatus.id_etat)
          : undefined

        const stateLabel = etat?.libelle_etat ?? 'Inconnu'
        const status = toMachineStatus(stateLabel)

        return {
          machine,
          label: visualMachine
            ? MACHINE_LABELS[visualMachine.kind]
            : machine.nom_machine,
          latestStatus,
          stateLabel,
          status,
        }
      }),
    [
      poleMachines,
      pole.machines,
      latestStatusByMachine,
      etatById,
    ],
  )

  const machineIds = useMemo(
    () => new Set(
      poleMachines.map((machine) => machine.id_machine),
    ),
    [poleMachines],
  )

  const activeIncidents = useMemo(
    () => incidents
      .filter(
        (incident) =>
          machineIds.has(incident.id_machine)
          && ACTIVE_INCIDENT_STATUSES.has(incident.status),
      )
      .sort((first, second) => {
        if (first.id_incident === focusedIncidentId) return -1
        if (second.id_incident === focusedIncidentId) return 1

        return (
          new Date(second.created_at).getTime()
          - new Date(first.created_at).getTime()
        )
      }),
    [
      incidents,
      machineIds,
      focusedIncidentId,
    ],
  )

  const currentIssues = machineViews
    .filter(
      (item) => item.status !== 'online',
    )
    .sort(
      (first, second) =>
        machinePriority(second.status)
        - machinePriority(first.status),
    )

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
          title="Fermer"
        >
          <CloseIcon />
        </button>
      </div>

      <div
        className="pole-details__tabs"
        role="tablist"
        aria-label={`Informations du poteau ${pole.id}`}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'machines'}
          className={
            activeTab === 'machines'
              ? 'pole-details__tab pole-details__tab--active'
              : 'pole-details__tab'
          }
          onClick={() => onTabChange('machines')}
        >
          Machines
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'details'}
          className={
            activeTab === 'details'
              ? 'pole-details__tab pole-details__tab--active'
              : 'pole-details__tab'
          }
          onClick={() => onTabChange('details')}
        >
          Détails
        </button>
      </div>

      <div className="pole-details__body">
        {activeTab === 'machines' ? (
          <div className="pole-details__machines">
            {machineViews.map(({
              machine,
              label,
              stateLabel,
              status,
            }) => (
              <div
                key={machine.id_machine}
                className="pole-machine"
              >
                <div className="pole-machine__identity">
                  <div>
                    <strong>{label}</strong>
                    <small>{machine.nom_machine}</small>
                  </div>
                </div>

                <strong
                  className={`pole-machine__state pole-machine__state--${status}`}
                >
                  {stateLabel}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="pole-details__details">
            <section className="pole-details__section">
              <h3>SITUATION ACTUELLE</h3>

              {currentIssues.length === 0 ? (
                <div className="pole-details__healthy">
                  <strong>Aucune anomalie technique signalée</strong>
                  <span>
                    Les machines de ce poste sont actuellement opérationnelles.
                  </span>
                </div>
              ) : (
                <div className="pole-current-issues">
                  {currentIssues.map(({
                    machine,
                    label,
                    stateLabel,
                    status,
                    latestStatus,
                  }) => (
                    <article
                      key={machine.id_machine}
                      className="pole-current-issue"
                    >
                      <div className="pole-current-issue__header">
                        <div>
                          <strong>{label}</strong>
                          <small>{machine.nom_machine}</small>
                        </div>

                        <strong
                          className={`pole-machine__state pole-machine__state--${status}`}
                        >
                          {stateLabel}
                        </strong>
                      </div>

                      <div className="pole-current-issue__field">
                        <span>Problème signalé</span>
                        <p className="pole-details__clamp">
                          {latestStatus?.description_probleme
                            || 'Aucun détail supplémentaire signalé.'}
                        </p>
                      </div>

                      {latestStatus && (
                        <small className="pole-current-issue__time">
                          Dernière mise à jour · {formatDateTime(
                            latestStatus.date_changement,
                          )}
                        </small>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="pole-details__section">
              <h3>INCIDENTS ACTIFS</h3>

              {activeIncidents.length === 0 ? (
                <p className="pole-details__empty-text">
                  Aucun incident actif pour ce poste.
                </p>
              ) : (
                <div className="pole-active-incidents">
                  {activeIncidents.map((incident) => (
                    <article
                      key={incident.id_incident}
                      className={
                        incident.id_incident === focusedIncidentId
                          ? 'pole-active-incident pole-active-incident--focused'
                          : 'pole-active-incident'
                      }
                    >
                      <div className="pole-active-incident__meta">
                        <strong>
                          #{String(incident.id_incident).padStart(4, '0')}
                        </strong>
                        <span>
                          {INCIDENT_SEVERITY_LABELS[incident.severity]}
                          {' · '}
                          {INCIDENT_STATUS_LABELS[incident.status]}
                        </span>
                      </div>

                      <p className="pole-details__clamp">
                        {incident.problem}
                      </p>

                      <button
                        type="button"
                        className="pole-details__incident-link"
                        onClick={() =>
                          navigate('/incidents', {
                            state: {
                              incidentId: incident.id_incident,
                            },
                          })
                        }
                      >
                        Voir l’incident
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </aside>
  )
}
