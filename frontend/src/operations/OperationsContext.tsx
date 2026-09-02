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
    getApiBaseUrl,
    getEtats,
    getIncidents,
    getMachines,
    getPoteaux,
    getStatuts,
    getStoredToken,
    ApiError,
    expireStoredSession,
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

interface OperationsContextValue {
    machines: Machine[]
    incidents: Incident[]
    poteaux: Poteau[]
    etats: Etat[]
    statuts: StatutHistorique[]
    poleStates: PoleOperationalState[]
    notifications: OperationsNotification[]
    unreadCount: number
    refresh: () => Promise<void>
    markNotificationsRead: () => void
}

const OperationsContext = createContext<OperationsContextValue | null>(null)

function isClosedIncident(incident: Incident) {
    return ['resolu', 'ferme', 'annule'].includes(incident.status)
}

function normalizeState(stateName: string): PoleOperationalLevel {
    const normalized = stateName.trim().toLowerCase()

    if (
        normalized.includes('arrêt') ||
        normalized.includes('arret') ||
        normalized.includes('offline') ||
        normalized.includes('stop') ||
        normalized.includes('hors service')
    ) return 'stopped'

    if (normalized.includes('crit') || normalized.includes('panne')) return 'critical'

    if (
        normalized.includes('aler') ||
        normalized.includes('dégrad') ||
        normalized.includes('degrad') ||
        normalized.includes('warning')
    ) return 'alert'

    return 'operational'
}

function priority(level: PoleOperationalLevel) {
    return { operational: 0, stopped: 1, alert: 2, critical: 3 }[level]
}

function latestStatuses(statuts: StatutHistorique[]) {
    const result = new Map<number, StatutHistorique>()

    statuts.forEach((status) => {
        const existing = result.get(status.id_machine)
        if (
            !existing ||
            new Date(status.date_changement).getTime() >
            new Date(existing.date_changement).getTime()
        ) {
            result.set(status.id_machine, status)
        }
    })

    return result
}

function buildPoleStates(
    machines: Machine[],
    incidents: Incident[],
    poteaux: Poteau[],
    etats: Etat[],
    statuts: StatutHistorique[],
) {
    const etatById = new Map(etats.map((etat) => [etat.id_etat, etat]))
    const latest = latestStatuses(statuts)
    const stateByPole = new Map<number, PoleOperationalState>()

    poteaux.forEach((pole) => {
        stateByPole.set(pole.id_poteau, {
            poleId: pole.id_poteau,
            poleName: pole.nom_poteau,
            level: 'operational',
            incidentId: null,
            machineId: null,
            message: 'Fonctionnement normal',
        })
    })

    machines.forEach((machine) => {
        const current = latest.get(machine.id_machine)
        if (!current) return

        const etat = etatById.get(current.id_etat)
        const level = normalizeState(etat?.libelle_etat ?? '')
        const existing = stateByPole.get(machine.id_poteau)

        if (!existing || priority(level) > priority(existing.level)) {
            stateByPole.set(machine.id_poteau, {
                poleId: machine.id_poteau,
                poleName:
                    existing?.poleName ??
                    `P-${String(machine.id_poteau).padStart(2, '0')}`,
                level,
                incidentId: null,
                machineId: machine.id_machine,
                message:
                    current.description_probleme ??
                    etat?.libelle_etat ??
                    'État machine',
            })
        }
    })

    incidents
        .filter((incident) => !isClosedIncident(incident))
        .forEach((incident) => {
            const machine = machines.find((item) => item.id_machine === incident.id_machine)
            if (!machine) return

            const level: PoleOperationalLevel =
                incident.severity === 'critique' ? 'critical' : 'alert'

            const existing = stateByPole.get(machine.id_poteau)
            if (!existing || priority(level) >= priority(existing.level)) {
                stateByPole.set(machine.id_poteau, {
                    poleId: machine.id_poteau,
                    poleName:
                        existing?.poleName ??
                        `P-${String(machine.id_poteau).padStart(2, '0')}`,
                    level,
                    incidentId: incident.id_incident,
                    machineId: incident.id_machine,
                    message: incident.problem,
                })
            }
        })

    return Array.from(stateByPole.values())
}

