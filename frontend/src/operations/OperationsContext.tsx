import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import type { ReactNode } from 'react'

import {
    ApiError,
    expireStoredSession,
    getApiBaseUrl,
    getEtats,
    getIncidents,
    getMachines,
    getMe,
    getPoteaux,
    getStatuts,
    markNotificationsReadRequest,
} from '../api/client'

import type {
    Etat,
    Incident,
    Machine,
    OperationsNotification,
    PoleOperationalLevel,
    PoleOperationalState,
    Poteau,
    StatutHistorique,
} from '../api/types'

import { useAuth } from '../auth/AuthContext'

export type RealtimeStatus =
    | 'connecting'
    | 'connected'
    | 'fallback'
    | 'unavailable'

interface MachineStatusChangedEvent {
    type: 'machine_status_changed'
    id_statut: number
    id_machine: number
    id_etat: number
    id_util: number | null
    date_changement: string
    description_probleme: string | null
}

interface IncidentEvent {
    type:
    | 'incident_created'
    | 'incident_updated'
    incident: Incident
}

interface OperationsContextValue {
    machines: Machine[]
    incidents: Incident[]
    poteaux: Poteau[]
    etats: Etat[]
    statuts: StatutHistorique[]
    poleStates: PoleOperationalState[]
    notifications: OperationsNotification[]
    unreadCount: number
    realtimeStatus: RealtimeStatus
    refresh: () => Promise<boolean>
    markNotificationsRead: () => Promise<void>
    markNotificationRead:
    (
        notification:
            OperationsNotification,
    ) => Promise<void>
}

const OperationsContext =
    createContext<OperationsContextValue | null>(null)

function isMachineStatusChangedEvent(
    value: unknown,
): value is MachineStatusChangedEvent {
    if (!value || typeof value !== 'object') {
        return false
    }

    const event = value as Record<string, unknown>

    return (
        event.type === 'machine_status_changed'
        && typeof event.id_statut === 'number'
        && typeof event.id_machine === 'number'
        && typeof event.id_etat === 'number'
        && typeof event.date_changement === 'string'
    )
}

function isIncidentEvent(
    value: unknown,
): value is IncidentEvent {
    if (!value || typeof value !== 'object') {
        return false
    }

    const event = value as Record<string, unknown>

    if (
        event.type !== 'incident_created'
        && event.type !== 'incident_updated'
    ) {
        return false
    }

    if (
        !event.incident
        || typeof event.incident !== 'object'
    ) {
        return false
    }

    const incident = event.incident as Record<string, unknown>

    return (
        typeof incident.id_incident === 'number'
        && typeof incident.id_machine === 'number'
        && typeof incident.problem === 'string'
        && typeof incident.severity === 'string'
        && typeof incident.status === 'string'
        && typeof incident.created_at === 'string'
    )
}

function isClosedIncident(
    incident: Incident,
) {
    return [
        'resolu',
        'ferme',
        'annule',
    ].includes(incident.status)
}

function normalizeState(
    stateName: string,
): PoleOperationalLevel {
    const normalized =
        stateName.trim().toLowerCase()

    if (
        normalized.includes('arrêt')
        || normalized.includes('arret')
        || normalized.includes('offline')
        || normalized.includes('stop')
        || normalized.includes('hors service')
        || normalized.includes('inconnu')
    ) {
        return 'stopped'
    }

    if (
        normalized.includes('crit')
        || normalized.includes('panne')
    ) {
        return 'critical'
    }

    if (
        normalized.includes('attention')
        || normalized.includes('aler')
        || normalized.includes('dégrad')
        || normalized.includes('degrad')
        || normalized.includes('warning')
    ) {
        return 'alert'
    }

    return 'operational'
}

function priority(
    level: PoleOperationalLevel,
) {
    return {
        operational: 0,
        stopped: 1,
        alert: 2,
        critical: 3,
    }[level]
}

function latestStatuses(
    statuts: StatutHistorique[],
) {
    const result = new Map<number, StatutHistorique>()

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
}

