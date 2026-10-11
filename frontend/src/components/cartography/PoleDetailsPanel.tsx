import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'

import {
  reportProblem,
} from '../../api/client'

import type {
  IncidentSeverity,
  IncidentStatus,
} from '../../api/types'

import {
  useAuth,
} from '../../auth/AuthContext'
import {
  useOperations,
} from '../../operations/OperationsContext'
import {
  useSomacaHelperContext,
} from '../../helper/SomacaHelperContext'

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

import {
  createPortal,
} from 'react-dom'

interface PoleDetailsPanelProps {
  pole: PoleConfig
  activeTab: PolePanelTab
  focusedIncidentId: number | null
  onTabChange: (
    tab: PolePanelTab,
  ) => void
  onClose: () => void
}


const MACHINE_LABELS:
  Record<MachineKind, string> = {
  printer:
    'Imprimante industrielle',
  tablet:
    'Terminal tablette',
  control:
    'Armoire de contrôle',
  inspection:
    'Écran d’inspection',
  scanner:
    'Scanner',
  pc:
    'Poste informatique',
}


const INCIDENT_SEVERITY_LABELS:
  Record<
    IncidentSeverity,
    string
  > = {
  mineur:
    'Mineur',
  majeur:
    'Majeur',
  critique:
    'Critique',
}


const INCIDENT_STATUS_LABELS:
  Record<
    IncidentStatus,
    string
  > = {
  ouvert:
    'Ouvert',
  en_cours:
    'En cours',
  en_attente:
    'En attente',
  resolu:
    'Résolu',
  ferme:
    'Fermé',
  annule:
    'Annulé',
}


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
  const normalized =
    stateName
      .trim()
      .toLowerCase()

  if (
    normalized.includes(
      'crit',
    )
  ) {
    return 'fault'
  }

  if (
    normalized.includes(
      'attention',
    )
  ) {
    return 'warning'
  }

  if (
    normalized.includes(
      'inconnu',
    )
  ) {
    return 'offline'
  }

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


function formatDateTime(
  value: string,
) {
  return (
    new Intl.DateTimeFormat(
      'fr-FR',
      {
        day:
          '2-digit',
        month:
          'short',
        hour:
          '2-digit',
        minute:
          '2-digit',
      },
    ).format(
      new Date(value),
    )
  )
}


