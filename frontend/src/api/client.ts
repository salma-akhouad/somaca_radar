import type {
    ContactType,
    CurrentUser,
    Departement,
    Etat,
    EtatUsine,
    Incident,
    IncidentContact,
    IncidentPage,
    IncidentSummary,
    IncidentHistory,
    IncidentSeverity,
    IncidentSeverityHistory,
    IncidentStatus,
    LoginResponse,
    Machine,
    NotificationReadResponse,
    Poteau,
    ProblemReport,
    Role,
    SessionRecord,
    StatutHistorique,
    Technician,
    Unite,
    User,
    IncidentActor,
} from './types'


const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL
    ?? 'http://localhost:8000'
).replace(/\/$/, '')

const AUTH_EXPIRED_EVENT = 'somaca:auth-expired'

let authExpiredDispatched = false

interface RequestBehavior {
    notifyAuthExpired?: boolean
}

export class ApiError extends Error {
    status: number

    constructor(
        status: number,
        message: string,
    ) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

export function getApiBaseUrl() {
    return API_BASE_URL
}

export function expireStoredSession() {
    if (authExpiredDispatched) return

    authExpiredDispatched = true
    window.dispatchEvent(
        new Event(AUTH_EXPIRED_EVENT),
    )
}

export function resetAuthExpiredDispatch() {
    authExpiredDispatched = false
}

export function onAuthExpired(
    handler: () => void,
) {
    window.addEventListener(
        AUTH_EXPIRED_EVENT,
        handler,
    )

    return () => {
        window.removeEventListener(
            AUTH_EXPIRED_EVENT,
            handler,
        )
    }
}

function fallbackErrorMessage(
    status: number,
    path: string,
) {
    if (
        status === 401
        && path === '/login'
    ) {
        return 'Adresse e-mail ou mot de passe incorrect.'
    }

    switch (status) {
        case 401:
            return (
                'Votre session n’est plus valide. '
                + 'Veuillez vous reconnecter.'
            )

        case 403:
            return (
                "Vous n'avez pas l'autorisation "
                + "d'effectuer cette action."
            )

        case 404:
            return "L'élément demandé n'existe plus."

        case 409:
            return (
                'Cette opération entre en conflit '
                + 'avec les données existantes.'
            )

        case 422:
            return 'Certaines données saisies sont invalides.'

        default:
            if (status >= 500) {
                return (
                    'Une erreur serveur est survenue. '
                    + 'Réessayez dans quelques instants.'
                )
            }

            return 'La requête n’a pas pu être effectuée.'
    }
}

function backendDetail(
    body: unknown,
): string | null {
    if (
        body
        && typeof body === 'object'
        && 'detail' in body
    ) {
        const detail = (
            body as {
                detail?: unknown
            }
        ).detail

        if (
            typeof detail === 'string'
            && detail.trim()
        ) {
            return detail
        }
    }

    return null
}

async function request<T>(
    path: string,
    init: RequestInit = {},
    behavior: RequestBehavior = {},
): Promise<T> {
    const headers = new Headers(init.headers)

    if (
        !headers.has('Content-Type')
        && init.body
    ) {
        headers.set(
            'Content-Type',
            'application/json',
        )
    }

    let response: Response

    try {
        response = await fetch(
            `${API_BASE_URL}${path}`,
            {
                ...init,
                headers,
                credentials: 'include',
            },
        )
    } catch {
        throw new ApiError(
            0,
            'Connexion au serveur impossible. '
            + 'Vérifiez que le service SOMACA RADAR '
            + 'est disponible.',
        )
    }

    if (response.status === 204) {
        return undefined as T
    }

    let body: unknown = null

    try {
        body = await response.json()
    } catch {
        body = null
    }

    if (!response.ok) {
        if (
            response.status === 401
            && path !== '/login'
            && behavior.notifyAuthExpired !== false
        ) {
            expireStoredSession()
        }

        const message = (
            backendDetail(body)
            ?? fallbackErrorMessage(
                response.status,
                path,
            )
        )

        throw new ApiError(
            response.status,
            message,
        )
    }

    return body as T
}


export const markNotificationsReadRequest = (
    readAt?: string,
) =>
    request<NotificationReadResponse>(
        '/notifications/read',
        {
            method: 'POST',
            body: readAt
                ? JSON.stringify({
                    read_at: readAt,
                })
                : undefined,
        },
    )


export const login = (
    email: string,
    mot_de_passe: string,
) =>
    request<LoginResponse>(
        '/login',
        {
            method: 'POST',
            body: JSON.stringify({
                email,
                mot_de_passe,
            }),
        },
    )


export const logoutRequest = () =>
    request<void>(
        '/logout',
        {
            method: 'POST',
        },
    )


export const getMe = (
    options: {
        notifyAuthExpired?: boolean
    } = {},
) =>
    request<CurrentUser>(
        '/me',
        {},
        {
            notifyAuthExpired:
                options.notifyAuthExpired ?? true,
        },
    )


export const getMachines = (
    includeInactive = false,
) =>
    request<Machine[]>(
        includeInactive
            ? '/machines?include_inactive=true'
            : '/machines',
    )


export const createMachine = (
    payload: Omit<
        Machine,
        | 'id_machine'
        | 'actif'
        | 'date_decommissionnement'
    >,
) =>
    request<Machine>(
        '/machines',
        {
            method: 'POST',
            body: JSON.stringify(payload),
        },
    )


export const patchMachine = (
    id: number,
    payload: Partial<
        Omit<
            Machine,
            | 'id_machine'
            | 'actif'
            | 'date_decommissionnement'
        >
    >,
) =>
    request<Machine>(
        `/machines/${id}`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        },
    )