function buildPoleStates(
    machines: Machine[],
    poteaux: Poteau[],
    etats: Etat[],
    statuts: StatutHistorique[],
) {
    const etatById = new Map(
        etats.map((etat) => [etat.id_etat, etat]),
    )

    const latest = latestStatuses(statuts)
    const stateByPole = new Map<number, PoleOperationalState>()

    poteaux.forEach((pole) => {
        stateByPole.set(
            pole.id_poteau,
            {
                poleId: pole.id_poteau,
                poleName: pole.nom_poteau,
                level: 'operational',
                incidentId: null,
                machineId: null,
                message: 'Fonctionnement normal',
            },
        )
    })

    machines.forEach((machine) => {
        const current = latest.get(machine.id_machine)
        if (!current) return

        const etat = etatById.get(current.id_etat)
        const level = normalizeState(
            etat?.libelle_etat ?? '',
        )
        const existing = stateByPole.get(machine.id_poteau)

        if (
            !existing
            || priority(level) > priority(existing.level)
        ) {
            stateByPole.set(
                machine.id_poteau,
                {
                    poleId: machine.id_poteau,
                    poleName:
                        existing?.poleName
                        ?? `P-${String(machine.id_poteau).padStart(2, '0')}`,
                    level,
                    incidentId: null,
                    machineId: machine.id_machine,
                    message:
                        current.description_probleme
                        ?? etat?.libelle_etat
                        ?? 'État machine',
                },
            )
        }
    })

    return Array.from(stateByPole.values())
}

function buildNotifications(
    incidents: Incident[],
    machines: Machine[],
    poteaux: Poteau[],
    lastReadAt: number,
) {
    const poleById = new Map(
        poteaux.map((pole) => [pole.id_poteau, pole]),
    )

    return incidents
        .filter((incident) => !isClosedIncident(incident))
        .map((incident): OperationsNotification => {
            const machine = machines.find(
                (item) => item.id_machine === incident.id_machine,
            )
            const pole = machine
                ? poleById.get(machine.id_poteau)
                : undefined

            const severityLabel = {
                critique: 'critique',
                majeur: 'majeur',
                mineur: 'mineur',
            }[incident.severity]

            const timestamp = incident.created_at

            return {
                id: `incident-${incident.id_incident}`,
                level:
                    incident.severity === 'critique'
                        ? 'critical'
                        : 'alert',
                severity: incident.severity,
                isUnread:
                    new Date(timestamp).getTime() > lastReadAt,
                title:
                    `Incident ${severityLabel} · ${pole?.nom_poteau ?? 'Poste'}`,
                description: incident.problem,
                timestamp,
                poleId: pole?.id_poteau ?? null,
                poleName: pole?.nom_poteau ?? null,
                incidentId: incident.id_incident,
                machineId: incident.id_machine,
            }
        })
        .sort(
            (first, second) =>
                new Date(second.timestamp).getTime()
                - new Date(first.timestamp).getTime(),
        )
}

function combineRealtimeStatus(
    machineStatus: RealtimeStatus,
    incidentStatus: RealtimeStatus,
): RealtimeStatus {
    if (
        machineStatus === 'connected'
        && incidentStatus === 'connected'
    ) {
        return 'connected'
    }

    if (
        machineStatus === 'unavailable'
        && incidentStatus === 'unavailable'
    ) {
        return 'unavailable'
    }

    if (
        machineStatus === 'fallback'
        || incidentStatus === 'fallback'
        || machineStatus === 'unavailable'
        || incidentStatus === 'unavailable'
    ) {
        return 'fallback'
    }

    return 'connecting'
}

