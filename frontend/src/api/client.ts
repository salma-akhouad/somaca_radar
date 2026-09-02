import type {
    ContactType,
    CurrentUser,
    Departement,
    Etat,
    Incident,
    IncidentContact,
    IncidentHistory,
    IncidentSeverity,
    IncidentStatus,
    LoginResponse,
    Machine,
    Poteau,
    Role,
    SessionRecord,
    StatutHistorique,
    Technician,
    Unite,
    User,
} from './types'


const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ??
    'http://localhost:8000'
).replace(/\/$/, '')

const TOKEN_KEY = 'somaca_access_token'
const AUTH_EXPIRED_EVENT = 'somaca:auth-expired'

let authExpiredDispatched = false

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

export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string) {
    authExpiredDispatched = false
    localStorage.setItem(
        TOKEN_KEY,
        token,
    )
}

export function clearStoredToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export function getApiBaseUrl() {
    return API_BASE_URL
}

export function expireStoredSession() {
    clearStoredToken()

    if (authExpiredDispatched) return

    authExpiredDispatched = true

    window.dispatchEvent(
        new Event(AUTH_EXPIRED_EVENT),
    )
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

function errorMessage(
    status: number,
    path: string,
) {
    if (
        status === 401 &&
        path === '/login'
    ) {
        return 'Adresse e-mail ou mot de passe incorrect.'
    }

    switch (status) {
        case 401:
            return (
                'Votre session a expiré. '
                + 'Veuillez vous reconnecter.'
            )

        case 403:
            return (
                "Vous n'avez pas l'autorisation "
                + "d'effectuer cette action."
            )

        case 404:
            return (
                "L'élément demandé n'existe plus."
            )

        case 409:
            return (
                'Cette opération entre en conflit '
                + 'avec des données existantes.'
            )

        case 422:
            return (
                'Certaines données saisies '
                + 'sont invalides.'
            )

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

async function request<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const headers = new Headers(
        init.headers,
    )

    if (
        !headers.has('Content-Type')
        && init.body
    ) {
        headers.set(
            'Content-Type',
            'application/json',
        )
    }

    const token = getStoredToken()

    if (token) {
        headers.set(
            'Authorization',
            `Bearer ${token}`,
        )
    }

    let response: Response

    try {
        response = await fetch(
            `${API_BASE_URL}${path}`,
            {
                ...init,
                headers,
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
            && token
            && path !== '/login'
        ) {
            expireStoredSession()
        }

        throw new ApiError(
            response.status,
            errorMessage(
                response.status,
                path,
            ),
        )
    }

    return body as T
}

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

export const getMe = () =>
    request<CurrentUser>('/me')

/* =========================================================
   MACHINES
   ========================================================= */

export const getMachines = () =>
    request<Machine[]>(
        '/machines',
    )


export const createMachine = (
    payload:
        Omit<
            Machine,
            'id_machine'
        >,
) =>
    request<Machine>(
        '/machines',

        {
            method: 'POST',

            body:
                JSON.stringify(
                    payload,
                ),
        },
    )


export const patchMachine = (
    id: number,

    payload:
        Partial<
            Omit<
                Machine,
                'id_machine'
            >
        >,
) =>
    request<Machine>(
        `/machines/${id}`,

        {
            method: 'PATCH',

            body:
                JSON.stringify(
                    payload,
                ),
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


/* =========================================================
   INCIDENTS
   ========================================================= */

export const getIncidents = () =>
    request<Incident[]>(
        '/incidents',
    )


export const createIncident = (
    payload: {
        id_machine: number
        problem: string
        severity:
        IncidentSeverity
    },
) =>
    request<Incident>(
        '/incidents',

        {
            method: 'POST',

            body:
                JSON.stringify(
                    payload,
                ),
        },
    )


export const updateIncident = (
    id: number,

    payload: {
        problem?: string

        severity?:
        IncidentSeverity

        confirmed_cause?:
        string | null

        applied_solution?:
        string | null
    },
) =>
    request<Incident>(
        `/incidents/${id}`,

        {
            method: 'PATCH',

            body:
                JSON.stringify(
                    payload,
                ),
        },
    )


export const updateIncidentStatus = (
    id: number,

    status:
        IncidentStatus,
) =>
    request<Incident>(
        `/incidents/${id}/status`,

        {
            method: 'PATCH',

            body:
                JSON.stringify({
                    status,
                }),
        },
    )


export const getIncidentHistory = (
    id: number,
) =>
    request<
        IncidentHistory[]
    >(
        `/incidents/${id}/history`,
    )


export const getIncidentContacts = (
    id: number,
) =>
    request<
        IncidentContact[]
    >(
        `/incidents/${id}/contacts`,
    )


export const createIncidentContact = (
    id: number,

    payload: {
        contact_type:
        ContactType

        id_util?:
        number | null

        external_contact_name?:
        string | null
    },
) =>
    request<IncidentContact>(
        `/incidents/${id}/contacts`,

        {
            method: 'POST',

            body:
                JSON.stringify(
                    payload,
                ),
        },
    )


export const getTechnicians = () =>
    request<Technician[]>(
        '/technicians',
    )


/* =========================================================
   USERS / ROLES / SESSIONS
   ========================================================= */

export const getRoles = () =>
    request<Role[]>(
        '/roles',
    )


export const getUsers = () =>
    request<User[]>(
        '/utilisateurs',
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

            body:
                JSON.stringify(
                    payload,
                ),
        },
    )


export const patchUser = (
    id: number,

    payload:
        Partial<{
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

            body:
                JSON.stringify(
                    payload,
                ),
        },
    )


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
    request<
        SessionRecord[]
    >(
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


/* =========================================================
   FACTORY ORGANISATION
   ========================================================= */

export const getDepartements = () =>
    request<Departement[]>(
        '/departements',
    )


export const getUnites = () =>
    request<Unite[]>(
        '/unites',
    )


export const getPoteaux = () =>
    request<Poteau[]>(
        '/poteaux',
    )


export const getEtats = () =>
    request<Etat[]>(
        '/etats',
    )


export const getStatuts = () =>
    request<
        StatutHistorique[]
    >(
        '/statuts',
    )


type OrganisationKind =
    | 'departements'
    | 'unites'
    | 'poteaux'
    | 'etats'


export const createOrganisationResource = (
    kind:
        OrganisationKind,

    payload:
        Record<
            string,
            string | number
        >,
) =>
    request<unknown>(
        `/${kind}`,

        {
            method: 'POST',

            body:
                JSON.stringify(
                    payload,
                ),
        },
    )


export const patchOrganisationResource = (
    kind:
        OrganisationKind,

    id: number,

    payload:
        Record<
            string,
            string | number
        >,
) =>
    request<unknown>(
        `/${kind}/${id}`,

        {
            method: 'PATCH',

            body:
                JSON.stringify(
                    payload,
                ),
        },
    )


export const deleteOrganisationResource = (
    kind:
        OrganisationKind,

    id: number,
) =>
    request<void>(
        `/${kind}/${id}`,

        {
            method: 'DELETE',
        },
    )