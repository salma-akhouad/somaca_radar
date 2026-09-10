import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import type {
    PointerEvent as ReactPointerEvent,
} from 'react'

import {
    useLocation,
    useNavigate,
} from 'react-router-dom'

import {
    createPortal,
} from 'react-dom'

import {
    createIncidentContact,
    getIncidentContacts,
    getIncidentHistory,
    getIncidentActors,
    getIncidentSeverityHistory,
    getIncidentSummary,
    getIncidentsPage,
    getTechnicians,
    getUnites,
    updateIncident,
    updateIncidentStatus,
} from '../api/client'

import type {
    ContactType,
    Incident,
    IncidentActor,
    IncidentContact,
    IncidentHistory,
    IncidentPage,
    IncidentSeverity,
    IncidentSeverityHistory,
    IncidentStatus,
    IncidentSummary,
    RoleName,
    Technician,
    Unite,
} from '../api/types'

import {
    useAuth,
} from '../auth/AuthContext'
import {
    useOperations,
} from '../operations/OperationsContext'


const STATUS_LABELS:
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


const SEVERITY_LABELS:
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


const CONTACT_LABELS:
    Record<
        ContactType,
        string
    > = {
    technicien:
        'Technicien',
    renault:
        'Support Renault',
    autre:
        'Contact externe',
}

const TEXT_LIMITS = {
    treatment: 1000,
    severityNote: 500,
    adminNote: 500,
    externalContact: 150,
} as const

const DEFAULT_PAGE_SIZE = 25

const EMPTY_PAGE: IncidentPage = {
    items: [],
    total: 0,
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
    total_pages: 1,
}

const EMPTY_SUMMARY: IncidentSummary = {
    active_count: 0,
    critical_active_count: 0,
    waiting_count: 0,
    oldest_active: [],
}

function formatDate(
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
                year:
                    'numeric',
                hour:
                    '2-digit',
                minute:
                    '2-digit',
            },
        ).format(
            new Date(
                value,
            ),
        )
    )
}


function formatIncidentAge(
    value: string,
    now: number,
) {
    const ageMilliseconds =
        Math.max(
            0,
            now
            - new Date(
                value,
            ).getTime(),
        )

    const totalMinutes =
        Math.floor(
            ageMilliseconds
            / 60000,
        )

    const days =
        Math.floor(
            totalMinutes
            / 1440,
        )

    const hours =
        Math.floor(
            (totalMinutes % 1440)
            / 60,
        )

    const minutes =
        totalMinutes % 60

    if (days > 0) {
        return `${days} j ${hours} h`
    }

    if (hours > 0) {
        return `${hours} h ${minutes} min`
    }

    return `${minutes} min`
}


function isActive(
    incident: Incident,
) {
    return (
        incident.status !== 'ferme'
        && incident.status !== 'annule'
    )
}


function technicianTransitions(
    current:
        IncidentStatus,
): IncidentStatus[] {
    switch (current) {
        case 'ouvert':
            return [
                'en_cours',
            ]

        case 'en_cours':
            return [
                'en_attente',
                'resolu',
            ]

        case 'en_attente':
            return [
                'en_cours',
            ]

        default:
            return []
    }
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

function HourglassIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M7 3h10M7 21h10" />
            <path d="M8 3c0 4 1.2 6.2 4 9-2.8 2.8-4 5-4 9" />
            <path d="M16 3c0 4-1.2 6.2-4 9 2.8 2.8 4 5 4 9" />
        </svg>
    )
}

function ChevronIcon({
    open,
}: {
    open: boolean
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={
                open
                    ? 'incident-oldest-toggle__chevron incident-oldest-toggle__chevron--open'
                    : 'incident-oldest-toggle__chevron'
            }
        >
            <path d="m9 5 7 7-7 7" />
        </svg>
    )
}

function IncidentSectionIcon({
    name,
}: {
    name:
    | 'problem'
    | 'treatment'
    | 'history'
    | 'contacts'
}) {
    if (name === 'problem') {
        return (
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M12 3 2.8 20h18.4L12 3Z" />
                <path d="M12 9v4.5" />
                <path d="M12 17h.01" />
            </svg>
        )
    }

    if (name === 'treatment') {
        return (
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="m14 6 4-4 4 4-4 4" />
                <path d="M17 7 7 17" />
                <path d="m3 21 4-1-3-3-1 4Z" />
            </svg>
        )
    }

    if (name === 'history') {
        return (
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />
                <path d="M12 7v5l3 2" />
            </svg>
        )
    }

    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="8"
                r="3"
            />
            <path d="M6.5 20v-2.5a5.5 5.5 0 0 1 11 0V20" />
        </svg>
    )
}