export function OperationsProvider({
    children,
}: {
    children: ReactNode
}) {
    const { user } = useAuth()

    const [machines, setMachines] = useState<Machine[]>([])
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [poteaux, setPoteaux] = useState<Poteau[]>([])
    const [etats, setEtats] = useState<Etat[]>([])
    const [statuts, setStatuts] = useState<StatutHistorique[]>([])

    const [machineRealtimeStatus, setMachineRealtimeStatus] =
        useState<RealtimeStatus>('connecting')
    const [incidentRealtimeStatus, setIncidentRealtimeStatus] =
        useState<RealtimeStatus>('connecting')

    const [lastReadAt, setLastReadAt] = useState(0)
    const refreshRef = useRef(0)

    const realtimeStatus = useMemo(
        () => combineRealtimeStatus(
            machineRealtimeStatus,
            incidentRealtimeStatus,
        ),
        [machineRealtimeStatus, incidentRealtimeStatus],
    )

    useEffect(() => {
        if (!user) {
            setLastReadAt(0)
            setMachineRealtimeStatus('connecting')
            setIncidentRealtimeStatus('connecting')
            return
        }

        setLastReadAt(
            user.notifications_read_at
                ? new Date(user.notifications_read_at).getTime()
                : 0,
        )
    }, [user])

    const syncMachineState = useCallback(async () => {
        if (!user) return false

        try {
            const [
                nextMachines,
                nextPoteaux,
                nextEtats,
                nextStatuts,
            ] = await Promise.all([
                getMachines(),
                getPoteaux(),
                getEtats(),
                getStatuts(),
            ])

            setMachines(nextMachines)
            setPoteaux(nextPoteaux)
            setEtats(nextEtats)
            setStatuts(nextStatuts)

            return true
        } catch {
            return false
        }
    }, [user])

    const syncIncidents = useCallback(async () => {
        if (!user) return false

        try {
            const nextIncidents = await getIncidents()
            setIncidents(nextIncidents)
            return true
        } catch {
            return false
        }
    }, [user])

    const refresh = useCallback(async () => {
        if (!user) return false

        const currentRequest = ++refreshRef.current

        try {
            const [
                nextMachines,
                nextIncidents,
                nextPoteaux,
                nextEtats,
                nextStatuts,
            ] = await Promise.all([
                getMachines(),
                getIncidents(),
                getPoteaux(),
                getEtats(),
                getStatuts(),
            ])

            if (currentRequest !== refreshRef.current) {
                return false
            }

            setMachines(nextMachines)
            setIncidents(nextIncidents)
            setPoteaux(nextPoteaux)
            setEtats(nextEtats)
            setStatuts(nextStatuts)

            return true
        } catch {
            return false
        }
    }, [user])

    useEffect(() => {
        if (!user) return

        void refresh()
    }, [user, refresh])

    useEffect(() => {
        if (!user) return

        let disposed = false
        let socket: WebSocket | null = null
        let reconnectTimer: number | null = null
        let heartbeatTimer: number | null = null
        let fallbackPollingTimer: number | null = null
        let hasConnectedOnce = false

        const httpUrl = getApiBaseUrl()
        const wsBase = httpUrl.startsWith('https://')
            ? httpUrl.replace('https://', 'wss://')
            : httpUrl.replace('http://', 'ws://')

        function clearHeartbeat() {
            if (heartbeatTimer === null) return
            window.clearInterval(heartbeatTimer)
            heartbeatTimer = null
        }

        function clearFallbackPolling() {
            if (fallbackPollingTimer === null) return
            window.clearInterval(fallbackPollingTimer)
            fallbackPollingTimer = null
        }

        async function checkHttpFallback() {
            if (disposed) return

            try {
                await getMe()
            } catch (error) {
                if (disposed) return

                if (
                    error instanceof ApiError
                    && error.status === 401
                ) {
                    return
                }

                setMachineRealtimeStatus('unavailable')
                return
            }

            if (disposed) return

            const httpWorks = await syncMachineState()

            if (disposed) return

            setMachineRealtimeStatus(
                httpWorks
                    ? 'fallback'
                    : 'unavailable',
            )
        }

        function startFallbackPolling() {
            clearFallbackPolling()
            void checkHttpFallback()

            fallbackPollingTimer = window.setInterval(
                () => {
                    void checkHttpFallback()
                },
                60000,
            )
        }

        function scheduleReconnect() {
            if (disposed || reconnectTimer !== null) {
                return
            }

            reconnectTimer = window.setTimeout(
                () => {
                    reconnectTimer = null
                    connect()
                },
                5000,
            )
        }

        function connect() {
            if (disposed) return

            if (!hasConnectedOnce) {
                setMachineRealtimeStatus('connecting')
            }

            socket = new WebSocket(
                `${wsBase}/ws/statuts`,
            )

            socket.onopen = () => {
                if (disposed) return

                clearFallbackPolling()
                clearHeartbeat()

                const isReconnect = hasConnectedOnce
                hasConnectedOnce = true

                heartbeatTimer = window.setInterval(
                    () => {
                        if (
                            socket?.readyState
                            === WebSocket.OPEN
                        ) {
                            socket.send('ping')
                        }
                    },
                    25000,
                )

                if (!isReconnect) {
                    setMachineRealtimeStatus('connected')
                    return
                }

                void (async () => {
                    const synced = await syncMachineState()

                    if (!disposed) {
                        setMachineRealtimeStatus(
                            synced
                                ? 'connected'
                                : 'fallback',
                        )

                        if (!synced) {
                            startFallbackPolling()
                        }
                    }
                })()
            }

            socket.onmessage = (message) => {
                let event: unknown

                try {
                    event = JSON.parse(message.data)
                } catch {
                    return
                }

                if (!isMachineStatusChangedEvent(event)) {
                    return
                }

                const nextStatus: StatutHistorique = {
                    id_statut: event.id_statut,
                    id_machine: event.id_machine,
                    id_etat: event.id_etat,
                    id_util: event.id_util,
                    date_changement: event.date_changement,
                    description_probleme: event.description_probleme,
                }

                setStatuts((current) => {
                    const withoutSameRecord = current.filter(
                        (item) =>
                            item.id_statut !== nextStatus.id_statut,
                    )

                    return [
                        ...withoutSameRecord,
                        nextStatus,
                    ]
                })
            }

            socket.onerror = () => {
                // The close event owns fallback/reconnect behavior so that
                // one failed socket does not start duplicate recovery loops.
            }

            socket.onclose = (event) => {
                clearHeartbeat()

                if (disposed) return

                if (event.code === 1008) {
                    clearFallbackPolling()
                    expireStoredSession()
                    return
                }

                startFallbackPolling()
                scheduleReconnect()
            }
        }

        connect()

        return () => {
            disposed = true
            clearHeartbeat()
            clearFallbackPolling()

            if (reconnectTimer !== null) {
                window.clearTimeout(reconnectTimer)
            }

            socket?.close()
        }
    }, [user, syncMachineState])

    useEffect(() => {
        if (!user) return

        let disposed = false
        let socket: WebSocket | null = null
        let reconnectTimer: number | null = null
        let heartbeatTimer: number | null = null
        let fallbackPollingTimer: number | null = null
        let hasConnectedOnce = false

        const httpUrl = getApiBaseUrl()
        const wsBase = httpUrl.startsWith('https://')
            ? httpUrl.replace('https://', 'wss://')
            : httpUrl.replace('http://', 'ws://')

        function clearHeartbeat() {
            if (heartbeatTimer === null) return
            window.clearInterval(heartbeatTimer)
            heartbeatTimer = null
        }

        function clearFallbackPolling() {
            if (fallbackPollingTimer === null) return
            window.clearInterval(fallbackPollingTimer)
            fallbackPollingTimer = null
        }

        async function checkHttpFallback() {
            if (disposed) return

            try {
                await getMe()
            } catch (error) {
                if (disposed) return

                if (
                    error instanceof ApiError
                    && error.status === 401
                ) {
                    return
                }

                setIncidentRealtimeStatus('unavailable')
                return
            }

            if (disposed) return

            const httpWorks = await syncIncidents()

            if (disposed) return

            setIncidentRealtimeStatus(
                httpWorks
                    ? 'fallback'
                    : 'unavailable',
            )
        }

        function startFallbackPolling() {
            clearFallbackPolling()
            void checkHttpFallback()

            fallbackPollingTimer = window.setInterval(
                () => {
                    void checkHttpFallback()
                },
                60000,
            )
        }

        function scheduleReconnect() {
            if (disposed || reconnectTimer !== null) {
                return
            }

            reconnectTimer = window.setTimeout(
                () => {
                    reconnectTimer = null
                    connect()
                },
                5000,
            )
        }

        function connect() {
            if (disposed) return

            if (!hasConnectedOnce) {
                setIncidentRealtimeStatus('connecting')
            }

            socket = new WebSocket(
                `${wsBase}/ws/incidents`,
            )

            socket.onopen = () => {
                if (disposed) return

                clearFallbackPolling()
                clearHeartbeat()

                const isReconnect = hasConnectedOnce
                hasConnectedOnce = true

                heartbeatTimer = window.setInterval(
                    () => {
                        if (
                            socket?.readyState
                            === WebSocket.OPEN
                        ) {
                            socket.send('ping')
                        }
                    },
                    25000,
                )

                if (!isReconnect) {
                    setIncidentRealtimeStatus('connected')
                    return
                }

                void (async () => {
                    const synced = await syncIncidents()

                    if (!disposed) {
                        setIncidentRealtimeStatus(
                            synced
                                ? 'connected'
                                : 'fallback',
                        )

                        if (!synced) {
                            startFallbackPolling()
                        }
                    }
                })()
            }

            socket.onmessage = (message) => {
                let event: unknown

                try {
                    event = JSON.parse(message.data)
                } catch {
                    return
                }

                if (!isIncidentEvent(event)) {
                    return
                }

                const nextIncident = event.incident

                setIncidents((current) => {
                    const remaining = current.filter(
                        (incident) =>
                            incident.id_incident
                            !== nextIncident.id_incident,
                    )

                    return [
                        nextIncident,
                        ...remaining,
                    ].sort(
                        (first, second) =>
                            new Date(second.created_at).getTime()
                            - new Date(first.created_at).getTime(),
                    )
                })
            }

            socket.onerror = () => {
                // The close event owns fallback/reconnect behavior.
            }

            socket.onclose = (event) => {
                clearHeartbeat()

                if (disposed) return

                if (event.code === 1008) {
                    clearFallbackPolling()
                    expireStoredSession()
                    return
                }

                startFallbackPolling()
                scheduleReconnect()
            }
        }

        connect()

        return () => {
            disposed = true
            clearHeartbeat()
            clearFallbackPolling()

            if (reconnectTimer !== null) {
                window.clearTimeout(reconnectTimer)
            }

            socket?.close()
        }
    }, [user, syncIncidents])

    const poleStates = useMemo(
        () => buildPoleStates(
            machines,
            poteaux,
            etats,
            statuts,
        ),
        [machines, poteaux, etats, statuts],
    )

    const notifications = useMemo(
        () => buildNotifications(
            incidents,
            machines,
            poteaux,
            lastReadAt,
        ),
        [incidents, machines, poteaux, lastReadAt],
    )

    const unreadCount = notifications.filter(
        (item) => item.isUnread,
    ).length

    async function markNotificationRead(
        notification:
            OperationsNotification,
    ) {
        if (
            !notification.isUnread
        ) {
            return
        }

        const result =
            await markNotificationsReadRequest(
                notification.timestamp,
            )

        const nextReadAt =
            new Date(
                result.read_at,
            ).getTime()

        setLastReadAt(
            (current) =>
                Math.max(
                    current,
                    nextReadAt,
                ),
        )
    }

    async function markNotificationsRead() {
        if (unreadCount === 0) return

        const result = await markNotificationsReadRequest()

        setLastReadAt(
            new Date(result.read_at).getTime(),
        )
    }

    return (
        <OperationsContext.Provider
            value={{
                machines,
                incidents,
                poteaux,
                etats,
                statuts,
                poleStates,
                notifications,
                unreadCount,
                realtimeStatus,
                refresh,
                markNotificationRead,
                markNotificationsRead,
            }}
        >
            {children}
        </OperationsContext.Provider>
    )
}

export function useOperations() {
    const context = useContext(OperationsContext)

    if (!context) {
        throw new Error(
            'useOperations must be used inside OperationsProvider',
        )
    }

    return context
}