function buildNotifications(
    incidents: Incident[],
    machines: Machine[],
    poteaux: Poteau[],
) {
    const poleById = new Map(poteaux.map((pole) => [pole.id_poteau, pole]))

    return incidents
        .filter((incident) => !isClosedIncident(incident))
        .map((incident): OperationsNotification => {
            const machine = machines.find((item) => item.id_machine === incident.id_machine)
            const pole = machine ? poleById.get(machine.id_poteau) : undefined

            return {
                id: `incident-${incident.id_incident}`,
                level: incident.severity === 'critique' ? 'critical' : 'alert',
                title:
                    incident.severity === 'critique'
                        ? `Incident critique · ${pole?.nom_poteau ?? 'Poste'}`
                        : `Incident actif · ${pole?.nom_poteau ?? 'Poste'}`,
                description: incident.problem,
                timestamp: incident.created_at,
                poleId: pole?.id_poteau ?? null,
                poleName: pole?.nom_poteau ?? null,
                incidentId: incident.id_incident,
                machineId: incident.id_machine,
            }
        })
        .sort(
            (first, second) =>
                new Date(second.timestamp).getTime() -
                new Date(first.timestamp).getTime(),
        )
}

export function OperationsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [machines, setMachines] = useState<Machine[]>([])
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [poteaux, setPoteaux] = useState<Poteau[]>([])
    const [etats, setEtats] = useState<Etat[]>([])
    const [statuts, setStatuts] = useState<StatutHistorique[]>([])
    const [lastReadAt, setLastReadAt] = useState(() =>
        Number(localStorage.getItem('somaca_notifications_read_at') ?? 0),
    )
    const refreshRef = useRef(0)

    const refresh = useCallback(async () => {
        if (!user) return

        const currentRequest =
            ++refreshRef.current

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

            if (
                currentRequest !==
                refreshRef.current
            ) {
                return
            }

            setMachines(nextMachines)
            setIncidents(nextIncidents)
            setPoteaux(nextPoteaux)
            setEtats(nextEtats)
            setStatuts(nextStatuts)
        } catch (error) {
            if (
                error instanceof ApiError
                && error.status === 401
            ) {
                return
            }

        }
    }, [user])

    useEffect(() => {
        if (!user) return
        void refresh()

        const interval = window.setInterval(() => void refresh(), 30000)
        return () => window.clearInterval(interval)
    }, [user, refresh])

    useEffect(() => {
        if (!user) return

        const token = getStoredToken()
        if (!token) return

        const httpUrl = getApiBaseUrl()
        const wsBase = httpUrl.startsWith('https://')
            ? httpUrl.replace('https://', 'wss://')
            : httpUrl.replace('http://', 'ws://')

        const socket = new WebSocket(
            `${wsBase}/ws/statuts?token=${encodeURIComponent(token)}`,
        )

        socket.onmessage = () => void refresh()
        socket.onclose = (event) => {
            if (event.code === 1008) {
                expireStoredSession()
            }
        }

        const heartbeat = window.setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) socket.send('ping')
        }, 25000)

        return () => {
            window.clearInterval(heartbeat)
            socket.close()
        }
    }, [user, refresh])

    const poleStates = useMemo(
        () => buildPoleStates(machines, incidents, poteaux, etats, statuts),
        [machines, incidents, poteaux, etats, statuts],
    )

    const notifications = useMemo(
        () => buildNotifications(incidents, machines, poteaux),
        [incidents, machines, poteaux],
    )

    const unreadCount = notifications.filter(
        (item) => new Date(item.timestamp).getTime() > lastReadAt,
    ).length

    function markNotificationsRead() {
        const now = Date.now()
        setLastReadAt(now)
        localStorage.setItem('somaca_notifications_read_at', String(now))
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
                refresh,
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
        throw new Error('useOperations must be used inside OperationsProvider')
    }
    return context
}