export function IncidentsPage() {
    const location =
        useLocation()

    const navigate =
        useNavigate()

    const {
        user,
    } =
        useAuth()

    const {
        incidents: activeIncidents,
        machines,
        poteaux,
        refresh,
    } =
        useOperations()

    const [
        selectedId,
        setSelectedId,
    ] =
        useState<
            number | null
        >(null)

    const [
        drawerWidth,
        setDrawerWidth,
    ] =
        useState(420)

    const [
        query,
        setQuery,
    ] =
        useState('')

    const [
        debouncedQuery,
        setDebouncedQuery,
    ] =
        useState('')

    const [
        severity,
        setSeverity,
    ] =
        useState<
            IncidentSeverity
            | 'all'
        >('all')

    const [
        statusFilter,
        setStatusFilter,
    ] =
        useState<
            IncidentStatus
            | 'all'
        >('all')

    const [
        page,
        setPage,
    ] =
        useState(1)

    const [
        pageSize,
        setPageSize,
    ] =
        useState(
            DEFAULT_PAGE_SIZE,
        )

    const [
        pageData,
        setPageData,
    ] =
        useState<IncidentPage>(
            EMPTY_PAGE,
        )

    const [
        summary,
        setSummary,
    ] =
        useState<IncidentSummary>(
            EMPTY_SUMMARY,
        )

    const [
        registerLoading,
        setRegisterLoading,
    ] =
        useState(true)

    const [
        registerError,
        setRegisterError,
    ] =
        useState('')

    const [
        oldestOpen,
        setOldestOpen,
    ] =
        useState(false)

    const [
        focusId,
        setFocusId,
    ] =
        useState<
            number | null
        >(null)

    const [
        now,
        setNow,
    ] =
        useState(
            Date.now(),
        )

    const [
        history,
        setHistory,
    ] =
        useState<
            IncidentHistory[]
        >([])

    const [
        severityHistory,
        setSeverityHistory,
    ] =
        useState<
            IncidentSeverityHistory[]
        >([])

    const [
        contacts,
        setContacts,
    ] =
        useState<
            IncidentContact[]
        >([])

    const [
        technicians,
        setTechnicians,
    ] =
        useState<
            Technician[]
        >([])

    const [
        actors,
        setActors,
    ] =
        useState<
            IncidentActor[]
        >([])

    const [
        unites,
        setUnites,
    ] =
        useState<
            Unite[]
        >([])

    const registerRequestRef =
        useRef(0)

    useEffect(() => {
        const timer =
            window.setTimeout(
                () => {
                    setDebouncedQuery(
                        query.trim(),
                    )
                },
                300,
            )

        return () =>
            window.clearTimeout(
                timer,
            )
    }, [query])

    useEffect(() => {
        const timer =
            window.setInterval(
                () =>
                    setNow(
                        Date.now(),
                    ),
                60000,
            )

        return () =>
            window.clearInterval(
                timer,
            )
    }, [])

    useEffect(() => {
        const state =
            location.state as {
                incidentId?:
                number | null
            } | null

        if (
            state?.incidentId
        ) {
            setQuery('')
            setDebouncedQuery('')
            setSeverity('all')
            setStatusFilter('all')
            setPage(1)
            setSelectedId(
                state.incidentId,
            )
            setFocusId(
                state.incidentId,
            )
        }
    }, [
        location.key,
        location.state,
    ])

    useEffect(() => {
        void getTechnicians()
            .then(
                setTechnicians,
            )
            .catch(
                () =>
                    setTechnicians(
                        [],
                    ),
            )

        void getIncidentActors()
            .then(
                setActors,
            )
            .catch(
                () =>
                    setActors(
                        [],
                    ),
            )

        void getUnites()
            .then(
                setUnites,
            )
            .catch(
                () =>
                    setUnites(
                        [],
                    ),
            )
    }, [])

    const machineById =
        useMemo(
            () =>
                new Map(
                    machines.map(
                        (machine) => [
                            machine.id_machine,
                            machine,
                        ],
                    ),
                ),
            [machines],
        )

    const poleById =
        useMemo(
            () =>
                new Map(
                    poteaux.map(
                        (pole) => [
                            pole.id_poteau,
                            pole,
                        ],
                    ),
                ),
            [poteaux],
        )

    const uniteById =
        useMemo(
            () =>
                new Map(
                    unites.map(
                        (unite) => [
                            unite.id_unite,
                            unite,
                        ],
                    ),
                ),
            [unites],
        )

    const selected =
        pageData.items.find(
            (incident) =>
                incident.id_incident
                === selectedId,
        )
        ?? null

    const loadRegister =
        useCallback(
            async (
                requestedFocusId:
                    number | null = null,
            ) => {
                const requestId =
                    ++registerRequestRef.current

                setRegisterLoading(
                    true,
                )
                setRegisterError('')

                try {
                    const result =
                        await getIncidentsPage({
                            page,
                            pageSize,
                            search:
                                debouncedQuery,
                            severity,
                            status:
                                statusFilter,
                            focusId:
                                requestedFocusId,
                        })

                    if (
                        requestId
                        !== registerRequestRef.current
                    ) {
                        return
                    }

                    setPageData(
                        result,
                    )

                    if (
                        result.page
                        !== page
                    ) {
                        setPage(
                            result.page,
                        )
                    }
                } catch (
                currentError
                ) {
                    if (
                        requestId
                        !== registerRequestRef.current
                    ) {
                        return
                    }

                    setRegisterError(
                        currentError
                            instanceof Error
                            ? currentError.message
                            : (
                                'Le registre des incidents '
                                + 'n’a pas pu être chargé.'
                            ),
                    )
                } finally {
                    if (
                        requestId
                        === registerRequestRef.current
                    ) {
                        setRegisterLoading(
                            false,
                        )
                    }
                }
            },
            [
                page,
                pageSize,
                debouncedQuery,
                severity,
                statusFilter,
            ],
        )

    const loadSummary =
        useCallback(
            async () => {
                try {
                    const result =
                        await getIncidentSummary()

                    setSummary(
                        result,
                    )
                } catch {
                    // A register failure is surfaced separately; summary stays non-blocking.
                }
            },
            [],
        )

    useEffect(() => {
        void loadRegister(
            focusId,
        ).finally(
            () => {
                if (focusId) {
                    setFocusId(
                        null,
                    )
                }
            },
        )
    }, [
        loadRegister,
        focusId,
        activeIncidents,
    ])

    useEffect(() => {
        void loadSummary()
    }, [
        loadSummary,
        activeIncidents,
    ])

    useEffect(() => {
        if (!selectedId) {
            return
        }

        const row =
            document.getElementById(
                `incident-row-${selectedId}`,
            )

        row?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    }, [
        selectedId,
        pageData.items,
    ])

    async function loadSelected(
        incidentId: number,
    ) {
        const [
            nextHistory,
            nextSeverityHistory,
            nextContacts,
        ] =
            await Promise.all([
                getIncidentHistory(
                    incidentId,
                ),
                getIncidentSeverityHistory(
                    incidentId,
                ),
                getIncidentContacts(
                    incidentId,
                ),
            ])

        setHistory(
            nextHistory,
        )

        setSeverityHistory(
            nextSeverityHistory,
        )

        setContacts(
            nextContacts,
        )
    }

    useEffect(() => {
        if (!selectedId) {
            setHistory([])
            setSeverityHistory([])
            setContacts([])
            return
        }

        void loadSelected(
            selectedId,
        ).catch(
            () => {
                setHistory([])
                setSeverityHistory([])
                setContacts([])
            },
        )
    }, [
        selectedId,
    ])

    async function refreshSelected() {
        if (!selectedId) {
            return
        }

        await Promise.all([
            loadSelected(
                selectedId,
            ),
            refresh(),
            loadRegister(),
            loadSummary(),
        ])
    }

    function focusIncident(
        incidentId: number,
    ) {
        setOldestOpen(false)
        setQuery('')
        setDebouncedQuery('')
        setSeverity('all')
        setStatusFilter('all')
        setPage(1)
        setSelectedId(
            incidentId,
        )
        setFocusId(
            incidentId,
        )
    }

    function resetRegisterPosition() {
        setSelectedId(null)
        setFocusId(null)
        setPage(1)
    }

    function startDrawerResize(
        event:
            ReactPointerEvent<
                HTMLButtonElement
            >,
    ) {
        event.preventDefault()

        const startX =
            event.clientX

        const startWidth =
            drawerWidth

        function resizeDrawer(
            moveEvent:
                PointerEvent,
        ) {
            const difference =
                startX
                - moveEvent.clientX

            const nextWidth =
                Math.min(
                    600,
                    Math.max(
                        340,
                        startWidth
                        + difference,
                    ),
                )

            setDrawerWidth(
                nextWidth,
            )
        }

        function stopDrawerResize() {
            window.removeEventListener(
                'pointermove',
                resizeDrawer,
            )

            window.removeEventListener(
                'pointerup',
                stopDrawerResize,
            )

            document.body.style
                .userSelect = ''
        }

        document.body.style
            .userSelect = 'none'

        window.addEventListener(
            'pointermove',
            resizeDrawer,
        )

        window.addEventListener(
            'pointerup',
            stopDrawerResize,
        )
    }

    const oldestIncident =
        summary.oldest_active[0]
        ?? null

    return (
        <section className="incident-console">
            <div className="incident-summary">
                <div>
                    <div className="incident-summary__icon incident-summary__icon--active">
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M5 4h14v16H5z" />
                            <path d="M8 8h8M8 12h8M8 16h5" />
                        </svg>
                    </div>

                    <span>
                        INCIDENTS ACTIFS
                    </span>

                    <strong>
                        {summary.active_count}
                    </strong>

                    <small>
                        Ouverts, en cours,
                        en attente ou résolus
                    </small>
                </div>

                <div className="incident-summary__critical">
                    <div className="incident-summary__icon incident-summary__icon--critical">
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M12 3 2.8 20h18.4L12 3Z" />
                            <path d="M12 9v4.5" />
                            <path d="M12 17h.01" />
                        </svg>
                    </div>

                    <span>
                        PRIORITÉ CRITIQUE
                    </span>

                    <strong>
                        {summary.critical_active_count}
                    </strong>

                    <small>
                        Incidents actifs
                        critiques
                    </small>
                </div>

                <div>
                    <div className="incident-summary__icon incident-summary__icon--waiting">
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="9"
                            />

                            <path d="M12 7v5l3 2" />
                        </svg>
                    </div>

                    <span>
                        EN ATTENTE
                    </span>

                    <strong>
                        {summary.waiting_count}
                    </strong>

                    <small>
                        Action ou retour
                        externe attendu
                    </small>
                </div>

                <div className="incident-summary__oldest">
                    <div className="incident-summary__icon incident-summary__icon--oldest">
                        <HourglassIcon />
                    </div>

                    <span>
                        PLUS ANCIEN INCIDENT ACTIF
                    </span>

                    <strong>
                        {
                            oldestIncident
                                ? formatIncidentAge(
                                    oldestIncident.created_at,
                                    now,
                                )
                                : '—'
                        }
                    </strong>

                    <small>
                        {
                            oldestIncident
                                ? `Incident #${String(
                                    oldestIncident.id_incident,
                                ).padStart(4, '0')}`
                                : 'Aucun incident actif'
                        }
                    </small>

                    <button
                        type="button"
                        className="incident-oldest-toggle"
                        disabled={
                            summary.oldest_active.length
                            === 0
                        }
                        aria-expanded={
                            oldestOpen
                        }
                        aria-label="Afficher les incidents actifs les plus anciens"
                        title="Afficher les incidents les plus anciens"
                        onClick={
                            () =>
                                setOldestOpen(
                                    (current) =>
                                        !current,
                                )
                        }
                    >
                        <ChevronIcon
                            open={
                                oldestOpen
                            }
                        />
                    </button>
                </div>
            </div>

            {
                oldestOpen
                && (
                    <section className="incident-oldest-panel">
                        <header>
                            <div>
                                <span>
                                    ANCIENNETÉ DES INCIDENTS ACTIFS
                                </span>

                                <small>
                                    10 plus anciens · du plus ancien au plus récent
                                </small>
                            </div>

                            <strong>
                                {
                                    summary.oldest_active.length
                                } affiché(s)
                            </strong>
                        </header>

                        <div className="incident-oldest-list">
                            {
                                summary.oldest_active.map(
                                    (incident) => (
                                        <button
                                            key={
                                                incident.id_incident
                                            }
                                            type="button"
                                            onClick={
                                                () =>
                                                    focusIncident(
                                                        incident.id_incident,
                                                    )
                                            }
                                        >
                                            <span className="incident-oldest-list__meta">
                                                <strong>
                                                    #{String(
                                                        incident.id_incident,
                                                    ).padStart(
                                                        4,
                                                        '0',
                                                    )}
                                                </strong>

                                                <span>
                                                    {
                                                        STATUS_LABELS[
                                                        incident.status
                                                        ]
                                                    }
                                                </span>

                                                <time>
                                                    {
                                                        formatIncidentAge(
                                                            incident.created_at,
                                                            now,
                                                        )
                                                    }
                                                </time>
                                            </span>

                                            <small>
                                                {
                                                    incident.problem
                                                }
                                            </small>
                                        </button>
                                    ),
                                )
                            }
                        </div>
                    </section>
                )
            }

            <div className="incident-filters">
                <div className="incident-search">
                    <span>
                        RECHERCHE
                    </span>

                    <input
                        type="search"
                        placeholder="Incident, machine, poteau ou description…"
                        value={query}
                        onChange={
                            (event) => {
                                setQuery(
                                    event.target.value,
                                )
                                resetRegisterPosition()
                            }
                        }
                    />
                </div>

                <label>
                    <span>
                        SÉVÉRITÉ
                    </span>

                    <select
                        value={severity}
                        onChange={
                            (event) => {
                                setSeverity(
                                    event.target.value as
                                    IncidentSeverity
                                    | 'all',
                                )
                                resetRegisterPosition()
                            }
                        }
                    >
                        <option value="all">
                            Toutes
                        </option>

                        <option value="critique">
                            Critique
                        </option>

                        <option value="majeur">
                            Majeur
                        </option>

                        <option value="mineur">
                            Mineur
                        </option>
                    </select>
                </label>

                <label>
                    <span>
                        STATUT
                    </span>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={
                            (event) => {
                                setStatusFilter(
                                    event.target.value as
                                    IncidentStatus
                                    | 'all',
                                )
                                resetRegisterPosition()
                            }
                        }
                    >
                        <option value="all">
                            Tous
                        </option>

                        {
                            Object.entries(
                                STATUS_LABELS,
                            ).map(
                                ([
                                    value,
                                    label,
                                ]) => (
                                    <option
                                        key={
                                            value
                                        }
                                        value={
                                            value
                                        }
                                    >
                                        {
                                            label
                                        }
                                    </option>
                                ),
                            )
                        }
                    </select>
                </label>
            </div>

            <div className="incident-workbench">
                <section className="incident-register">
                    <header className="incident-register__header">
                        <div>
                            <span>
                                REGISTRE
                            </span>

                            <strong>
                                INCIDENTS
                            </strong>
                        </div>

                        <small>
                            {
                                pageData.total
                            } résultat(s)
                        </small>
                    </header>

                    <div className="incident-register__columns">
                        <span>
                            N°
                        </span>

                        <span>
                            LOCALISATION
                        </span>

                        <span>
                            PROBLÈME
                        </span>

                        <span>
                            SÉVÉRITÉ
                        </span>

                        <span>
                            STATUT
                        </span>

                        <span>
                            DATE
                        </span>
                    </div>

                    <div className="incident-register__body">
                        {
                            registerLoading
                            && pageData.items.length
                            === 0
                            && (
                                <div className="incident-register__empty">
                                    Chargement du registre…
                                </div>
                            )
                        }

                        {
                            !registerLoading
                            && registerError
                            && (
                                <div className="incident-register__empty incident-register__empty--error">
                                    {registerError}
                                </div>
                            )
                        }

                        {
                            pageData.items.map(
                                (incident) => {
                                    const machine =
                                        machineById.get(
                                            incident.id_machine,
                                        )

                                    const pole =
                                        machine
                                            ? poleById.get(
                                                machine.id_poteau,
                                            )
                                            : undefined

                                    return (
                                        <button
                                            id={
                                                `incident-row-${incident.id_incident}`
                                            }
                                            key={
                                                incident.id_incident
                                            }
                                            type="button"
                                            className={
                                                selectedId
                                                    === incident.id_incident
                                                    ? (
                                                        'incident-register__row '
                                                        + 'incident-register__row--selected'
                                                    )
                                                    : 'incident-register__row'
                                            }
                                            onClick={
                                                () =>
                                                    setSelectedId(
                                                        incident.id_incident,
                                                    )
                                            }
                                        >
                                            <strong className="incident-register__id">
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

                                            <span className="incident-register__location">
                                                <strong>
                                                    {
                                                        pole?.nom_poteau
                                                        ?? 'Poste'
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        machine?.nom_machine
                                                        ?? `Machine ${incident.id_machine}`
                                                    }
                                                </small>
                                            </span>

                                            <span className="incident-register__problem">
                                                {
                                                    incident.problem
                                                }
                                            </span>

                                            <span
                                                className={
                                                    `incident-semantic incident-semantic--severity-${incident.severity}`
                                                }
                                            >
                                                {
                                                    SEVERITY_LABELS[
                                                    incident.severity
                                                    ]
                                                }
                                            </span>

                                            <span
                                                className={
                                                    `incident-semantic incident-semantic--status-${incident.status}`
                                                }
                                            >
                                                {
                                                    STATUS_LABELS[
                                                    incident.status
                                                    ]
                                                }
                                            </span>

                                            <span className="incident-register__date">
                                                {
                                                    formatDate(
                                                        incident.created_at,
                                                    )
                                                }
                                            </span>
                                        </button>
                                    )
                                },
                            )
                        }

                        {
                            !registerLoading
                            && !registerError
                            && pageData.items.length
                            === 0
                            && (
                                <div className="incident-register__empty">
                                    Aucun incident
                                    ne correspond
                                    aux filtres.
                                </div>
                            )
                        }
                    </div>

                    <footer className="incident-register__pagination">
                        <div>
                            <span>
                                LIGNES PAR PAGE
                            </span>

                            <select
                                value={
                                    pageSize
                                }
                                onChange={
                                    (event) => {
                                        setPageSize(
                                            Number(
                                                event.target.value,
                                            ),
                                        )
                                        resetRegisterPosition()
                                    }
                                }
                            >
                                <option value={25}>
                                    25
                                </option>
                                <option value={50}>
                                    50
                                </option>
                                <option value={100}>
                                    100
                                </option>
                            </select>
                        </div>

                        <span>
                            Page {
                                pageData.page
                            } / {
                                pageData.total_pages
                            }
                        </span>

                        <div className="incident-register__pagination-actions">
                            <button
                                type="button"
                                disabled={
                                    registerLoading
                                    || pageData.page <= 1
                                }
                                onClick={
                                    () => {
                                        setSelectedId(null)
                                        setPage(
                                            (current) =>
                                                Math.max(
                                                    1,
                                                    current - 1,
                                                ),
                                        )
                                    }
                                }
                            >
                                PRÉCÉDENT
                            </button>

                            <button
                                type="button"
                                disabled={
                                    registerLoading
                                    || pageData.page
                                    >= pageData.total_pages
                                }
                                onClick={
                                    () => {
                                        setSelectedId(null)
                                        setPage(
                                            (current) =>
                                                current + 1,
                                        )
                                    }
                                }
                            >
                                SUIVANT
                            </button>
                        </div>
                    </footer>
                </section>

                {
                    selected
                    && (
                        <aside
                            className="incident-inspector"
                            style={{
                                width:
                                    `${drawerWidth}px`,
                            }}
                        >
                            <button
                                type="button"
                                className="incident-inspector__resize"
                                aria-label="Redimensionner le détail de l’incident"
                                title="Redimensionner"
                                onPointerDown={
                                    startDrawerResize
                                }
                            />

                            <IncidentDetail
                                incident={
                                    selected
                                }
                                machineName={
                                    machineById
                                        .get(
                                            selected.id_machine,
                                        )
                                        ?.nom_machine
                                    ?? `Machine ${selected.id_machine}`
                                }
                                poleId={
                                    machineById
                                        .get(
                                            selected.id_machine,
                                        )
                                        ?.id_poteau
                                    ?? null
                                }
                                poleName={
                                    (() => {
                                        const machine =
                                            machineById.get(
                                                selected.id_machine,
                                            )

                                        if (!machine) {
                                            return 'Poste non identifié'
                                        }

                                        return (
                                            poleById
                                                .get(
                                                    machine.id_poteau,
                                                )
                                                ?.nom_poteau
                                            ?? `Poteau ${machine.id_poteau}`
                                        )
                                    })()
                                }
                                uniteName={
                                    (() => {
                                        const machine =
                                            machineById.get(
                                                selected.id_machine,
                                            )

                                        if (!machine) {
                                            return 'UET non identifiée'
                                        }

                                        const pole =
                                            poleById.get(
                                                machine.id_poteau,
                                            )

                                        if (!pole) {
                                            return 'UET non identifiée'
                                        }

                                        return (
                                            uniteById
                                                .get(
                                                    pole.id_unite,
                                                )
                                                ?.nom_unite
                                            ?? `UET ${pole.id_unite}`
                                        )
                                    })()
                                }
                                history={
                                    history
                                }
                                severityHistory={
                                    severityHistory
                                }
                                contacts={
                                    contacts
                                }
                                technicians={
                                    technicians
                                }
                                actors={
                                    actors
                                }
                                userRole={
                                    user?.role
                                    ?? null
                                }
                                onRefresh={
                                    refreshSelected
                                }
                                onClose={
                                    () =>
                                        setSelectedId(
                                            null,
                                        )
                                }
                                onLocate={
                                    () => {
                                        const machine =
                                            machineById.get(
                                                selected.id_machine,
                                            )

                                        if (!machine) {
                                            return
                                        }

                                        navigate(
                                            '/cartography',
                                            {
                                                state: {
                                                    focusPoleId:
                                                        machine.id_poteau,
                                                    incidentId:
                                                        selected.id_incident,
                                                },
                                            },
                                        )
                                    }
                                }
                            />
                        </aside>
                    )
                }
            </div>
        </section>
    )
}


