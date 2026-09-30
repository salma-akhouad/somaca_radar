import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'

import {
  ApiError,
  getEtatUsine,
} from '../api/client'
import type {
  EtatUsine,
  EtatUsineTrendPoint,
  IncidentSeverity,
} from '../api/types'
import {
  useOperations,
} from '../operations/OperationsContext'

import '../styles/etat-usine.css'


type Point = {
  x: number
  y: number
}


type MachineStateKey =
  | 'operational'
  | 'attention'
  | 'critical'
  | 'unknown'


function stateClassName(
  label: string | null,
) {
  const value =
    (label ?? '')
      .trim()
      .toLowerCase()

  if (value.includes('crit')) {
    return 'critical'
  }

  if (value.includes('attention')) {
    return 'attention'
  }

  if (value.includes('inconnu')) {
    return 'unknown'
  }

  return 'operational'
}


function severityLabel(
  severity: IncidentSeverity | null,
) {
  if (!severity) {
    return 'Aucun incident actif'
  }

  return {
    mineur: 'Mineure',
    majeur: 'Majeure',
    critique: 'Critique',
  }[severity]
}


function plural(
  value: number,
  singular: string,
  pluralForm = `${singular}s`,
) {
  return value === 1
    ? singular
    : pluralForm
}


function buildSmoothPath(
  points: Point[],
) {
  if (points.length === 0) {
    return ''
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`
  }

  let path =
    `M ${points[0].x} ${points[0].y}`

  for (
    let index = 0;
    index < points.length - 1;
    index += 1
  ) {
    const current = points[index]
    const next = points[index + 1]
    const previous =
      points[index - 1]
      ?? current
    const afterNext =
      points[index + 2]
      ?? next

    const control1X =
      current.x
      + (next.x - previous.x) / 6
    const control1Y =
      current.y
      + (next.y - previous.y) / 6
    const control2X =
      next.x
      - (afterNext.x - current.x) / 6
    const control2Y =
      next.y
      - (afterNext.y - current.y) / 6

    path += (
      ` C ${control1X} ${control1Y}`
      + `, ${control2X} ${control2Y}`
      + `, ${next.x} ${next.y}`
    )
  }

  return path
}


function healthPoints(
  trend: EtatUsineTrendPoint[],
) {
  const left = 42
  const right = 694
  const top = 24
  const bottom = 196

  return trend.map(
    (day, index) => {
      const x =
        left
        + (
          (right - left)
          * index
          / Math.max(
            1,
            trend.length - 1,
          )
        )

      const y =
        bottom
        - (
          day.operational_health
          / 100
        )
        * (bottom - top)

      return {
        x,
        y,
      }
    },
  )
}


function TrendTooltip({
  point,
}: {
  point: EtatUsineTrendPoint
}) {
  const date =
    new Intl.DateTimeFormat(
      'fr-FR',
      {
        day: '2-digit',
        month: 'short',
      },
    ).format(
      new Date(`${point.date}T12:00:00`),
    )

  const totalMachines =
    point.operational
    + point.attention
    + point.critical
    + point.unknown

  return (
    <div className="etat-trend-tooltip">
      <span>
        {date}
      </span>

      <strong>
        {point.operational_health.toFixed(1)} %
      </strong>

      <small>
        {point.operational} / {totalMachines} machines opérationnelles
      </small>

      <small>
        {point.critical} {
          plural(
            point.critical,
            'machine critique',
            'machines critiques',
          )
        }
      </small>

      <small>
        {point.active_incidents} incidents actifs
        {
          point.critical_active_incidents > 0
            ? ` · ${point.critical_active_incidents} critique${point.critical_active_incidents === 1
              ? ''
              : 's'
            }`
            : ''
        }
      </small>
    </div>
  )
}


export function SupervisionPage() {
  const navigate =
    useNavigate()

  const {
    operationsRevision,
  } =
    useOperations()

  const [
    dashboard,
    setDashboard,
  ] = useState<EtatUsine | null>(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<string | null>(null)

  const [
    activeTrendIndex,
    setActiveTrendIndex,
  ] = useState<number | null>(null)


  const loadDashboard =
    useCallback(
      async () => {
        try {
          const result =
            await getEtatUsine()

          setDashboard(result)
          setError(null)
        } catch (requestError) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : (
                'L’état du Montage '
                + 'n’a pas pu être chargé.'
              ),
          )
        } finally {
          setLoading(false)
        }
      },
      [],
    )


  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadDashboard()
        },
        operationsRevision === 0
          ? 0
          : 180,
      )

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    loadDashboard,
    operationsRevision,
  ])


  const points =
    useMemo(
      () =>
        dashboard
          ? healthPoints(
            dashboard.trend,
          )
          : [],
      [dashboard],
    )

  const linePath =
    useMemo(
      () =>
        buildSmoothPath(points),
      [points],
    )

  const areaPath =
    useMemo(
      () => {
        if (
          points.length === 0
          || !linePath
        ) {
          return ''
        }

        const first = points[0]
        const last =
          points[points.length - 1]

        return (
          `${linePath}`
          + ` L ${last.x} 196`
          + ` L ${first.x} 196 Z`
        )
      },
      [linePath, points],
    )


  if (
    loading
    && !dashboard
  ) {
    return (
      <section className="etat-usine etat-usine--loading">
        <div className="etat-usine__loading-mark" />
        <span>
          CHARGEMENT DE L’ÉTAT DU MONTAGE
        </span>
      </section>
    )
  }


  if (!dashboard) {
    return (
      <section className="etat-usine etat-usine--error">
        <strong>
          ÉTAT DU MONTAGE INDISPONIBLE
        </strong>

        <p>
          {
            error
            ?? 'Les données ne sont pas disponibles.'
          }
        </p>

        <button
          type="button"
          onClick={
            () => {
              setLoading(true)
              void loadDashboard()
            }
          }
        >
          RÉESSAYER
        </button>
      </section>
    )
  }


  const summary =
    dashboard.summary

  const activePoint =
    activeTrendIndex === null
      ? null
      : dashboard.trend[
      activeTrendIndex
      ]

  const stateComposition: Array<{
    key: MachineStateKey
    label: string
    value: number
  }> = [
      {
        key: 'operational',
        label: 'Opérationnel',
        value: summary.operational,
      },
      {
        key: 'attention',
        label: 'Attention',
        value: summary.attention,
      },
      {
        key: 'critical',
        label: 'Critique',
        value: summary.critical,
      },
      {
        key: 'unknown',
        label: 'Inconnu',
        value: summary.unknown,
      },
    ]

  const maximumStateCount =
    Math.max(
      1,
      ...stateComposition.map(
        (state) => state.value,
      ),
    )

  return (
    <section className="etat-usine">
      {
        error
        && (
          <div className="etat-usine__refresh-warning">
            {error}
          </div>
        )
      }

            <article className="etat-summary-panel">
        <header className="etat-summary-panel__heading">
          <div>
            <strong>SYNTHÈSE MONTAGE</strong>
            <small>
              Vue instantanée de la santé opérationnelle du Montage
            </small>
          </div>
        </header>

        <div className="etat-summary-layout">
          <div className="etat-summary-health">
            <div className="etat-health-heading">
              <svg
                className="etat-health-signal"
                viewBox="0 0 64 40"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  className="etat-health-signal__track"
                  pathLength="100"
                  d="M3 21 H16 L23 7 L32 34 L40 14 L46 21 H61"
                />
                <path
                  className="etat-health-signal__flow"
                  pathLength="100"
                  d="M3 21 H16 L23 7 L32 34 L40 14 L46 21 H61"
                />
              </svg>

              <span>SANTÉ OPÉRATIONNELLE</span>
            </div>

            <strong>
              {summary.operational_health.toFixed(1)} %
            </strong>
          </div>

          <div className="etat-summary-machines">
            <span>MACHINES SUIVIES</span>
            <strong>{summary.total_machines}</strong>
            <small>équipements du Montage</small>
          </div>

          <div className="etat-state-composition">
            <div className="etat-state-composition__heading">
              <span>ÉTAT DES MACHINES</span>
              <small>Répartition actuelle</small>
            </div>

            <div className="etat-state-composition__columns">
              {stateComposition.map((state) => {
                const pillarHeight = Math.max(
                  13,
                  (state.value / maximumStateCount) * 52,
                )

                return (
                  <div
                    key={state.key}
                    className="etat-state-composition__item"
                    title={`${state.label} : ${state.value}`}
                  >
                    <strong>{state.value}</strong>

                    <span
                      className={
                        `etat-state-pillar etat-state-pillar--${state.key}`
                      }
                      style={{ height: `${pillarHeight}px` }}
                      aria-hidden="true"
                    />

                    <small>{state.label}</small>
                  </div>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            className="etat-summary-incidents"
            onClick={() => navigate('/incidents')}
          >
            <span>INCIDENTS ACTIFS</span>
            <strong>{summary.active_incidents}</strong>
            <small>
              {summary.critical_active_incidents} critique{
                summary.critical_active_incidents === 1 ? '' : 's'
              }
            </small>
            <em>Voir les incidents</em>
          </button>
        </div>
      </article>

      <div className="etat-usine__main-grid">
        <article className="etat-panel etat-trend-panel">
          <header className="etat-section-heading">
            <div>
              <span>
                ÉVOLUTION SUR 7 JOURS
              </span>
              <strong>
                Santé opérationnelle du Montage
              </strong>
              <small>
                Part des machines en état opérationnel
              </small>
            </div>
          </header>

          <div
            className="etat-trend-chart"
            onMouseLeave={
              () => setActiveTrendIndex(null)
            }
          >
            <svg
              viewBox="0 0 736 232"
              role="img"
              aria-label="Évolution de la santé opérationnelle du Montage sur sept jours"
            >
              <defs>
                <linearGradient
                  id="etatTrendArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#74553d"
                    stopOpacity="0.16"
                  />
                  <stop
                    offset="100%"
                    stopColor="#74553d"
                    stopOpacity="0.015"
                  />
                </linearGradient>
              </defs>

              {
                [25, 50, 75, 100].map(
                  (value) => {
                    const y =
                      196
                      - (
                        value
                        / 100
                      )
                      * 172

                    return (
                      <g key={value}>
                        <line
                          x1="42"
                          x2="694"
                          y1={y}
                          y2={y}
                          className="etat-trend-chart__grid"
                        />
                        <text
                          x="8"
                          y={y + 3}
                          className="etat-trend-chart__axis-label"
                        >
                          {value}%
                        </text>
                      </g>
                    )
                  },
                )
              }

              {
                areaPath
                && (
                  <path
                    d={areaPath}
                    className="etat-trend-chart__area"
                  />
                )
              }

              {
                linePath
                && (
                  <path
                    d={linePath}
                    className="etat-trend-chart__line"
                  />
                )
              }

              {
                points.map(
                  (point, index) => (
                    <g
                      key={
                        dashboard.trend[index].date
                      }
                      onMouseEnter={
                        () => setActiveTrendIndex(index)
                      }
                    >
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="18"
                        className="etat-trend-chart__hit"
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={
                          activeTrendIndex === index
                            ? 5.5
                            : 3.5
                        }
                        className={
                          activeTrendIndex === index
                            ? (
                              'etat-trend-chart__point '
                              + 'etat-trend-chart__point--active'
                            )
                            : 'etat-trend-chart__point'
                        }
                      />
                    </g>
                  ),
                )
              }
            </svg>

            <div className="etat-trend-chart__dates">
              {
                dashboard.trend.map(
                  (day) => (
                    <span key={day.date}>
                      {
                        new Intl.DateTimeFormat(
                          'fr-FR',
                          {
                            day: '2-digit',
                            month: 'short',
                          },
                        ).format(
                          new Date(
                            `${day.date}T12:00:00`,
                          ),
                        )
                      }
                    </span>
                  ),
                )
              }
            </div>

            {
              activePoint
              && activeTrendIndex !== null
              && (
                <div
                  className={
                    `etat-trend-chart__tooltip-wrap ${activeTrendIndex === 0
                      ? 'etat-trend-chart__tooltip-wrap--start'
                      : activeTrendIndex === dashboard.trend.length - 1
                        ? 'etat-trend-chart__tooltip-wrap--end'
                        : ''
                    }`
                  }
                  style={{
                    left:
                      `${(
                        activeTrendIndex
                        / Math.max(
                          1,
                          dashboard.trend.length - 1,
                        )
                      ) * 100}%`,
                  }}
                >
                  <TrendTooltip
                    point={activePoint}
                  />
                </div>
              )
            }
          </div>
        </article>


        <article className="etat-panel etat-watch-panel">
          <header className="etat-section-heading etat-section-heading--with-icon">
            <span
              className="etat-section-icon"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="7" />
                <circle cx="12" cy="12" r="2" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </span>

            <div>
              <span>
                SURVEILLANCE MONTAGE
              </span>
              <strong>
                Poteaux à surveiller
              </strong>
              <small>
                Poteaux avec machine non opérationnelle ou incident actif
              </small>
            </div>

            <b>
              {dashboard.watched_poles.length}
            </b>
          </header>

          <div className="etat-watch-list">
            {
              dashboard.watched_poles.length === 0
                ? (
                  <div className="etat-empty-state">
                    Aucun poteau ne nécessite de surveillance actuellement.
                  </div>
                )
                : dashboard.watched_poles.map(
                  (pole) => (
                    <button
                      type="button"
                      key={pole.id_poteau}
                      className="etat-watch-row"
                      onClick={
                        () => navigate(
                          '/cartography',
                          {
                            state: {
                              focusPoleId:
                                pole.id_poteau,
                            },
                          },
                        )
                      }
                    >
                      <span className="etat-watch-row__identity">
                        <strong>
                          {pole.nom_poteau}
                        </strong>
                        <small>
                          {pole.nom_unite}
                        </small>
                      </span>

                      <span className="etat-watch-row__reason">
                        {
                          pole.critical_machines > 0
                            ? `${pole.critical_machines} ${plural(
                              pole.critical_machines,
                              'machine critique',
                              'machines critiques',
                            )}`
                            : pole.attention_machines > 0
                              ? `${pole.attention_machines} ${plural(
                                pole.attention_machines,
                                'machine en attention',
                                'machines en attention',
                              )}`
                              : pole.unknown_machines > 0
                                ? `${pole.unknown_machines} état${pole.unknown_machines === 1
                                  ? ''
                                  : 's'
                                } inconnu${pole.unknown_machines === 1
                                  ? ''
                                  : 's'
                                }`
                                : 'État machine stable'
                        }
                        <small>
                          {pole.active_incidents} incident{
                            pole.active_incidents === 1
                              ? ''
                              : 's'
                          } actif{
                            pole.active_incidents === 1
                              ? ''
                              : 's'
                          }
                        </small>
                      </span>

                      <span className="etat-watch-row__severity">
                        <small>
                          SÉVÉRITÉ MAX.
                        </small>
                        <strong
                          className={
                            pole.highest_severity
                              ? `etat-severity etat-severity--${pole.highest_severity}`
                              : 'etat-severity'
                          }
                        >
                          {severityLabel(
                            pole.highest_severity,
                          )}
                        </strong>
                      </span>

                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M7 4l6 6-6 6" />
                      </svg>
                    </button>
                  ),
                )
            }
          </div>
        </article>
      </div>


      <article className="etat-panel etat-events-panel">
        <header className="etat-section-heading etat-section-heading--with-icon">
          <span
            className="etat-section-icon"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 12h4l2-5 4 10 2-5h6" />
            </svg>
          </span>

          <div>
            <span>
              ACTIVITÉ RÉCENTE
            </span>
            <strong>
              Derniers changements d’état
            </strong>
            <small>
              Évolutions récentes des équipements du Montage
            </small>
          </div>
        </header>

        <div className="etat-events-list">
          {
            dashboard.recent_changes.length === 0
              ? (
                <div className="etat-empty-state">
                  Aucun changement d’état récent.
                </div>
              )
              : dashboard.recent_changes.map(
                (event) => {
                  const currentLevel =
                    stateClassName(
                      event.current_state,
                    )

                  return (
                    <article
                      key={event.id_statut}
                      className="etat-event-row"
                    >
                      <time
                        dateTime={event.changed_at}
                      >
                        {
                          new Intl.DateTimeFormat(
                            'fr-FR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          ).format(
                            new Date(
                              event.changed_at,
                            ),
                          )
                        }
                      </time>

                      <span className="etat-event-row__machine">
                        <strong>
                          {event.pole_name} · {event.machine_name}
                        </strong>
                        <small>
                          {event.unite_name}
                        </small>
                      </span>

                      <span className="etat-event-row__transition">
                        <em>
                          {
                            event.previous_state
                            ?? 'État initial'
                          }
                        </em>

                        <svg
                          viewBox="0 0 24 16"
                          aria-hidden="true"
                        >
                          <path d="M3 8h16M15 4l4 4-4 4" />
                        </svg>

                        <strong
                          className={
                            `etat-state etat-state--${currentLevel}`
                          }
                        >
                          {event.current_state}
                        </strong>
                      </span>

                      <span className="etat-event-row__tail">
                        {
                          event.id_incident !== null
                          && (
                            <small className="etat-event-row__incident">
                              Incident #{String(
                                event.id_incident,
                              ).padStart(4, '0')}
                            </small>
                          )
                        }

                        <button
                          type="button"
                          className="etat-map-link"
                          onClick={
                            () => navigate(
                              '/cartography',
                              {
                                state: {
                                  focusPoleId:
                                    event.id_poteau,
                                  incidentId:
                                    event.id_incident,
                                },
                              },
                            )
                          }
                        >
                          <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path d="M10 18s5-5.1 5-9a5 5 0 10-10 0c0 3.9 5 9 5 9z" />
                            <circle cx="10" cy="9" r="1.8" />
                          </svg>
                          Voir sur la carte
                        </button>
                      </span>
                    </article>
                  )
                },
              )
          }
        </div>
      </article>
    </section>
  )
}
