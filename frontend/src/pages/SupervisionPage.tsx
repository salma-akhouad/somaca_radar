import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOperations } from '../operations/OperationsContext'
import type { Incident } from '../api/types'

function isClosed(incident: Incident) {
  return ['resolu', 'ferme', 'annule'].includes(incident.status)
}

function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string
  value: number
  max: number
  tone: 'amber' | 'red' | 'graphite'
}) {
  const width = max === 0 ? 0 : Math.max(4, Math.round((value / max) * 100))

  return (
    <div className="supervision-bar">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="supervision-bar__track">
        <i
          className={`supervision-bar__fill supervision-bar__fill--${tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export function SupervisionPage() {
  const navigate = useNavigate()
  const { incidents, poleStates, machines } = useOperations()

  const active = incidents.filter((incident) => !isClosed(incident))
  const critical = active.filter(
    (incident) => incident.severity === 'critique',
  ).length
  const resolved = incidents.filter((incident) =>
    ['resolu', 'ferme'].includes(incident.status),
  ).length
  const resolutionRate =
    incidents.length === 0
      ? 0
      : Math.round((resolved / incidents.length) * 100)

  const operational = poleStates.filter(
    (state) => state.level === 'operational',
  ).length
  const stopped = poleStates.filter(
    (state) => state.level === 'stopped',
  ).length

  const bySeverity = {
    critique: incidents.filter((incident) => incident.severity === 'critique')
      .length,
    majeur: incidents.filter((incident) => incident.severity === 'majeur')
      .length,
    mineur: incidents.filter((incident) => incident.severity === 'mineur')
      .length,
  }

  const maxSeverity = Math.max(1, ...Object.values(bySeverity))

  const lastSevenDays = useMemo(() => {
    const result = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (6 - index))
      return { date, count: 0 }
    })

    incidents.forEach((incident) => {
      const incidentDate = new Date(incident.created_at)
      incidentDate.setHours(0, 0, 0, 0)

      const match = result.find(
        (item) => item.date.getTime() === incidentDate.getTime(),
      )
      if (match) match.count += 1
    })

    return result
  }, [incidents])

  const maxDay = Math.max(1, ...lastSevenDays.map((item) => item.count))
  const affectedPoles = poleStates
    .filter((state) => state.level !== 'operational')
    .sort((first, second) => {
      const priority = { critical: 3, alert: 2, stopped: 1, operational: 0 }
      return priority[second.level] - priority[first.level]
    })

  return (
    <section className="operations-page">
      <div className="operations-kpis operations-kpis--four">
        <article className="metric-card">
          <span>POSTES OPÉRATIONNELS</span>
          <strong>{operational}</strong>
          <small>sur {poleStates.length || 24}</small>
        </article>

        <article className="metric-card metric-card--warning">
          <span>INCIDENTS ACTIFS</span>
          <strong>{active.length}</strong>
          <button type="button" onClick={() => navigate('/incidents')}>
            Ouvrir le registre
          </button>
        </article>

        <article className="metric-card metric-card--critical">
          <span>INCIDENTS CRITIQUES</span>
          <strong>{critical}</strong>
          <small>actifs actuellement</small>
        </article>

        <article className="metric-card">
          <span>TAUX DE RÉSOLUTION</span>
          <strong>{resolutionRate}%</strong>
          <small>{resolved} incident(s) traité(s)</small>
        </article>
      </div>

      <div className="supervision-grid">
        <article className="data-panel supervision-card">
          <div className="data-panel__header">
            <div>
              <strong>INCIDENTS PAR SÉVÉRITÉ</strong>
              <span>Ensemble du registre</span>
            </div>
          </div>

          <Bar
            label="Critique"
            value={bySeverity.critique}
            max={maxSeverity}
            tone="red"
          />
          <Bar
            label="Majeur"
            value={bySeverity.majeur}
            max={maxSeverity}
            tone="amber"
          />
          <Bar
            label="Mineur"
            value={bySeverity.mineur}
            max={maxSeverity}
            tone="graphite"
          />
        </article>

        <article className="data-panel supervision-card">
          <div className="data-panel__header">
            <div>
              <strong>ÉVOLUTION — 7 JOURS</strong>
              <span>Incidents déclarés</span>
            </div>
          </div>

          <div className="mini-histogram">
            {lastSevenDays.map((item) => (
              <div key={item.date.toISOString()}>
                <span>{item.count}</span>
                <i
                  style={{
                    height: `${Math.max(
                      8,
                      (item.count / maxDay) * 100,
                    )}%`,
                  }}
                />
                <small>
                  {new Intl.DateTimeFormat('fr-FR', {
                    weekday: 'short',
                  }).format(item.date)}
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className="data-panel supervision-card supervision-card--wide">
          <div className="data-panel__header">
            <div>
              <strong>ÉTAT DES POSTES</strong>
              <span>Statuts machine + incidents actifs</span>
            </div>
            <span>{machines.length} machines</span>
          </div>

          <div className="state-summary">
            <div>
              <span className="status-dot status-dot--operational" />
              <strong>{operational}</strong>
              <small>Opérationnel</small>
            </div>
            <div>
              <span className="status-dot status-dot--alert" />
              <strong>
                {
                  poleStates.filter((state) => state.level === 'alert').length
                }
              </strong>
              <small>Alerte</small>
            </div>
            <div>
              <span className="status-dot status-dot--critical" />
              <strong>
                {
                  poleStates.filter((state) => state.level === 'critical')
                    .length
                }
              </strong>
              <small>Critique</small>
            </div>
            <div>
              <span className="status-dot status-dot--stopped" />
              <strong>{stopped}</strong>
              <small>Arrêté</small>
            </div>
          </div>
        </article>

        <article className="data-panel supervision-card supervision-card--wide">
          <div className="data-panel__header">
            <div>
              <strong>POSTES IMPACTÉS</strong>
              <span>Localisation des états non nominaux</span>
            </div>
          </div>

          <div className="affected-list">
            {affectedPoles.length === 0 ? (
              <div className="notification-empty">Aucun poste impacté</div>
            ) : (
              affectedPoles.map((state) => (
                <button
                  type="button"
                  key={state.poleId}
                  onClick={() =>
                    navigate('/cartography', {
                      state: {
                        focusPoleId: state.poleId,
                        incidentId: state.incidentId,
                      },
                    })
                  }
                >
                  <span className={`status-dot status-dot--${state.level}`} />
                  <strong>{state.poleName}</strong>
                  <span>{state.message}</span>
                  <small>Voir sur la carte →</small>
                </button>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
