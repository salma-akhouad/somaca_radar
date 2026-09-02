import { useEffect, useMemo, useState } from 'react'
import {
  createIncident,
  createIncidentContact,
  getIncidentContacts,
  getIncidentHistory,
  getTechnicians,
  updateIncident,
  updateIncidentStatus,
} from '../api/client'
import type {
  ContactType,
  Incident,
  IncidentContact,
  IncidentHistory,
  IncidentSeverity,
  IncidentStatus,
  Technician,
} from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useOperations } from '../operations/OperationsContext'

const STATUS_LABELS: Record<IncidentStatus, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  en_attente: 'En attente',
  resolu: 'Résolu',
  ferme: 'Fermé',
  annule: 'Annulé',
}

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  mineur: 'Mineur',
  majeur: 'Majeur',
  critique: 'Critique',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function isActive(incident: Incident) {
  return !['resolu', 'ferme', 'annule'].includes(incident.status)
}

export function IncidentsPage() {
  const { user } = useAuth()
  const { incidents, machines, refresh } = useOperations()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState<IncidentSeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] =
    useState<IncidentStatus | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [history, setHistory] = useState<IncidentHistory[]>([])
  const [contacts, setContacts] = useState<IncidentContact[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])

  const selected =
    incidents.find((incident) => incident.id_incident === selectedId) ?? null

  const machineById = useMemo(
    () => new Map(machines.map((machine) => [machine.id_machine, machine])),
    [machines],
  )

  const filtered = useMemo(
    () =>
      incidents.filter((incident) => {
        const machine = machineById.get(incident.id_machine)
        const haystack =
          `${incident.problem} ${machine?.nom_machine ?? ''} ${incident.id_incident}`.toLowerCase()

        return (
          haystack.includes(query.trim().toLowerCase()) &&
          (severity === 'all' || incident.severity === severity) &&
          (statusFilter === 'all' || incident.status === statusFilter)
        )
      }),
    [incidents, machineById, query, severity, statusFilter],
  )

  const active = incidents.filter(isActive)
  const criticalCount = active.filter(
    (incident) => incident.severity === 'critique',
  ).length
  const waitingCount = active.filter(
    (incident) => incident.status === 'en_attente',
  ).length

  useEffect(() => {
    if (!selected) {
      setHistory([])
      setContacts([])
      return
    }

    void Promise.all([
      getIncidentHistory(selected.id_incident),
      getIncidentContacts(selected.id_incident),
    ]).then(([nextHistory, nextContacts]) => {
      setHistory(nextHistory)
      setContacts(nextContacts)
    })
  }, [selectedId])

  useEffect(() => {
    void getTechnicians().then(setTechnicians).catch(() => setTechnicians([]))
  }, [])

  const canTreat =
    user?.role === 'administrateur' || user?.role === 'technicien'

  async function reloadSelected() {
    await refresh()
    if (!selectedId) return

    const [nextHistory, nextContacts] = await Promise.all([
      getIncidentHistory(selectedId),
      getIncidentContacts(selectedId),
    ])
    setHistory(nextHistory)
    setContacts(nextContacts)
  }

  return (
    <section className="operations-page">
      <div className="operations-kpis">
        <article className="metric-card">
          <span>INCIDENTS ACTIFS</span>
          <strong>{active.length}</strong>
          <small>Ouverts, en cours ou en attente</small>
        </article>

        <article className="metric-card metric-card--critical">
          <span>CRITIQUES</span>
          <strong>{criticalCount}</strong>
          <small>Intervention prioritaire</small>
        </article>

        <article className="metric-card metric-card--warning">
          <span>EN ATTENTE</span>
          <strong>{waitingCount}</strong>
          <small>Action ou retour attendu</small>
        </article>
      </div>

      <div className="operations-toolbar">
        <input
          placeholder="Rechercher incident, machine, description…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <select
          value={severity}
          onChange={(event) =>
            setSeverity(event.target.value as IncidentSeverity | 'all')
          }
        >
          <option value="all">Toutes les sévérités</option>
          <option value="critique">Critique</option>
          <option value="majeur">Majeur</option>
          <option value="mineur">Mineur</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as IncidentStatus | 'all')
          }
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          className="primary-button"
          type="button"
          onClick={() => setCreateOpen(true)}
        >
          + DÉCLARER UN INCIDENT
        </button>
      </div>

      <div className="incident-workspace">
        <div className="data-panel incident-list-panel">
          <div className="data-panel__header">
            <div>
              <strong>REGISTRE DES INCIDENTS</strong>
              <span>{filtered.length} résultat(s)</span>
            </div>
          </div>

          <div className="incident-table">
            <div className="incident-table__head">
              <span>N°</span>
              <span>MACHINE</span>
              <span>INCIDENT</span>
              <span>SÉVÉRITÉ</span>
              <span>STATUT</span>
              <span>DATE</span>
            </div>

            {filtered.map((incident) => {
              const machine = machineById.get(incident.id_machine)

              return (
                <button
                  type="button"
                  key={incident.id_incident}
                  className={`incident-row ${
                    selectedId === incident.id_incident
                      ? 'incident-row--selected'
                      : ''
                  }`}
                  onClick={() => setSelectedId(incident.id_incident)}
                >
                  <span className="incident-row__id">
                    #{String(incident.id_incident).padStart(4, '0')}
                  </span>

                  <span>
                    <strong>
                      {machine?.nom_machine ??
                        `Machine ${incident.id_machine}`}
                    </strong>
                    <small>ID {incident.id_machine}</small>
                  </span>

                  <span className="incident-row__problem">
                    {incident.problem}
                  </span>

                  <span>
                    <span
                      className={`severity-chip severity-chip--${incident.severity}`}
                    >
                      {SEVERITY_LABELS[incident.severity]}
                    </span>
                  </span>

                  <span>
                    <span
                      className={`status-chip status-chip--${incident.status}`}
                    >
                      {STATUS_LABELS[incident.status]}
                    </span>
                  </span>

                  <span>{formatDate(incident.created_at)}</span>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="incident-detail">
          {!selected ? (
            <div className="incident-detail__empty">
              <strong>Sélectionnez un incident</strong>
              <p>
                Diagnostic, chronologie, contacts et actions apparaîtront ici.
              </p>
            </div>
          ) : (
            <IncidentDetail
              incident={selected}
              machineName={
                machineById.get(selected.id_machine)?.nom_machine ??
                `Machine ${selected.id_machine}`
              }
              history={history}
              contacts={contacts}
              technicians={technicians}
              canTreat={canTreat}
              onRefresh={reloadSelected}
              onClose={() => setSelectedId(null)}
            />
          )}
        </aside>
      </div>

      {createOpen && (
        <CreateIncidentModal
          machines={machines}
          onClose={() => setCreateOpen(false)}
          onCreated={async (incident) => {
            setCreateOpen(false)
            await refresh()
            setSelectedId(incident.id_incident)
          }}
        />
      )}
    </section>
  )
}

function CreateIncidentModal({
  machines,
  onClose,
  onCreated,
}: {
  machines: ReturnType<typeof useOperations>['machines']
  onClose: () => void
  onCreated: (incident: Incident) => Promise<void>
}) {
  const [machineId, setMachineId] = useState(machines[0]?.id_machine ?? 0)
  const [problem, setProblem] = useState('')
  const [severity, setSeverity] = useState<IncidentSeverity>('majeur')
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    try {
      const incident = await createIncident({
        id_machine: Number(machineId),
        problem: problem.trim(),
        severity,
      })
      await onCreated(incident)
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'Création impossible',
      )
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-card__header">
          <div>
            <span>NOUVEAU</span>
            <h2>Déclarer un incident</h2>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <label>
          Machine
          <select
            value={machineId}
            onChange={(event) => setMachineId(Number(event.target.value))}
          >
            {machines.map((machine) => (
              <option key={machine.id_machine} value={machine.id_machine}>
                {machine.nom_machine}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sévérité
          <select
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value as IncidentSeverity)
            }
          >
            <option value="mineur">Mineur</option>
            <option value="majeur">Majeur</option>
            <option value="critique">Critique</option>
          </select>
        </label>

        <label>
          Problème constaté
          <textarea
            required
            rows={5}
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-card__actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Annuler
          </button>
          <button type="submit" className="primary-button">
            CRÉER L’INCIDENT
          </button>
        </div>
      </form>
    </div>
  )
}

function IncidentDetail({
  incident,
  machineName,
  history,
  contacts,
  technicians,
  canTreat,
  onRefresh,
  onClose,
}: {
  incident: Incident
  machineName: string
  history: IncidentHistory[]
  contacts: IncidentContact[]
  technicians: Technician[]
  canTreat: boolean
  onRefresh: () => Promise<void>
  onClose: () => void
}) {
  const [cause, setCause] = useState(incident.confirmed_cause ?? '')
  const [solution, setSolution] = useState(incident.applied_solution ?? '')
  const [contactType, setContactType] =
    useState<ContactType>('technicien')
  const [technicianId, setTechnicianId] =
    useState(technicians[0]?.id_util ?? 0)
  const [externalName, setExternalName] = useState('')

  useEffect(() => {
    setCause(incident.confirmed_cause ?? '')
    setSolution(incident.applied_solution ?? '')
  }, [incident.id_incident, incident.confirmed_cause, incident.applied_solution])

  async function saveDiagnosis() {
    await updateIncident(incident.id_incident, {
      confirmed_cause: cause.trim() || null,
      applied_solution: solution.trim() || null,
    })
    await onRefresh()
  }

  async function changeStatus(next: IncidentStatus) {
    await updateIncidentStatus(incident.id_incident, next)
    await onRefresh()
  }

  async function addContact() {
    if (contactType === 'technicien') {
      await createIncidentContact(incident.id_incident, {
        contact_type: 'technicien',
        id_util: technicianId,
      })
    } else {
      await createIncidentContact(incident.id_incident, {
        contact_type: contactType,
        external_contact_name: externalName.trim(),
      })
    }

    setExternalName('')
    await onRefresh()
  }

  return (
    <>
      <div className="incident-detail__header">
        <div>
          <span>INCIDENT</span>
          <strong>#{String(incident.id_incident).padStart(4, '0')}</strong>
          <small>{machineName}</small>
        </div>
        <button type="button" onClick={onClose}>×</button>
      </div>

      <div className="incident-detail__statusline">
        <span className={`severity-chip severity-chip--${incident.severity}`}>
          {SEVERITY_LABELS[incident.severity]}
        </span>
        <span className={`status-chip status-chip--${incident.status}`}>
          {STATUS_LABELS[incident.status]}
        </span>
      </div>

      <section className="detail-section">
        <h3>PROBLÈME</h3>
        <p>{incident.problem}</p>
      </section>

      {canTreat && (
        <section className="detail-section">
          <h3>TRAITEMENT</h3>

          <div className="status-actions">
            {(
              ['en_cours', 'en_attente', 'resolu', 'ferme'] as IncidentStatus[]
            ).map((status) => (
              <button
                type="button"
                key={status}
                disabled={incident.status === status}
                onClick={() => void changeStatus(status)}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          <label>
            Cause confirmée
            <textarea
              rows={3}
              value={cause}
              onChange={(event) => setCause(event.target.value)}
            />
          </label>

          <label>
            Solution appliquée
            <textarea
              rows={3}
              value={solution}
              onChange={(event) => setSolution(event.target.value)}
            />
          </label>

          <button
            className="primary-button primary-button--small"
            type="button"
            onClick={() => void saveDiagnosis()}
          >
            Enregistrer
          </button>
        </section>
      )}

      <section className="detail-section">
        <h3>CHRONOLOGIE</h3>
        <div className="timeline-list">
          {history.map((entry) => (
            <div className="timeline-entry" key={entry.id_status_change}>
              <span />
              <div>
                <strong>{STATUS_LABELS[entry.status]}</strong>
                <small>{formatDate(entry.changed_at)}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h3>CONTACTS</h3>

        <div className="contact-list">
          {contacts.map((contact) => (
            <div key={contact.id_contact}>
              <strong>{contact.contact_type}</strong>
              <span>
                {contact.external_contact_name ??
                  (contact.id_util ? `Utilisateur #${contact.id_util}` : '—')}
              </span>
              <small>{formatDate(contact.contacted_at)}</small>
            </div>
          ))}
        </div>

        {canTreat && (
          <div className="contact-add">
            <select
              value={contactType}
              onChange={(event) =>
                setContactType(event.target.value as ContactType)
              }
            >
              <option value="technicien">Technicien</option>
              <option value="renault">Support Renault</option>
              <option value="autre">Autre externe</option>
            </select>

            {contactType === 'technicien' ? (
              <select
                value={technicianId}
                onChange={(event) =>
                  setTechnicianId(Number(event.target.value))
                }
              >
                {technicians.map((technician) => (
                  <option
                    key={technician.id_util}
                    value={technician.id_util}
                  >
                    {technician.prenom} {technician.nom}
                  </option>
                ))}
              </select>
            ) : (
              <input
                placeholder="Nom du contact"
                value={externalName}
                onChange={(event) => setExternalName(event.target.value)}
              />
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={() => void addContact()}
            >
              Ajouter
            </button>
          </div>
        )}
      </section>
    </>
  )
}