export const decommissionMachine = (
    id: number,
) =>
    request<Machine>(
        `/machines/${id}/decommission`,
        {
            method: 'PATCH',
        },
    )


export const reactivateMachine = (
    id: number,
) =>
    request<Machine>(
        `/machines/${id}/reactivate`,
        {
            method: 'PATCH',
        },
    )


export const deleteMachine = (
    id: number,
) =>
    request<void>(
        `/machines/${id}`,
        {
            method: 'DELETE',
        },
    )


export const getActiveIncidents = () =>
    request<Incident[]>(
        '/incidents/active',
    )


export const getIncidentsPage = (
    params: {
        page?: number
        pageSize?: number
        search?: string
        severity?: IncidentSeverity | 'all'
        status?: IncidentStatus | 'all'
        focusId?: number | null
    } = {},
) => {
    const query = new URLSearchParams()

    query.set(
        'page',
        String(params.page ?? 1),
    )
    query.set(
        'page_size',
        String(params.pageSize ?? 25),
    )

    if (params.search?.trim()) {
        query.set(
            'search',
            params.search.trim(),
        )
    }

    if (
        params.severity
        && params.severity !== 'all'
    ) {
        query.set(
            'severity',
            params.severity,
        )
    }

    if (
        params.status
        && params.status !== 'all'
    ) {
        query.set(
            'status',
            params.status,
        )
    }

    if (params.focusId) {
        query.set(
            'focus_id',
            String(params.focusId),
        )
    }

    return request<IncidentPage>(
        `/incidents?${query.toString()}`,
    )
}


export const getIncidentSummary = () =>
    request<IncidentSummary>(
        '/incidents/summary',
    )


export const reportProblem = (
    payload: {
        id_machine: number
        id_etat: number
        problem: string
        severity: IncidentSeverity
    },
) =>
    request<ProblemReport>(
        '/incidents/report',
        {
            method: 'POST',
            body: JSON.stringify(payload),
        },
    )


export const updateIncident = (
    id: number,
    payload: {
        severity?: IncidentSeverity
        severity_note?: string | null
        confirmed_cause?: string | null
        applied_solution?: string | null
    },
) =>
    request<Incident>(
        `/incidents/${id}`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        },
    )


export const updateIncidentStatus = (
    id: number,
    status: IncidentStatus,
    note?: string,
) =>
    request<Incident>(
        `/incidents/${id}/status`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                status,
                note,
            }),
        },
    )