export function PoleDetailsPanel({
  pole,
  activeTab,
  focusedIncidentId,
  onTabChange,
  onClose,
}: PoleDetailsPanelProps) {
  const navigate =
    useNavigate()

  const {
    user,
  } =
    useAuth()

  const {
    machines,
    incidents,
    statuts,
    etats,
    refresh,
  } =
    useOperations()

  const {
    setCurrentMachineId,
  } =
    useSomacaHelperContext()

  const [
    selectedMachineId,
    setSelectedMachineId,
  ] =
    useState<number | null>(
      null,
    )

  const [
    reportOpen,
    setReportOpen,
  ] =
    useState(false)

  const [
    reportStateId,
    setReportStateId,
  ] =
    useState<number>(0)

  const [
    reportSeverity,
    setReportSeverity,
  ] =
    useState<IncidentSeverity>(
      'majeur',
    )

  const [
    reportProblemText,
    setReportProblemText,
  ] =
    useState('')

  const [
    reportError,
    setReportError,
  ] =
    useState('')

  const [
    reportSuccess,
    setReportSuccess,
  ] =
    useState('')

  const [
    reportSubmitting,
    setReportSubmitting,
  ] =
    useState(false)

  const [
    reportedIncidentId,
    setReportedIncidentId,
  ] =
    useState<number | null>(
      null,
    )

  const poleId =
    Number(
      pole.id.replace(
        'P-',
        '',
      ),
    )

  const canReport =
    user?.role
    === 'administrateur'
    || user?.role
    === 'operateur_de_production'

  const latestStatusByMachine =
    useMemo(
      () => {
        const result =
          new Map<
            number,
            typeof statuts[number]
          >()

        statuts.forEach(
          (status) => {
            const existing =
              result.get(
                status.id_machine,
              )

            if (!existing) {
              result.set(
                status.id_machine,
                status,
              )
              return
            }

            const statusTime =
              new Date(
                status.date_changement,
              ).getTime()

            const existingTime =
              new Date(
                existing.date_changement,
              ).getTime()

            if (
              statusTime
              > existingTime
              || (
                statusTime
                === existingTime
                && status.id_statut
                > existing.id_statut
              )
            ) {
              result.set(
                status.id_machine,
                status,
              )
            }
          },
        )

        return result
      },
      [statuts],
    )

  const etatById =
    useMemo(
      () =>
        new Map(
          etats.map(
            (etat) => [
              etat.id_etat,
              etat,
            ],
          ),
        ),
      [etats],
    )

  const poleMachines =
    useMemo(
      () =>
        machines.filter(
          (machine) =>
            machine.id_poteau
            === poleId,
        ),
      [
        machines,
        poleId,
      ],
    )

  const machineViews =
    useMemo(
      () =>
        poleMachines.map(
          (machine) => {
            const visualMachine =
              pole.machines.find(
                (item) =>
                  item.id
                  === machine.nom_machine,
              )

            const latestStatus =
              latestStatusByMachine.get(
                machine.id_machine,
              )

            const etat =
              latestStatus
                ? etatById.get(
                  latestStatus.id_etat,
                )
                : undefined

            const stateLabel =
              etat?.libelle_etat
              ?? 'Inconnu'

            const status =
              toMachineStatus(
                stateLabel,
              )

            return {
              machine,
              label:
                visualMachine
                  ? MACHINE_LABELS[
                  visualMachine.kind
                  ]
                  : machine.nom_machine,
              latestStatus,
              stateLabel,
              status,
            }
          },
        ),
      [
        poleMachines,
        pole.machines,
        latestStatusByMachine,
        etatById,
      ],
    )

  const selectedView =
    useMemo(
      () =>
        machineViews.find(
          (item) =>
            item.machine.id_machine
            === selectedMachineId,
        )
        ?? null,
      [
        machineViews,
        selectedMachineId,
      ],
    )

  const selectedMachineIncidents =
    useMemo(
      () => {
        if (!selectedMachineId) {
          return []
        }

        return incidents
          .filter(
            (incident) =>
              incident.id_machine
              === selectedMachineId,
          )
          .sort(
            (
              first,
              second,
            ) => {
              const highlightedId =
                reportedIncidentId
                ?? focusedIncidentId

              if (
                first.id_incident
                === highlightedId
              ) {
                return -1
              }

              if (
                second.id_incident
                === highlightedId
              ) {
                return 1
              }

              return (
                new Date(
                  second.created_at,
                ).getTime()
                - new Date(
                  first.created_at,
                ).getTime()
              )
            },
          )
      },
      [
        incidents,
        selectedMachineId,
        focusedIncidentId,
        reportedIncidentId,
      ],
    )

  const reportableStates =
    useMemo(
      () =>
        etats.filter(
          (etat) =>
            etat.libelle_etat
              .trim()
              .toLowerCase()
            !== 'opérationnel',
        ),
      [etats],
    )

  useEffect(() => {
    const focusedIncident =
      focusedIncidentId
        ? incidents.find(
          (incident) =>
            incident.id_incident
            === focusedIncidentId,
        )
        : null

    if (
      focusedIncident
      && poleMachines.some(
        (machine) =>
          machine.id_machine
          === focusedIncident.id_machine,
      )
    ) {
      setSelectedMachineId(
        focusedIncident.id_machine,
      )
      return
    }

    if (
      selectedMachineId
      && poleMachines.some(
        (machine) =>
          machine.id_machine
          === selectedMachineId,
      )
    ) {
      return
    }

    const initialMachine =
      [...machineViews]
        .sort(
          (
            first,
            second,
          ) =>
            machinePriority(
              second.status,
            )
            - machinePriority(
              first.status,
            ),
        )[0]

    setSelectedMachineId(
      initialMachine
        ?.machine.id_machine
      ?? null,
    )
  }, [
    pole.id,
    poleMachines,
    machineViews,
    focusedIncidentId,
    incidents,
    selectedMachineId,
  ])

  useEffect(() => {
    setCurrentMachineId(
      activeTab === 'details'
        ? selectedMachineId
        : null,
    )
  }, [
    activeTab,
    selectedMachineId,
    setCurrentMachineId,
  ])

  useEffect(() => {
    setReportOpen(false)
    setReportError('')
    setReportSuccess('')
    setReportProblemText('')
    setReportedIncidentId(null)
  }, [
    selectedMachineId,
  ])

  useEffect(() => {
    if (!reportSuccess) {
      return
    }

    const timer =
      window.setTimeout(
        () =>
          setReportSuccess(''),
        4000,
      )

    return () =>
      window.clearTimeout(timer)
  }, [reportSuccess])


  useEffect(() => {
    if (!reportError) {
      return
    }

    const timer =
      window.setTimeout(
        () =>
          setReportError(''),
        5000,
      )

    return () =>
      window.clearTimeout(timer)
  }, [reportError])


  function selectMachine(
    machineId: number,
  ) {
    setSelectedMachineId(
      machineId,
    )

    onTabChange(
      'details',
    )
  }

  function openReportForm() {
    if (!selectedView) {
      return
    }

    const currentStateId =
      selectedView.latestStatus
        ?.id_etat

    const currentState =
      currentStateId
        ? etatById.get(
          currentStateId,
        )
        : null

    const currentIsReportable =
      currentState
      && currentState.libelle_etat
        .trim()
        .toLowerCase()
      !== 'opérationnel'

    const attentionState =
      reportableStates.find(
        (etat) =>
          etat.libelle_etat
            .trim()
            .toLowerCase()
          === 'attention requise',
      )

    const initialStateId =
      currentIsReportable
        ? currentState.id_etat
        : (
          attentionState
            ?.id_etat
          ?? reportableStates[0]
            ?.id_etat
          ?? 0
        )

    setReportStateId(
      initialStateId,
    )

    setReportSeverity(
      'majeur',
    )

    setReportProblemText('')
    setReportError('')
    setReportSuccess('')
    setReportOpen(true)
  }

  async function submitReport(
    event:
      React.FormEvent<
        HTMLFormElement
      >,
  ) {
    event.preventDefault()

    if (!selectedView) {
      return
    }

    const problem =
      reportProblemText.trim()

    if (!reportStateId) {
      setReportError(
        'Sélectionnez l’état observé de la machine.',
      )
      return
    }

    if (
      problem.length < 3
    ) {
      setReportError(
        'Décrivez brièvement le problème observé.',
      )
      return
    }

    setReportError('')
    setReportSuccess('')
    setReportSubmitting(true)

    try {
      const result =
        await reportProblem({
          id_machine:
            selectedView.machine.id_machine,
          id_etat:
            reportStateId,
          severity:
            reportSeverity,
          problem,
        })

      setReportedIncidentId(
        result.incident.id_incident,
      )

      setReportOpen(false)
      setReportProblemText('')

      setReportSuccess(
        'Signalement enregistré avec succès.',
      )

      /*
       * WebSockets propagate the committed change to every connected client.
       * This one-shot resync gives the reporting client an immediate,
       * authoritative snapshot without introducing continuous polling.
       */
      void refresh()

      onTabChange(
        'details',
      )
    } catch (
    currentError
    ) {
      setReportError(
        currentError
          instanceof Error
          ? currentError.message
          : (
            'Le signalement n’a pas pu être enregistré. '
            + 'Veuillez réessayer.'
          ),
      )
    } finally {
      setReportSubmitting(false)
    }
  }

  return (
    <aside
      className="pole-details"
      aria-label={
        `Détails du poteau ${pole.id}`
      }
    >
      <div className="pole-details__header">
        <div>
          <span className="pole-details__eyebrow">
            POSTE DE PRODUCTION
          </span>

          <h2>
            {pole.id}
          </h2>

          <p>
            {pole.uet}
          </p>
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
        aria-label={
          `Informations du poteau ${pole.id}`
        }
      >
        <button
          type="button"
          role="tab"
          aria-selected={
            activeTab
            === 'machines'
          }
          className={
            activeTab
              === 'machines'
              ? (
                'pole-details__tab '
                + 'pole-details__tab--active'
              )
              : 'pole-details__tab'
          }
          onClick={
            () =>
              onTabChange(
                'machines',
              )
          }
        >
          Machines
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={
            activeTab
            === 'details'
          }
          className={
            activeTab
              === 'details'
              ? (
                'pole-details__tab '
                + 'pole-details__tab--active'
              )
              : 'pole-details__tab'
          }
          onClick={
            () =>
              onTabChange(
                'details',
              )
          }
        >
          Détails
        </button>
      </div>

      <div className="pole-details__body">
        {
          activeTab
            === 'machines'
            ? (
              <div className="pole-details__machines">
                {
                  machineViews.map(
                    ({
                      machine,
                      label,
                      stateLabel,
                      status,
                    }) => (
                      <button
                        key={
                          machine.id_machine
                        }
                        className="pole-machine pole-machine--selectable"
                        type="button"
                        onClick={
                          () =>
                            selectMachine(
                              machine.id_machine,
                            )
                        }
                      >
                        <div className="pole-machine__identity">
                          <div>
                            <strong>
                              {label}
                            </strong>

                            <small>
                              {machine.nom_machine}
                            </small>
                          </div>
                        </div>

                        <strong
                          className={
                            `pole-machine__state `
                            + `pole-machine__state--${status}`
                          }
                        >
                          {stateLabel}
                        </strong>
                      </button>
                    ),
                  )
                }
              </div>
            )
            : (
              <div className="pole-details__details">
                <section className="pole-details__section pole-machine-selector-section">
                  <div className="pole-section-heading">
                    <div>
                      <span>
                        MACHINE
                      </span>

                      <h3>
                        SÉLECTION
                      </h3>
                    </div>

                    <small>
                      {machineViews.length} équipement(s)
                    </small>
                  </div>

                  <div className="pole-machine-selector">
                    {
                      machineViews.map(
                        ({
                          machine,
                          label,
                          stateLabel,
                          status,
                        }) => {
                          const selected =
                            machine.id_machine
                            === selectedMachineId

                          return (
                            <button
                              key={
                                machine.id_machine
                              }
                              type="button"
                              className={
                                selected
                                  ? (
                                    'pole-machine-selector__item '
                                    + 'pole-machine-selector__item--selected'
                                  )
                                  : 'pole-machine-selector__item'
                              }
                              onClick={
                                () =>
                                  setSelectedMachineId(
                                    machine.id_machine,
                                  )
                              }
                            >
                              <span className="pole-machine-selector__label">
                                {label}
                              </span>

                              <strong>
                                {machine.nom_machine}
                              </strong>

                              <small>
                                {
                                  machine.ip_address
                                  || 'IP non renseignée'
                                }
                              </small>

                              <span
                                className={
                                  `pole-machine-selector__state `
                                  + `pole-machine-selector__state--${status}`
                                }
                              >
                                {stateLabel}
                              </span>
                            </button>
                          )
                        },
                      )
                    }
                  </div>
                </section>

                {
                  selectedView
                  && (
                    <>
                      <section className="pole-details__section">
                        <div className="pole-section-heading">
                          <div>
                            <span>
                              ÉQUIPEMENT SÉLECTIONNÉ
                            </span>

                            <h3>
                              {
                                selectedView.label
                              }
                            </h3>
                          </div>

                          <strong
                            className={
                              `pole-machine__state `
                              + `pole-machine__state--${selectedView.status}`
                            }
                          >
                            {
                              selectedView.stateLabel
                            }
                          </strong>
                        </div>

                        <div className="machine-technical-grid">
                          <div>
                            <span>
                              IDENTIFIANT
                            </span>

                            <strong>
                              {
                                selectedView
                                  .machine
                                  .nom_machine
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              IP
                            </span>

                            <strong>
                              {
                                selectedView
                                  .machine
                                  .ip_address
                                || 'Non renseignée'
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              MAC
                            </span>

                            <strong>
                              {
                                selectedView
                                  .machine
                                  .mac_address
                                || 'Non renseignée'
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              DERNIER CHANGEMENT
                            </span>

                            <strong>
                              {
                                selectedView.latestStatus
                                  ? formatDateTime(
                                    selectedView
                                      .latestStatus
                                      .date_changement,
                                  )
                                  : 'Aucun historique'
                              }
                            </strong>
                          </div>
                        </div>

                      </section>
                      <section className="pole-details__section">
                        <div className="pole-section-heading">
                          <div>
                            <span>
                              SUIVI
                            </span>

                            <h3>
                              INCIDENTS ACTIFS
                            </h3>
                          </div>

                          <strong className="pole-section-count">
                            {
                              selectedMachineIncidents.length
                            }
                          </strong>
                        </div>

                        {
                          selectedMachineIncidents.length
                            === 0
                            ? (
                              <div className="pole-details__empty-state">
                                <strong>
                                  Aucun incident actif
                                </strong>

                                <p>
                                  Aucun traitement en cours pour cette machine.
                                </p>
                              </div>
                            )
                            : (
                              <div className="pole-active-incidents">
                                {
                                  selectedMachineIncidents.map(
                                    (
                                      incident,
                                    ) => {
                                      const highlightedId =
                                        reportedIncidentId
                                        ?? focusedIncidentId

                                      const highlighted =
                                        incident.id_incident
                                        === highlightedId

                                      return (
                                        <article
                                          key={
                                            incident.id_incident
                                          }
                                          className={
                                            highlighted
                                              ? (
                                                'pole-active-incident '
                                                + 'pole-active-incident--focused'
                                              )
                                              : 'pole-active-incident'
                                          }
                                        >
                                          <div className="pole-active-incident__meta">
                                            <strong>
                                              #
                                              {
                                                String(
                                                  incident.id_incident,
                                                ).padStart(
                                                  4,
                                                  '0',
                                                )
                                              }
                                            </strong>

                                            <span>
                                              {
                                                INCIDENT_SEVERITY_LABELS[
                                                incident.severity
                                                ]
                                              }
                                              {' · '}
                                              {
                                                INCIDENT_STATUS_LABELS[
                                                incident.status
                                                ]
                                              }
                                            </span>
                                          </div>

                                          <p className="pole-details__clamp">
                                            {
                                              incident.problem
                                            }
                                          </p>

                                          <button
                                            type="button"
                                            className="pole-details__incident-link"
                                            onClick={
                                              () =>
                                                navigate(
                                                  '/incidents',
                                                  {
                                                    state: {
                                                      incidentId:
                                                        incident.id_incident,
                                                    },
                                                  },
                                                )
                                            }
                                          >
                                            Voir l’incident
                                          </button>
                                        </article>
                                      )
                                    },
                                  )
                                }
                              </div>
                            )
                        }
                      </section>

                      {
                        canReport
                        && (
                          <section className="pole-details__section pole-report-section">

                            {
                              !reportOpen
                                ? (
                                  <div className="pole-report-entry">
                                    <div>
                                      <span>
                                        SIGNALEMENT OPÉRATIONNEL
                                      </span>

                                      <strong>
                                        Anomalie observée sur cette machine ?
                                      </strong>

                                    </div>

                                    <button
                                      type="button"
                                      className="pole-report-trigger"
                                      onClick={
                                        openReportForm
                                      }
                                    >
                                      SIGNALER UN PROBLÈME
                                    </button>
                                  </div>
                                )
                                : (
                                  <form
                                    className="pole-report-form"
                                    onSubmit={
                                      submitReport
                                    }
                                  >
                                    <div className="pole-report-form__header">
                                      <div>
                                        <span>
                                          NOUVEAU SIGNALEMENT
                                        </span>

                                        <strong>
                                          {
                                            selectedView
                                              .machine
                                              .nom_machine
                                          }
                                        </strong>

                                        <small>
                                          {
                                            selectedView
                                              .machine
                                              .ip_address
                                            || 'IP non renseignée'
                                          }
                                        </small>
                                      </div>

                                      <button
                                        type="button"
                                        className="pole-report-form__cancel-icon"
                                        aria-label="Annuler le signalement"
                                        title="Annuler"
                                        onClick={
                                          () => {
                                            setReportOpen(
                                              false,
                                            )
                                            setReportError(
                                              '',
                                            )
                                          }
                                        }
                                      >
                                        <CloseIcon />
                                      </button>
                                    </div>

                                    <div className="pole-report-form__grid">
                                      <label>
                                        <span>
                                          État observé
                                        </span>

                                        <select
                                          value={
                                            reportStateId
                                          }
                                          required
                                          onChange={
                                            (
                                              event,
                                            ) =>
                                              setReportStateId(
                                                Number(
                                                  event.target.value,
                                                ),
                                              )
                                          }
                                        >
                                          {
                                            reportableStates.map(
                                              (
                                                etat,
                                              ) => (
                                                <option
                                                  key={
                                                    etat.id_etat
                                                  }
                                                  value={
                                                    etat.id_etat
                                                  }
                                                >
                                                  {
                                                    etat.libelle_etat
                                                  }
                                                </option>
                                              ),
                                            )
                                          }
                                        </select>
                                      </label>

                                      <label>
                                        <span>
                                          Sévérité initiale
                                        </span>

                                        <select
                                          value={
                                            reportSeverity
                                          }
                                          onChange={
                                            (
                                              event,
                                            ) =>
                                              setReportSeverity(
                                                event.target.value as
                                                IncidentSeverity,
                                              )
                                          }
                                        >
                                          <option value="mineur">
                                            Mineur
                                          </option>

                                          <option value="majeur">
                                            Majeur
                                          </option>

                                          <option value="critique">
                                            Critique
                                          </option>
                                        </select>
                                      </label>
                                    </div>

                                    <label className="pole-report-form__problem">
                                      <span>
                                        Problème observé
                                      </span>

                                      <textarea
                                        rows={4}
                                        maxLength={500}
                                        value={
                                          reportProblemText
                                        }
                                        placeholder="Décrivez précisément ce qui est visible ou constaté sur la machine."
                                        onChange={
                                          (
                                            event,
                                          ) =>
                                            setReportProblemText(
                                              event.target.value,
                                            )
                                        }
                                      />

                                      <small className="pole-report-form__counter">
                                        {reportProblemText.length}/500
                                      </small>

                                    </label>

                                    <div className="pole-report-form__actions">
                                      <button
                                        type="button"
                                        className="pole-report-secondary"
                                        disabled={
                                          reportSubmitting
                                        }
                                        onClick={
                                          () => {
                                            setReportOpen(
                                              false,
                                            )
                                            setReportError(
                                              '',
                                            )
                                          }
                                        }
                                      >
                                        Annuler
                                      </button>

                                      <button
                                        type="submit"
                                        className="pole-report-submit"
                                        disabled={
                                          reportSubmitting
                                          || !reportStateId
                                        }
                                      >
                                        {
                                          reportSubmitting
                                            ? 'ENREGISTREMENT…'
                                            : 'SIGNALER'
                                        }
                                      </button>
                                    </div>
                                  </form>
                                )
                            }
                          </section>
                        )
                      }
                    </>
                  )
                }
              </div>
            )
        }
      </div>

      {
        reportSuccess
        && createPortal(
          <div
            className="report-feedback-toast report-feedback-toast--success"
            role="status"
            aria-live="polite"
          >
            <span className="report-feedback-toast__icon">
              ✓
            </span>

            <strong>
              {reportSuccess}
            </strong>
          </div>,
          document.body,
        )
      }

      {
        reportError
        && createPortal(
          <div
            className="report-feedback-toast report-feedback-toast--error"
            role="alert"
            aria-live="assertive"
          >
            <span className="report-feedback-toast__icon">
              !
            </span>

            <strong>
              {reportError}
            </strong>
          </div>,
          document.body,
        )
      }
    </aside>
  )
}