function IncidentDetail({
    incident,
    machineName,
    poleId,
    poleName,
    uniteName,
    history,
    severityHistory,
    contacts,
    technicians,
    actors,
    userRole,
    onRefresh,
    onClose,
    onLocate,
}: {
    incident:
    Incident
    machineName:
    string
    poleId:
    number | null
    poleName:
    string
    uniteName:
    string
    history:
    IncidentHistory[]
    severityHistory:
    IncidentSeverityHistory[]
    contacts:
    IncidentContact[]
    technicians:
    Technician[]
    actors:
    IncidentActor[]
    userRole:
    RoleName | null
    onRefresh:
    () => Promise<void>
    onClose:
    () => void
    onLocate:
    () => void
}) {
    const [
        cause,
        setCause,
    ] =
        useState(
            incident
                .confirmed_cause
            ?? '',
        )

    const [
        solution,
        setSolution,
    ] =
        useState(
            incident
                .applied_solution
            ?? '',
        )

    const [
        nextSeverity,
        setNextSeverity,
    ] =
        useState<
            IncidentSeverity
        >(
            incident.severity,
        )

    const [
        severityNote,
        setSeverityNote,
    ] =
        useState('')

    const [
        contactType,
        setContactType,
    ] =
        useState<
            ContactType
        >('technicien')

    const [
        technicianId,
        setTechnicianId,
    ] =
        useState(0)

    const [
        externalName,
        setExternalName,
    ] =
        useState('')

    const [
        pendingAdminStatus,
        setPendingAdminStatus,
    ] =
        useState<
            IncidentStatus | null
        >(null)

    const [
        adminNote,
        setAdminNote,
    ] =
        useState('')

    const [
        actionError,
        setActionError,
    ] =
        useState('')

    const [
        actionSuccess,
        setActionSuccess,
    ] =
        useState('')

    const [
        treatmentEditing,
        setTreatmentEditing,
    ] =
        useState(false)

    const [
        actionPending,
        setActionPending,
    ] =
        useState(false)

    const isTechnician =
        userRole
        === 'technicien'

    const isAdmin =
        userRole
        === 'administrateur'

    const canManageContacts =
        isTechnician
        || isAdmin

    const hasTreatment =
        Boolean(
            incident.confirmed_cause
            || incident.applied_solution,
        )

    const treatmentActive =
        incident.status
        === 'en_cours'
        || incident.status
        === 'en_attente'

    const technicianActions =
        isTechnician
            ? technicianTransitions(
                incident.status,
            )
            : []

    const technicianById =
        useMemo(
            () =>
                new Map(
                    technicians.map(
                        (technician) => [
                            technician.id_util,
                            technician,
                        ],
                    ),
                ),
            [technicians],
        )

    const actorById =
        useMemo(
            () =>
                new Map(
                    actors.map(
                        (actor) => [
                            actor.id_util,
                            actor,
                        ],
                    ),
                ),
            [actors],
        )

    function actorName(
        id: number,
    ) {
        const actor =
            actorById.get(
                id,
            )

        if (!actor) {
            return 'Utilisateur inconnu'
        }

        return (
            `${actor.prenom} `
            + actor.nom
        )
    }

    useEffect(() => {
        setCause(
            incident
                .confirmed_cause
            ?? '',
        )

        setSolution(
            incident
                .applied_solution
            ?? '',
        )

        setNextSeverity(
            incident.severity,
        )

        setSeverityNote('')
        setPendingAdminStatus(
            null,
        )
        setAdminNote('')
        setActionError('')
        setActionSuccess('')
        setTreatmentEditing(false)
    }, [
        incident.id_incident,
        incident.confirmed_cause,
        incident.applied_solution,
        incident.severity,
        incident.status,
    ])

    useEffect(() => {
        if (
            technicianId
            === 0
            && technicians.length
            > 0
        ) {
            setTechnicianId(
                technicians[0]
                    .id_util,
            )
        }
    }, [
        technicianId,
        technicians,
    ])

    useEffect(() => {
        if (!actionSuccess) {
            return
        }

        const timer =
            window.setTimeout(
                () =>
                    setActionSuccess(
                        '',
                    ),
                4000,
            )

        return () =>
            window.clearTimeout(
                timer,
            )
    }, [
        actionSuccess,
    ])

    useEffect(() => {
        if (!actionError) {
            return
        }

        const timer =
            window.setTimeout(
                () =>
                    setActionError(
                        '',
                    ),
                5000,
            )

        return () =>
            window.clearTimeout(
                timer,
            )
    }, [
        actionError,
    ])

    async function runAction(
        action:
            () => Promise<void>,
        successMessage:
            string,
    ): Promise<boolean> {
        if (actionPending) {
            return false
        }

        setActionError('')
        setActionSuccess('')
        setActionPending(true)

        try {
            await action()
            await onRefresh()

            setActionSuccess(
                successMessage,
            )

            return true

        } catch (
        currentError
        ) {
            setActionError(
                currentError
                    instanceof Error
                    ? currentError.message
                    : (
                        'L’action n’a pas '
                        + 'pu être effectuée.'
                    ),
            )

            return false

        } finally {
            setActionPending(false)
        }
    }

    async function saveTechnicalData() {
        const saved =
            await runAction(
                async () => {
                    await updateIncident(
                        incident.id_incident,
                        {
                            confirmed_cause:
                                cause.trim()
                                || null,
                            applied_solution:
                                solution.trim()
                                || null,
                        },
                    )
                },
                'Traitement enregistré avec succès.',
            )

        if (saved) {
            setTreatmentEditing(
                false,
            )
        }
    }

    async function saveSeverity() {
        if (
            nextSeverity
            === incident.severity
        ) {
            setActionError(
                'Sélectionnez une sévérité différente.',
            )
            return
        }

        await runAction(
            async () => {
                await updateIncident(
                    incident.id_incident,
                    {
                        severity:
                            nextSeverity,
                        severity_note:
                            severityNote
                                .trim()
                            || null,
                    },
                )

                setSeverityNote('')
            },
            'Sévérité mise à jour.',
        )
    }

    async function changeStatus(
        nextStatus:
            IncidentStatus,
        note?: string,
    ) {
        let successMessage =
            'Statut de l’incident mis à jour.'

        if (
            nextStatus === 'en_cours'
            && incident.status === 'ouvert'
        ) {
            successMessage =
                'Incident pris en charge.'
        } else if (
            nextStatus === 'en_cours'
            && incident.status === 'en_attente'
        ) {
            successMessage =
                'Intervention reprise.'
        } else if (
            nextStatus === 'en_attente'
        ) {
            successMessage =
                'Incident mis en attente.'
        } else if (
            nextStatus === 'resolu'
        ) {
            successMessage =
                'Incident marqué comme résolu.'
        } else if (
            nextStatus === 'ferme'
        ) {
            successMessage =
                'Incident fermé.'
        } else if (
            nextStatus === 'annule'
        ) {
            successMessage =
                'Incident annulé.'
        }

        await runAction(
            async () => {
                await updateIncidentStatus(
                    incident.id_incident,
                    nextStatus,
                    note?.trim()
                    || undefined,
                )
            },
            successMessage,
        )
    }

    async function confirmAdminTransition() {
        if (
            !pendingAdminStatus
        ) {
            return
        }

        if (
            !adminNote.trim()
        ) {
            setActionError(
                'Une justification est obligatoire pour cette action.',
            )
            return
        }

        const status =
            pendingAdminStatus

        await changeStatus(
            status,
            adminNote,
        )

        setPendingAdminStatus(
            null,
        )
        setAdminNote('')
    }

    async function addContact() {
        if (
            contactType
            !== 'technicien'
            && !externalName
                .trim()
        ) {
            setActionError(
                'Renseignez le nom du contact externe.',
            )
            return
        }

        if (
            contactType
            === 'technicien'
            && technicianId
            === 0
        ) {
            setActionError(
                'Sélectionnez un technicien.',
            )
            return
        }

        await runAction(
            async () => {
                if (
                    contactType
                    === 'technicien'
                ) {
                    await createIncidentContact(
                        incident.id_incident,
                        {
                            contact_type:
                                'technicien',
                            id_util:
                                technicianId,
                        },
                    )

                } else {
                    await createIncidentContact(
                        incident.id_incident,
                        {
                            contact_type:
                                contactType,
                            external_contact_name:
                                externalName
                                    .trim(),
                        },
                    )
                }

                setExternalName('')
            },
            'Contact ajouté à l’incident.',
        )
    }

    return (
        <>
            <header className="incident-inspector__header">
                <div>
                    <span>
                        INCIDENT
                    </span>

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

                    <small>
                        {
                            formatDate(
                                incident.created_at,
                            )
                        }
                    </small>
                </div>

                <button
                    type="button"
                    className="incident-inspector__close"
                    onClick={
                        onClose
                    }
                    aria-label="Fermer le détail"
                    title="Fermer"
                >
                    <CloseIcon />
                </button>
            </header>

            <div className="incident-inspector__identity">
                <div>
                    <span>
                        MACHINE
                    </span>

                    <strong>
                        {machineName}
                    </strong>
                </div>

                <div>
                    <span>
                        POSTE
                    </span>

                    <strong>
                        {poleName}
                    </strong>
                </div>

                <div>
                    <span>
                        UET
                    </span>

                    <strong>
                        {uniteName}
                    </strong>
                </div>
            </div>

            <div className="incident-inspector__semantic">
                <div
                    className={
                        `incident-semantic incident-semantic--severity-${incident.severity}`
                    }
                >
                    <span>
                        SÉVÉRITÉ
                    </span>

                    <strong>
                        {
                            SEVERITY_LABELS[
                            incident.severity
                            ]
                        }
                    </strong>
                </div>

                <div
                    className={
                        `incident-semantic incident-semantic--status-${incident.status}`
                    }
                >
                    <span>
                        STATUT
                    </span>

                    <strong>
                        {
                            STATUS_LABELS[
                            incident.status
                            ]
                        }
                    </strong>
                </div>
            </div>

            <button
                type="button"
                className="incident-map-action"
                disabled={
                    poleId === null
                }
                onClick={
                    onLocate
                }
            >
                LOCALISER SUR LA CARTE
            </button>

            <section className="incident-section">
                <div className="incident-section__heading">
                    <IncidentSectionIcon
                        name="problem"
                    />

                    <h3>
                        PROBLÈME OBSERVÉ
                    </h3>
                </div>
                <p className="incident-problem-copy">
                    {
                        incident.problem
                    }
                </p>

                <small className="incident-reporter">
                    Signalé par {
                        actorName(
                            incident.created_by_user_id,
                        )
                    }
                </small>
            </section>

            <section className="incident-section">
                <div className="incident-section__heading">
                    <IncidentSectionIcon
                        name="treatment"
                    />

                    <h3>
                        TRAITEMENT TECHNIQUE
                    </h3>
                </div>

                {
                    isTechnician
                    && technicianActions
                        .length > 0
                    && (
                        <div className="incident-actions">
                            {
                                technicianActions.map(
                                    (
                                        nextStatus,
                                    ) => (
                                        <button
                                            key={
                                                nextStatus
                                            }
                                            type="button"
                                            disabled={
                                                actionPending
                                            }
                                            className={
                                                nextStatus
                                                    === 'resolu'
                                                    ? 'incident-action incident-action--primary'
                                                    : 'incident-action'
                                            }
                                            onClick={
                                                () =>
                                                    void changeStatus(
                                                        nextStatus,
                                                    )
                                            }
                                        >
                                            {
                                                nextStatus
                                                    === 'en_cours'
                                                    && incident.status
                                                    === 'ouvert'
                                                    ? 'Prendre en charge'
                                                    : nextStatus
                                                        === 'en_cours'
                                                        ? 'Reprendre'
                                                        : nextStatus
                                                            === 'en_attente'
                                                            ? 'Mettre en attente'
                                                            : 'Marquer comme résolu'
                                            }
                                        </button>
                                    ),
                                )
                            }
                        </div>
                    )
                }

                {
                    !treatmentEditing
                    && (
                        <div className="incident-treatment-readout">
                            <div>
                                <span>
                                    CAUSE CONFIRMÉE
                                </span>

                                <p>
                                    {
                                        incident
                                            .confirmed_cause
                                        || 'Non renseignée'
                                    }
                                </p>
                            </div>

                            <div>
                                <span>
                                    SOLUTION APPLIQUÉE
                                </span>

                                <p>
                                    {
                                        incident
                                            .applied_solution
                                        || 'Non renseignée'
                                    }
                                </p>
                            </div>
                        </div>
                    )
                }

                {
                    isTechnician
                    && treatmentActive
                    && !treatmentEditing
                    && (
                        <button
                            type="button"
                            className="incident-treatment-toggle"
                            disabled={
                                actionPending
                            }
                            onClick={
                                () =>
                                    setTreatmentEditing(
                                        true,
                                    )
                            }
                        >
                            {
                                hasTreatment
                                    ? 'MODIFIER LE TRAITEMENT'
                                    : 'RENSEIGNER LE TRAITEMENT'
                            }
                        </button>
                    )
                }

                {
                    isTechnician
                    && treatmentActive
                    && treatmentEditing
                    && (
                        <div className="incident-treatment-form">
                            <label>
                                <span>
                                    Cause confirmée
                                </span>

                                <textarea
                                    rows={3}
                                    maxLength={
                                        TEXT_LIMITS.treatment
                                    }
                                    value={
                                        cause
                                    }
                                    onChange={
                                        (event) =>
                                            setCause(
                                                event.target.value,
                                            )
                                    }
                                />

                                <small className="incident-field-counter">
                                    {cause.length}/{
                                        TEXT_LIMITS.treatment
                                    }
                                </small>
                            </label>

                            <label>
                                <span>
                                    Solution appliquée
                                </span>

                                <textarea
                                    rows={3}
                                    maxLength={
                                        TEXT_LIMITS.treatment
                                    }
                                    value={
                                        solution
                                    }
                                    onChange={
                                        (event) =>
                                            setSolution(
                                                event.target.value,
                                            )
                                    }
                                />

                                <small className="incident-field-counter">
                                    {solution.length}/{
                                        TEXT_LIMITS.treatment
                                    }
                                </small>
                            </label>

                            <div className="incident-form-actions">
                                <button
                                    type="button"
                                    className="incident-action"
                                    disabled={
                                        actionPending
                                    }
                                    onClick={
                                        () => {
                                            setCause(
                                                incident
                                                    .confirmed_cause
                                                ?? '',
                                            )

                                            setSolution(
                                                incident
                                                    .applied_solution
                                                ?? '',
                                            )

                                            setTreatmentEditing(
                                                false,
                                            )
                                        }
                                    }
                                >
                                    ANNULER
                                </button>

                                <button
                                    type="button"
                                    className="incident-action incident-action--primary"
                                    disabled={
                                        actionPending
                                    }
                                    onClick={
                                        () =>
                                            void saveTechnicalData()
                                    }
                                >
                                    {
                                        actionPending
                                            ? 'ENREGISTREMENT…'
                                            : 'ENREGISTRER'
                                    }
                                </button>
                            </div>
                        </div>
                    )
                }
            </section>

            {
                isTechnician
                && treatmentActive
                && (
                    <section className="incident-section">
                        <div className="incident-section__heading">
                            <h3>
                                RÉÉVALUER LA SÉVÉRITÉ
                            </h3>
                        </div>

                        <div className="incident-severity-form">
                            <select
                                value={
                                    nextSeverity
                                }
                                onChange={
                                    (event) =>
                                        setNextSeverity(
                                            event
                                                .target
                                                .value as
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

                            <input
                                type="text"
                                maxLength={
                                    TEXT_LIMITS.severityNote
                                }
                                placeholder="Motif du changement, si nécessaire"
                                value={
                                    severityNote
                                }
                                onChange={
                                    (event) =>
                                        setSeverityNote(
                                            event
                                                .target
                                                .value,
                                        )
                                }
                            />

                            <small className="incident-field-counter">
                                {severityNote.length}/{
                                    TEXT_LIMITS.severityNote
                                }
                            </small>

                            <button
                                type="button"
                                className="incident-action"
                                disabled={
                                    actionPending
                                }
                                onClick={
                                    () =>
                                        void saveSeverity()
                                }
                            >
                                APPLIQUER
                            </button>
                        </div>
                    </section>
                )
            }

            {
                isAdmin
                && (
                    <section className="incident-section">
                        <div className="incident-section__heading">
                            <h3>
                                ACTION ADMINISTRATIVE
                            </h3>
                        </div>
                        <div className="incident-actions">
                            {
                                incident.status
                                === 'resolu'
                                && (
                                    <button
                                        type="button"
                                        className="incident-action incident-action--primary"
                                        disabled={
                                            actionPending
                                        }
                                        onClick={
                                            () =>
                                                void changeStatus(
                                                    'ferme',
                                                )
                                        }
                                    >
                                        Fermer l’incident
                                    </button>
                                )
                            }

                            {
                                incident.status
                                === 'resolu'
                                && (
                                    <button
                                        type="button"
                                        className="incident-action"
                                        disabled={
                                            actionPending
                                        }
                                        onClick={
                                            () =>
                                                setPendingAdminStatus(
                                                    'en_cours',
                                                )
                                        }
                                    >
                                        Réouvrir
                                    </button>
                                )
                            }

                            {
                                isActive(
                                    incident,
                                )
                                && (
                                    <button
                                        type="button"
                                        className="incident-action incident-action--danger"
                                        disabled={
                                            actionPending
                                        }
                                        onClick={
                                            () =>
                                                setPendingAdminStatus(
                                                    'annule',
                                                )
                                        }
                                    >
                                        Annuler l’incident
                                    </button>
                                )
                            }
                        </div>

                        {
                            pendingAdminStatus
                            && (
                                <div className="incident-admin-confirm">
                                    <strong>
                                        {
                                            pendingAdminStatus
                                                === 'annule'
                                                ? 'Justification de l’annulation'
                                                : 'Justification de la réouverture'
                                        }
                                    </strong>

                                    <textarea
                                        rows={3}
                                        maxLength={
                                            TEXT_LIMITS.adminNote
                                        }
                                        value={
                                            adminNote
                                        }
                                        onChange={
                                            (event) =>
                                                setAdminNote(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                        }
                                    />

                                    <small className="incident-field-counter">
                                        {adminNote.length}/{
                                            TEXT_LIMITS.adminNote
                                        }
                                    </small>

                                    <div>
                                        <button
                                            type="button"
                                            onClick={
                                                () => {
                                                    setPendingAdminStatus(
                                                        null,
                                                    )
                                                    setAdminNote(
                                                        '',
                                                    )
                                                }
                                            }
                                        >
                                            Annuler
                                        </button>

                                        <button
                                            type="button"
                                            className="incident-action incident-action--primary"
                                            disabled={
                                                actionPending
                                            }
                                            onClick={
                                                () =>
                                                    void confirmAdminTransition()
                                            }
                                        >
                                            CONFIRMER
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </section>
                )
            }

            <section className="incident-section">
                <div className="incident-section__heading">
                    <IncidentSectionIcon
                        name="history"
                    />

                    <h3>
                        CHRONOLOGIE
                    </h3>
                </div>

                <div className="incident-timeline">
                    {
                        history.map(
                            (
                                entry,
                                index,
                            ) => (
                                <article
                                    key={
                                        entry.id_status_change
                                    }
                                >
                                    <div className="incident-timeline__axis">
                                        <i />

                                        {
                                            index
                                            < history.length
                                            - 1
                                            && <span />
                                        }
                                    </div>

                                    <div>
                                        <strong>
                                            {
                                                STATUS_LABELS[
                                                entry.status
                                                ]
                                            }
                                        </strong>

                                        <small>
                                            {
                                                formatDate(
                                                    entry.changed_at,
                                                )
                                            }
                                            {' · '}
                                            {
                                                actorName(
                                                    entry.changed_by_user_id,
                                                )
                                            }
                                        </small>

                                        {
                                            entry.note
                                            && (
                                                <p>
                                                    {
                                                        entry.note
                                                    }
                                                </p>
                                            )
                                        }
                                    </div>
                                </article>
                            ),
                        )
                    }
                </div>

                {
                    severityHistory.length
                    > 0
                    && (
                        <div className="incident-severity-history">
                            <span>
                                ÉVOLUTION DE LA SÉVÉRITÉ
                            </span>

                            {
                                severityHistory.map(
                                    (
                                        entry,
                                    ) => (
                                        <div
                                            key={
                                                entry.id_severity_change
                                            }
                                        >
                                            <strong>
                                                {
                                                    SEVERITY_LABELS[
                                                    entry.old_severity
                                                    ]
                                                }
                                                {' → '}
                                                {
                                                    SEVERITY_LABELS[
                                                    entry.new_severity
                                                    ]
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    formatDate(
                                                        entry.changed_at,
                                                    )
                                                }
                                            </small>

                                            {
                                                entry.note
                                                && (
                                                    <p>
                                                        {
                                                            entry.note
                                                        }
                                                    </p>
                                                )
                                            }
                                        </div>
                                    ),
                                )
                            }
                        </div>
                    )
                }
            </section>

            <section className="incident-section">
                <div className="incident-section__heading">
                    <IncidentSectionIcon
                        name="contacts"
                    />

                    <h3>
                        CONTACTS
                    </h3>
                </div>

                <div className="incident-contact-list">
                    {
                        contacts.length
                        === 0
                        && (
                            <p>
                                Aucun contact
                                enregistré.
                            </p>
                        )
                    }

                    {
                        contacts.map(
                            (contact) => {
                                const technician =
                                    contact.id_util
                                        ? technicianById.get(
                                            contact.id_util,
                                        )
                                        : undefined

                                return (
                                    <article
                                        key={
                                            contact.id_contact
                                        }
                                    >
                                        <div>
                                            <span>
                                                {
                                                    CONTACT_LABELS[
                                                    contact.contact_type
                                                    ]
                                                }
                                            </span>

                                            <strong>
                                                {
                                                    technician
                                                        ? (
                                                            `${technician.prenom} `
                                                            + technician.nom
                                                        )
                                                        : (
                                                            contact
                                                                .external_contact_name
                                                            ?? (
                                                                contact.id_util
                                                                    ? `Utilisateur #${contact.id_util}`
                                                                    : 'Non renseigné'
                                                            )
                                                        )
                                                }
                                            </strong>
                                        </div>

                                        <small>
                                            {
                                                formatDate(
                                                    contact.contacted_at,
                                                )
                                            }
                                        </small>
                                    </article>
                                )
                            },
                        )
                    }
                </div>


                {
                    canManageContacts
                    && treatmentActive
                    && (
                        <div className="incident-contact-form">
                            <select
                                value={
                                    contactType
                                }
                                onChange={
                                    (event) =>
                                        setContactType(
                                            event
                                                .target
                                                .value as
                                            ContactType,
                                        )
                                }
                            >
                                <option value="technicien">
                                    Technicien
                                </option>

                                <option value="renault">
                                    Support Renault
                                </option>

                                <option value="autre">
                                    Autre externe
                                </option>
                            </select>

                            {
                                contactType
                                    === 'technicien'
                                    ? (
                                        <select
                                            value={
                                                technicianId
                                            }
                                            onChange={
                                                (event) =>
                                                    setTechnicianId(
                                                        Number(
                                                            event
                                                                .target
                                                                .value,
                                                        ),
                                                    )
                                            }
                                        >
                                            <option value={0}>
                                                Sélectionner
                                            </option>

                                            {
                                                technicians.map(
                                                    (
                                                        technician,
                                                    ) => (
                                                        <option
                                                            key={
                                                                technician.id_util
                                                            }
                                                            value={
                                                                technician.id_util
                                                            }
                                                        >
                                                            {
                                                                technician.prenom
                                                            } {
                                                                technician.nom
                                                            }
                                                        </option>
                                                    ),
                                                )
                                            }
                                        </select>
                                    )
                                    : (
                                        <div className="incident-contact-external">
                                            <input
                                                type="text"
                                                maxLength={
                                                    TEXT_LIMITS.externalContact
                                                }
                                                placeholder="Nom du contact"
                                                value={
                                                    externalName
                                                }
                                                onChange={
                                                    (event) =>
                                                        setExternalName(
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                }
                                            />

                                            <small className="incident-contact-counter">
                                                {externalName.length}/{
                                                    TEXT_LIMITS.externalContact
                                                }
                                            </small>
                                        </div>
                                    )
                            }

                            <button
                                type="button"
                                className="incident-action"
                                disabled={
                                    actionPending
                                }
                                onClick={
                                    () =>
                                        void addContact()
                                }
                            >
                                AJOUTER
                            </button>
                        </div>
                    )
                }
            </section>

            {
                actionSuccess
                && createPortal(
                    <div
                        className="incident-action-toast incident-action-toast--success"
                        role="status"
                        aria-live="polite"
                    >
                        <strong>
                            {actionSuccess}
                        </strong>

                        <span>
                            L’opération a été enregistrée avec succès.
                        </span>
                    </div>,
                    document.body,
                )
            }

            {
                actionError
                && createPortal(
                    <div
                        className="incident-action-toast incident-action-toast--error"
                        role="alert"
                        aria-live="assertive"
                    >
                        <strong>
                            L’opération n’a pas pu être effectuée.
                        </strong>

                        <span>
                            {actionError}
                        </span>
                    </div>,
                    document.body,
                )
            }
        </>
    )
}