export const getIncidentHistory = (
    id: number,
) =>
    request<IncidentHistory[]>(
        `/incidents/${id}/history`,
    )


export const getIncidentSeverityHistory = (
    id: number,
) =>
    request<IncidentSeverityHistory[]>(
        `/incidents/${id}/severity-history`,
    )


export const getIncidentContacts = (
    id: number,
) =>
    request<IncidentContact[]>(
        `/incidents/${id}/contacts`,
    )


export const createIncidentContact = (
    id: number,
    payload: {
        contact_type: ContactType
        id_util?: number | null
        external_contact_name?: string | null
    },
) =>
    request<IncidentContact>(
        `/incidents/${id}/contacts`,
        {
            method: 'POST',
            body: JSON.stringify(payload),
        },
    )


export const getTechnicians = () =>
    request<Technician[]>(
        '/technicians',
    )

export const getIncidentActors = () =>
    request<IncidentActor[]>(
        '/incident-actors',
    )

export const getRoles = () =>
    request<Role[]>(
        '/roles',
    )


export const getUsers = (
    includeInactive = false,
) =>
    request<User[]>(
        includeInactive
            ? '/utilisateurs?include_inactive=true'
            : '/utilisateurs',
    )


export const createUser = (
    payload: {
        nom: string
        prenom: string
        email: string
        id_role: number
        mot_de_passe: string
    },
) =>
    request<User>(
        '/utilisateurs',
        {
            method: 'POST',
            body: JSON.stringify(payload),
        },
    )


export const patchUser = (
    id: number,
    payload: Partial<{
        nom: string
        prenom: string
        email: string
        id_role: number
        mot_de_passe: string
    }>,
) =>
    request<User>(
        `/utilisateurs/${id}`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        },
    )


export const deactivateUser = (
    id: number,
) =>
    request<User>(
        `/utilisateurs/${id}/deactivate`,
        {
            method: 'PATCH',
        },
    )


export const activateUser = (
    id: number,
) =>
    request<User>(
        `/utilisateurs/${id}/activate`,
        {
            method: 'PATCH',
        },
    )


// User deletion requests deactivate access while preserving historical references.
export const deleteUser = (
    id: number,
) =>
    request<void>(
        `/utilisateurs/${id}`,
        {
            method: 'DELETE',
        },
    )


export const getSessions = () =>
    request<SessionRecord[]>(
        '/sessions',
    )


export const revokeSession = (
    id: number,
) =>
    request<SessionRecord>(
        `/sessions/${id}/revoke`,
        {
            method: 'PATCH',
        },
    )


export const getDepartements = (
    includeInactive = false,
) =>
    request<Departement[]>(
        includeInactive
            ? '/departements?include_inactive=true'
            : '/departements',
    )


export const getUnites = (
    includeInactive = false,
) =>
    request<Unite[]>(
        includeInactive
            ? '/unites?include_inactive=true'
            : '/unites',
    )


export const getPoteaux = (
    includeInactive = false,
) =>
    request<Poteau[]>(
        includeInactive
            ? '/poteaux?include_inactive=true'
            : '/poteaux',
    )


export const getEtats = () =>
    request<Etat[]>(
        '/etats',
    )


export const getStatuts = () =>
    request<StatutHistorique[]>(
        '/statuts',
    )


export const getEtatUsine = () =>
    request<EtatUsine>(
        '/etat-usine',
    )


type OrganisationKind =
    | 'departements'
    | 'unites'
    | 'poteaux'
    | 'etats'


export const createOrganisationResource = (
    kind: OrganisationKind,
    payload: Record<
        string,
        string | number
    >,
) =>
    request<unknown>(
        `/${kind}`,
        {
            method: 'POST',
            body: JSON.stringify(payload),
        },
    )


export const patchOrganisationResource = (
    kind: OrganisationKind,
    id: number,
    payload: Record<
        string,
        string | number
    >,
) =>
    request<unknown>(
        `/${kind}/${id}`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        },
    )


export const deleteOrganisationResource = (
    kind: OrganisationKind,
    id: number,
) =>
    request<void>(
        `/${kind}/${id}`,
        {
            method: 'DELETE',
        },
    )
