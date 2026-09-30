import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    useNavigate,
} from 'react-router-dom'

import {
    activateUser,
    createMachine,
    createOrganisationResource,
    createUser,
    deactivateUser,
    decommissionMachine,
    deleteOrganisationResource,
    getAdminMachines,
    getAdminUsers,
    getMachines,
    getDepartements,
    getPoteaux,
    getRoles,
    getSessions,
    getUnites,
    patchMachine,
    patchOrganisationResource,
    patchUser,
    reactivateMachine,
    revokeSession,
} from '../api/client'

import type {
    Departement,
    Machine,
    MachinePage,
    Poteau,
    Role,
    SessionPage,
    SessionRecord,
    Unite,
    User,
    UserPage,
} from '../api/types'

import { useAuth } from '../auth/AuthContext'


type Tab =
    | 'users'
    | 'organisation'
    | 'machines'
    | 'sessions'

type AdminAction = () => Promise<unknown>

const PAGE_SIZE = 12

type UserFilters = {
    search: string
    role: string
    active: '' | 'true' | 'false'
}

type MachineFilters = {
    search: string
    typeMachine: string
    poleId: string
    active: '' | 'true' | 'false'
}

type SessionFilters = {
    search: string
    status:
        | ''
        | 'active'
        | 'expired'
        | 'revoked'
}

type AdminFeedback = {
    kind: 'success' | 'error'
    title: string
    message: string
} | null

type ConfirmState = {
    title: string
    message: string
    confirmLabel: string
    danger?: boolean
    action: () => Promise<boolean>
} | null


function formatAdminDateTime(
    value: string,
) {
    return new Intl.DateTimeFormat(
        'fr-FR',
        {
            dateStyle: 'short',
            timeStyle: 'short',
        },
    ).format(
        new Date(value),
    )
}



function AdminTabIcon({
    tab,
}: {
    tab: Tab
}) {
    if (tab === 'users') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3" />
                <path d="M6.5 19v-2.2c0-2.4 2.1-4.3 4.7-4.3h1.6c2.6 0 4.7 1.9 4.7 4.3V19" />
            </svg>
        )
    }

    if (tab === 'organisation') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 5.5 8.5 3 12 5.5 15.5 3 20 5.5V19l-4.5-2.5L12 19l-3.5-2.5L4 19Z" />
                <path d="M8.5 3v13.5M15.5 3v13.5" />
            </svg>
        )
    }

    if (tab === 'machines') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="5" width="16" height="11" rx="1.5" />
                <path d="M9 20h6M12 16v4" />
            </svg>
        )
    }

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3" />
            <path d="M6.5 19v-2.2c0-2.4 2.1-4.3 4.7-4.3h1.6c2.6 0 4.7 1.9 4.7 4.3V19" />
            <path d="M18.5 9.5v4M16.5 11.5h4" />
        </svg>
    )
}


export function AdministrationPage() {
    const { isAdmin } = useAuth()

    const [tab, setTab] =
        useState<Tab>('users')

    const [roles, setRoles] =
        useState<Role[]>([])

    const [departements, setDepartements] =
        useState<Departement[]>([])

    const [unites, setUnites] =
        useState<Unite[]>([])

    const [poteaux, setPoteaux] =
        useState<Poteau[]>([])

    const [
        organisationMachines,
        setOrganisationMachines,
    ] = useState<Machine[]>([])


    const [usersPage, setUsersPage] =
        useState<UserPage | null>(null)

    const [machinesPage, setMachinesPage] =
        useState<MachinePage | null>(null)

    const [sessionsPage, setSessionsPage] =
        useState<SessionPage | null>(null)

    const [userPageNumber, setUserPageNumber] =
        useState(1)

    const [machinePageNumber, setMachinePageNumber] =
        useState(1)

    const [sessionCursor, setSessionCursor] =
        useState<string | null>(null)

    const [sessionCursorHistory, setSessionCursorHistory] =
        useState<Array<string | null>>([])

    const [loading, setLoading] =
        useState(true)

    const [feedback, setFeedback] =
        useState<AdminFeedback>(null)

    const [confirmState, setConfirmState] =
        useState<ConfirmState>(null)

    const [userFilters, setUserFilters] =
        useState<UserFilters>({
            search: '',
            role: '',
            active: '',
        })

    const [machineFilters, setMachineFilters] =
        useState<MachineFilters>({
            search: '',
            typeMachine: '',
            poleId: '',
            active: '',
        })

    const [sessionFilters, setSessionFilters] =
        useState<SessionFilters>({
            search: '',
            status: '',
        })


    async function loadReferenceData() {
        const [
            nextRoles,
            nextDepartements,
            nextUnites,
            nextPoteaux,
            nextOrganisationMachines,
        ] = await Promise.all([
            getRoles(),
            getDepartements(true),
            getUnites(true),
            getPoteaux(true),
            getMachines(true),
        ])

        setRoles(nextRoles)
        setDepartements(nextDepartements)
        setUnites(nextUnites)
        setPoteaux(nextPoteaux)
        setOrganisationMachines(
            nextOrganisationMachines,
        )
    }


    async function loadUsers(
        page = userPageNumber,
        filters = userFilters,
    ) {
        const result =
            await getAdminUsers({
                page,
                pageSize: PAGE_SIZE,
                search:
                    filters.search || undefined,
                role:
                    filters.role || undefined,
                active:
                    filters.active === ''
                        ? undefined
                        : filters.active === 'true',
            })

        setUsersPage(result)
    }


    async function loadMachines(
        page = machinePageNumber,
        filters = machineFilters,
    ) {
        const result =
            await getAdminMachines({
                page,
                pageSize: PAGE_SIZE,
                search:
                    filters.search || undefined,
                typeMachine:
                    filters.typeMachine || undefined,
                poleId:
                    filters.poleId
                        ? Number(filters.poleId)
                        : undefined,
                active:
                    filters.active === ''
                        ? undefined
                        : filters.active === 'true',
            })

        setMachinesPage(result)
    }


    async function loadSessions(
        cursor = sessionCursor,
        filters = sessionFilters,
    ) {
        const result =
            await getSessions({
                cursor,
                pageSize: PAGE_SIZE,
                search:
                    filters.search
                    || undefined,
                status:
                    filters.status
                    || undefined,
            })

        setSessionsPage(result)
    }


    async function loadInitialData() {
        setLoading(true)
        setFeedback(null)

        try {
            await Promise.all([
                loadReferenceData(),
                loadUsers(1),
                loadMachines(1),
                loadSessions(null),
            ])

            setUserPageNumber(1)
            setMachinePageNumber(1)
            setSessionCursor(null)
            setSessionCursorHistory([])
        } catch (currentError) {
            setFeedback({
                kind: 'error',
                title: 'Chargement impossible',
                message:
                    currentError instanceof Error
                        ? currentError.message
                        : 'Les données d’administration n’ont pas pu être chargées.',
            })

            window.setTimeout(
                () => setFeedback(null),
                4200,
            )
        } finally {
            setLoading(false)
        }
    }


    async function refreshCurrentData() {
        await Promise.all([
            loadReferenceData(),
            loadUsers(userPageNumber),
            loadMachines(machinePageNumber),
            loadSessions(sessionCursor),
        ])
    }


    async function runAdminAction(
        action: AdminAction,
        successMessage = 'Modification enregistrée.',
    ) {
        setFeedback(null)

        try {
            await action()
            await refreshCurrentData()

            setFeedback({
                kind: 'success',
                title: 'Action enregistrée',
                message: successMessage,
            })

            window.setTimeout(
                () => setFeedback(null),
                3200,
            )

            return true
        } catch (currentError) {
            const rawMessage =
                currentError instanceof Error
                    ? currentError.message
                    : (
                        'L’action demandée '
                        + 'n’a pas pu être effectuée.'
                    )

            const message =
                rawMessage.includes(
                    'historique structurel',
                )
                    ? (
                        'Cet élément ne peut pas être supprimé '
                        + 'car il possède déjà un historique structurel.'
                    )
                    : rawMessage

            setFeedback({
                kind: 'error',
                title: 'Action impossible',
                message,
            })

            window.setTimeout(
                () => setFeedback(null),
                4200,
            )

            return false
        }
    }


    async function applyUserFilters(
        filters: UserFilters,
    ) {
        setUserFilters(filters)
        setUserPageNumber(1)
        await loadUsers(1, filters)
    }


    async function applyMachineFilters(
        filters: MachineFilters,
    ) {
        setMachineFilters(filters)
        setMachinePageNumber(1)
        await loadMachines(1, filters)
    }


    async function applySessionFilters(
        filters: SessionFilters,
    ) {
        setSessionFilters(filters)
        setSessionCursor(null)
        setSessionCursorHistory([])
        await loadSessions(
            null,
            filters,
        )
    }


    async function changeUserPage(
        nextPage: number,
    ) {
        if (
            !usersPage
            || nextPage < 1
            || nextPage > usersPage.total_pages
        ) {
            return
        }

        try {
            await loadUsers(nextPage)
            setUserPageNumber(nextPage)
        } catch (currentError) {
            setFeedback({
                kind: 'error',
                title: 'Chargement impossible',
                message:
                    currentError instanceof Error
                        ? currentError.message
                        : 'La page demandée n’a pas pu être chargée.',
            })

            window.setTimeout(
                () => setFeedback(null),
                4200,
            )
        }
    }


    async function changeMachinePage(
        nextPage: number,
    ) {
        if (
            !machinesPage
            || nextPage < 1
            || nextPage > machinesPage.total_pages
        ) {
            return
        }

        try {
            await loadMachines(nextPage)
            setMachinePageNumber(nextPage)
        } catch (currentError) {
            setFeedback({
                kind: 'error',
                title: 'Chargement impossible',
                message:
                    currentError instanceof Error
                        ? currentError.message
                        : 'La page demandée n’a pas pu être chargée.',
            })

            window.setTimeout(
                () => setFeedback(null),
                4200,
            )
        }
    }


    async function nextSessionsPage() {
        const nextCursor =
            sessionsPage?.next_cursor

        if (!nextCursor) {
            return
        }

        try {
            await loadSessions(nextCursor)

            setSessionCursorHistory(
                (current) => [
                    ...current,
                    sessionCursor,
                ],
            )

            setSessionCursor(nextCursor)
        } catch (currentError) {
            setFeedback({
                kind: 'error',
                title: 'Chargement impossible',
                message:
                    currentError instanceof Error
                        ? currentError.message
                        : 'La page demandée n’a pas pu être chargée.',
            })

            window.setTimeout(
                () => setFeedback(null),
                4200,
            )
        }
    }


    async function previousSessionsPage() {
        if (sessionCursorHistory.length === 0) {
            return
        }

        const previousCursor =
            sessionCursorHistory[
                sessionCursorHistory.length - 1
            ]

        try {
            await loadSessions(previousCursor)

            setSessionCursorHistory(
                (current) =>
                    current.slice(0, -1),
            )

            setSessionCursor(previousCursor)
        } catch (currentError) {
            setFeedback({
                kind: 'error',
                title: 'Chargement impossible',
                message:
                    currentError instanceof Error
                        ? currentError.message
                        : 'La page demandée n’a pas pu être chargée.',
            })

            window.setTimeout(
                () => setFeedback(null),
                4200,
            )
        }
    }


    function changeTab(nextTab: Tab) {
        setTab(nextTab)
        setFeedback(null)
        setConfirmState(null)
    }


    useEffect(() => {
        if (isAdmin) {
            void loadInitialData()
        }
    }, [isAdmin])


    if (!isAdmin) {
        return (
            <section className="operations-page administration-page">
                <div className="access-denied">
                    <strong>
                        ACCÈS RÉSERVÉ
                    </strong>

                    <p>
                        Cette interface est réservée
                        aux administrateurs.
                    </p>
                </div>
            </section>
        )
    }


    const roleById =
        new Map(
            roles.map(
                (role) => [
                    role.id_role,
                    role.nom_role,
                ],
            ),
        )

    const poleById =
        new Map(
            poteaux.map(
                (pole) => [
                    pole.id_poteau,
                    pole.nom_poteau,
                ],
            ),
        )


    return (
        <section className="operations-page">
            <div className="admin-tabs">
                {(
                    [
                        ['users', 'Utilisateurs'],
                        ['organisation', 'Organisation'],
                        ['machines', 'Machines'],
                        ['sessions', 'Accès'],
                    ] as Array<[Tab, string]>
                ).map(
                    ([value, label]) => (
                        <button
                            type="button"
                            key={value}
                            className={
                                tab === value
                                    ? 'admin-tabs__active'
                                    : ''
                            }
                            onClick={() =>
                                changeTab(value)
                            }
                        >
                            <AdminTabIcon
                                tab={value}
                            />
                            <span>
                                {label}
                            </span>
                        </button>
                    ),
                )}
            </div>


            {loading ? (
                <div
                    className={
                        'data-panel '
                        + 'admin-loading'
                    }
                >
                    Chargement…
                </div>
            ) : (
                <>
                    {tab === 'users' && usersPage && (
                        <UsersAdmin
                            users={usersPage.items}
                            total={usersPage.total}
                            page={usersPage.page}
                            totalPages={
                                usersPage.total_pages
                            }
                            roles={roles}
                            roleById={roleById}
                            runAction={runAdminAction}
                            filters={userFilters}
                            onFiltersChange={
                                applyUserFilters
                            }
                            onPageChange={
                                changeUserPage
                            }
                            requestConfirm={
                                setConfirmState
                            }
                        />
                    )}

                    {tab === 'organisation' && (
                        <OrganisationAdmin
                            departements={
                                departements
                            }
                            unites={unites}
                            poteaux={poteaux}
                            machines={
                                organisationMachines
                            }
                            runAction={
                                runAdminAction
                            }
                            requestConfirm={
                                setConfirmState
                            }
                        />
                    )}

                    {tab === 'machines'
                        && machinesPage
                        && (
                            <MachinesAdmin
                                machines={
                                    machinesPage.items
                                }
                                total={
                                    machinesPage.total
                                }
                                page={
                                    machinesPage.page
                                }
                                totalPages={
                                    machinesPage
                                        .total_pages
                                }
                                poteaux={poteaux}
                                poleById={
                                    poleById
                                }
                                runAction={
                                    runAdminAction
                                }
                                filters={
                                    machineFilters
                                }
                                onFiltersChange={
                                    applyMachineFilters
                                }
                                onPageChange={
                                    changeMachinePage
                                }
                                requestConfirm={
                                    setConfirmState
                                }
                            />
                        )}


                    {tab === 'sessions'
                        && sessionsPage
                        && (
                            <SessionsAdmin
                                sessions={
                                    sessionsPage.items
                                }
                                hasPrevious={
                                    sessionCursorHistory
                                        .length > 0
                                }
                                hasNext={
                                    Boolean(
                                        sessionsPage
                                            .next_cursor,
                                    )
                                }
                                runAction={
                                    runAdminAction
                                }
                                filters={
                                    sessionFilters
                                }
                                onFiltersChange={
                                    applySessionFilters
                                }
                                onPrevious={
                                    previousSessionsPage
                                }
                                onNext={
                                    nextSessionsPage
                                }
                                requestConfirm={
                                    setConfirmState
                                }
                            />
                        )}
                </>
            )}

            {feedback && (
                <AdminToast
                    feedback={feedback}
                />
            )}

            {confirmState && (
                <ConfirmModal
                    state={confirmState}
                    onClose={() =>
                        setConfirmState(null)
                    }
                />
            )}
        </section>
    )
}


function AdminToast({
    feedback,
}: {
    feedback: Exclude<
        AdminFeedback,
        null
    >
}) {
    return (
        <div
            className={
                `admin-toast admin-toast--${feedback.kind}`
            }
            role="status"
            aria-live="polite"
        >
            <div className="admin-toast__icon">
                {
                    feedback.kind === 'success'
                        ? '✓'
                        : '!'
                }
            </div>

            <strong>
                {feedback.message}
            </strong>
        </div>
    )
}


function ConfirmModal({
    state,
    onClose,
}: {
    state: Exclude<
        ConfirmState,
        null
    >
    onClose: () => void
}) {
    const [submitting, setSubmitting] =
        useState(false)

    async function confirm() {
        setSubmitting(true)
        const success =
            await state.action()
        setSubmitting(false)

        if (success) {
            onClose()
        }
    }

    return (
        <div
            className="admin-modal-backdrop"
            onMouseDown={
                (event) => {
                    if (
                        event.target
                        === event.currentTarget
                    ) {
                        onClose()
                    }
                }
            }
        >
            <div
                className="admin-modal admin-modal--confirm"
                role="dialog"
                aria-modal="true"
            >
                <div className="admin-modal__header">
                    <div>
                        <span>CONFIRMATION</span>
                        <h2>{state.title}</h2>
                    </div>

                    <button
                        type="button"
                        aria-label="Fermer"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <p className="admin-confirm-copy">
                    {state.message}
                </p>

                <div className="admin-modal__actions">
                    <button
                        type="button"
                        className="admin-button admin-button--ghost"
                        disabled={submitting}
                        onClick={onClose}
                    >
                        Annuler
                    </button>

                    <button
                        type="button"
                        className={
                            state.danger
                                ? 'admin-button admin-button--danger'
                                : 'admin-button admin-button--primary'
                        }
                        disabled={submitting}
                        onClick={
                            () => void confirm()
                        }
                    >
                        {
                            submitting
                                ? 'Traitement…'
                                : state.confirmLabel
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}


function Pagination({
    page,
    totalPages,
    total,
    label,
    onPageChange,
}: {
    page: number
    totalPages: number
    total: number
    label: string
    onPageChange: (
        page: number,
    ) => Promise<void>
}) {
    const visiblePages =
        Array.from(
            {
                length: Math.min(
                    totalPages,
                    5,
                ),
            },
            (_, index) => {
                if (totalPages <= 5) {
                    return index + 1
                }

                const start =
                    Math.min(
                        Math.max(
                            page - 2,
                            1,
                        ),
                        totalPages - 4,
                    )

                return start + index
            },
        )

    return (
        <div className="admin-pagination">
            <span>
                {total} {label}
            </span>

            <div className="admin-pagination__pages">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                        void onPageChange(
                            page - 1,
                        )
                    }
                >
                    ‹
                </button>

                {visiblePages.map(
                    (pageNumber) => (
                        <button
                            type="button"
                            key={pageNumber}
                            className={
                                pageNumber === page
                                    ? 'admin-pagination__page--active'
                                    : ''
                            }
                            onClick={() =>
                                void onPageChange(
                                    pageNumber,
                                )
                            }
                        >
                            {pageNumber}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    disabled={
                        page >= totalPages
                    }
                    onClick={() =>
                        void onPageChange(
                            page + 1,
                        )
                    }
                >
                    ›
                </button>
            </div>
        </div>
    )
}


function UsersAdmin({
    users,
    total,
    page,
    totalPages,
    roles,
    roleById,
    filters,
    runAction,
    onFiltersChange,
    onPageChange,
    requestConfirm,
}: {
    users: User[]
    total: number
    page: number
    totalPages: number
    roles: Role[]
    roleById: Map<number, string>
    filters: UserFilters
    runAction: (
        action: AdminAction,
        successMessage?: string,
    ) => Promise<boolean>
    onFiltersChange: (
        filters: UserFilters,
    ) => Promise<void>
    onPageChange: (
        page: number,
    ) => Promise<void>
    requestConfirm: (
        state: ConfirmState,
    ) => void
}) {
    const [draftFilters, setDraftFilters] =
        useState<UserFilters>(filters)

    const [editor, setEditor] =
        useState<
            | { mode: 'create' }
            | { mode: 'edit'; user: User }
            | { mode: 'password'; user: User }
            | null
        >(null)

    function displayRole(
        idRole: number,
    ) {
        const role =
            roleById.get(idRole)

        if (!role) {
            return `Rôle ${idRole}`
        }

        if (
            role
            === 'operateur_de_production'
        ) {
            return 'Opérateur de production'
        }

        return role
            .replaceAll('_', ' ')
            .replace(
                /^./,
                (letter) =>
                    letter.toUpperCase(),
            )
    }

    return (
        <section className="admin-section">
            <div className="admin-page-heading">
                <div className="admin-page-heading__title">
                    <AdminTabIcon tab="users" />

                    <div>
                        <h2>
                            Utilisateurs
                        </h2>
                        <p>
                            Gérez les comptes, les rôles et les accès à la plateforme.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="admin-create-user-button"
                    onClick={() =>
                        setEditor({
                            mode: 'create',
                        })
                    }
                >
                    <span className="admin-create-user-button__plus">
                        +
                    </span>
                    <span>
                        Nouvel utilisateur
                    </span>
                </button>
            </div>

            <form
                className="admin-filterbar"
                onSubmit={
                    (event) => {
                        event.preventDefault()
                        void onFiltersChange(
                            draftFilters,
                        )
                    }
                }
            >
                <input
                    type="search"
                    placeholder="Rechercher par nom ou e-mail…"
                    value={draftFilters.search}
                    onChange={
                        (event) =>
                            setDraftFilters({
                                ...draftFilters,
                                search:
                                    event.target.value,
                            })
                    }
                />

                <select
                    value={draftFilters.role}
                    onChange={
                        (event) =>
                            setDraftFilters({
                                ...draftFilters,
                                role:
                                    event.target.value,
                            })
                    }
                >
                    <option value="">
                        Tous les rôles
                    </option>

                    {roles.map(
                        (role) => (
                            <option
                                key={role.id_role}
                                value={role.nom_role}
                            >
                                {
                                    role.nom_role
                                    === 'operateur_de_production'
                                        ? 'Opérateur de production'
                                        : role.nom_role
                                            .replaceAll('_', ' ')
                                            .replace(
                                                /^./,
                                                (letter) =>
                                                    letter.toUpperCase(),
                                            )
                                }
                            </option>
                        ),
                    )}
                </select>

                <select
                    value={draftFilters.active}
                    onChange={
                        (event) =>
                            setDraftFilters({
                                ...draftFilters,
                                active:
                                    event.target.value as UserFilters['active'],
                            })
                    }
                >
                    <option value="">
                        Tous les statuts
                    </option>
                    <option value="true">
                        Actifs
                    </option>
                    <option value="false">
                        Inactifs
                    </option>
                </select>

                <button
                    type="submit"
                    className="admin-button admin-button--dark"
                >
                    Filtrer
                </button>

                <button
                    type="button"
                    className="admin-button admin-button--ghost"
                    onClick={() => {
                        const empty: UserFilters = {
                            search: '',
                            role: '',
                            active: '',
                        }

                        setDraftFilters(empty)
                        void onFiltersChange(empty)
                    }}
                >
                    Réinitialiser
                </button>
            </form>

            <div className="admin-register">
                <div className="admin-users-head">
                    <span>Utilisateur</span>
                    <span>Rôle</span>
                    <span>Statut</span>
                    <span>Actions</span>
                </div>

                {users.map(
                    (user) => (
                        <div
                            className={
                                user.actif
                                    ? 'admin-users-row'
                                    : 'admin-users-row admin-users-row--inactive'
                            }
                            key={user.id_util}
                        >
                            <div className="admin-user-cell">
                                <span className="admin-user-avatar">
                                    {
                                        `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`
                                            .toUpperCase()
                                    }
                                </span>

                                <div className="admin-identity">
                                    <strong>
                                        {user.prenom}{' '}
                                        {user.nom}
                                    </strong>
                                    <span>
                                        {user.email}
                                    </span>
                                </div>
                            </div>

                            <strong className="admin-role-text">
                                {
                                    displayRole(
                                        user.id_role,
                                    )
                                }
                            </strong>

                            <div className="admin-status-stack">
                                <span
                                    className={
                                        user.actif
                                            ? 'admin-status admin-status--active'
                                            : 'admin-status admin-status--inactive'
                                    }
                                >
                                    {
                                        user.actif
                                            ? 'Actif'
                                            : 'Inactif'
                                    }
                                </span>

                                {
                                    !user.actif
                                    && user.date_desactivation
                                    && (
                                        <small>
                                            Depuis {
                                                formatAdminDateTime(
                                                    user.date_desactivation,
                                                )
                                            }
                                        </small>
                                    )
                                }
                            </div>

                            <div className="admin-actions">
                                <button
                                    type="button"
                                    className="admin-action admin-action--edit"
                                    onClick={() =>
                                        setEditor({
                                            mode: 'edit',
                                            user,
                                        })
                                    }
                                >
                                    Modifier
                                </button>

                                <button
                                    type="button"
                                    className="admin-action admin-action--password"
                                    onClick={() =>
                                        setEditor({
                                            mode: 'password',
                                            user,
                                        })
                                    }
                                >
                                    Mot de passe
                                </button>

                                {user.actif ? (
                                    <button
                                        type="button"
                                        className="admin-action admin-action--deactivate"
                                        onClick={() =>
                                            requestConfirm({
                                                title:
                                                    'Désactiver cet utilisateur ?',
                                                message:
                                                    `Le compte de ${user.prenom} ${user.nom} ne pourra plus accéder à la plateforme tant qu’il n’est pas réactivé.`,
                                                confirmLabel:
                                                    'Désactiver',
                                                danger: true,
                                                action:
                                                    () =>
                                                        runAction(
                                                            () =>
                                                                deactivateUser(
                                                                    user.id_util,
                                                                ),
                                                            'Utilisateur désactivé avec succès.',
                                                        ),
                                            })
                                        }
                                    >
                                        Désactiver
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="admin-action admin-action--reactivate"
                                        onClick={() =>
                                            requestConfirm({
                                                title:
                                                    'Réactiver cet utilisateur ?',
                                                message:
                                                    `Le compte de ${user.prenom} ${user.nom} retrouvera l’accès selon son rôle.`,
                                                confirmLabel:
                                                    'Réactiver',
                                                action:
                                                    () =>
                                                        runAction(
                                                            () =>
                                                                activateUser(
                                                                    user.id_util,
                                                                ),
                                                            'Utilisateur réactivé avec succès.',
                                                        ),
                                            })
                                        }
                                    >
                                        Réactiver
                                    </button>
                                )}
                            </div>
                        </div>
                    ),
                )}

                {users.length === 0 && (
                    <AdminEmptyState
                        title="Aucun utilisateur trouvé"
                        message="Aucun compte ne correspond aux filtres sélectionnés."
                    />
                )}

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    label="comptes"
                    onPageChange={
                        onPageChange
                    }
                />
            </div>

            {editor && (
                <UserEditorModal
                    state={editor}
                    roles={roles}
                    runAction={runAction}
                    onClose={() =>
                        setEditor(null)
                    }
                />
            )}
        </section>
    )
}


function UserEditorModal({
    state,
    roles,
    runAction,
    onClose,
}: {
    state:
        | { mode: 'create' }
        | { mode: 'edit'; user: User }
        | { mode: 'password'; user: User }
    roles: Role[]
    runAction: (
        action: AdminAction,
        successMessage?: string,
    ) => Promise<boolean>
    onClose: () => void
}) {
    const user =
        'user' in state
            ? state.user
            : null

    const [form, setForm] =
        useState({
            nom: user?.nom ?? '',
            prenom: user?.prenom ?? '',
            email: user?.email ?? '',
            id_role:
                user?.id_role
                ?? roles[0]?.id_role
                ?? 0,
            password: '',
            confirmPassword: '',
        })

    const [fieldErrors, setFieldErrors] =
        useState<{
            prenom?: string
            nom?: string
            email?: string
            id_role?: string
            password?: string
            confirmPassword?: string
        }>({})

    const [submitting, setSubmitting] =
        useState(false)

    const [showPassword, setShowPassword] =
        useState(false)

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false)

    async function submit(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {
        event.preventDefault()

        const errors: {
            prenom?: string
            nom?: string
            email?: string
            id_role?: string
            password?: string
            confirmPassword?: string
        } = {}

        if (state.mode !== 'password') {
            const cleanFirstName =
                form.prenom.trim()

            const cleanLastName =
                form.nom.trim()

            const cleanEmail =
                form.email.trim()

            const namePattern =
                /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,80}$/

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/

            if (!cleanFirstName) {
                errors.prenom =
                    'Prénom requis.'
            } else if (
                !namePattern.test(
                    cleanFirstName,
                )
            ) {
                errors.prenom =
                    'Utilisez 2 à 80 lettres, espaces, apostrophes ou tirets.'
            }

            if (!cleanLastName) {
                errors.nom =
                    'Nom requis.'
            } else if (
                !namePattern.test(
                    cleanLastName,
                )
            ) {
                errors.nom =
                    'Utilisez 2 à 80 lettres, espaces, apostrophes ou tirets.'
            }

            if (!cleanEmail) {
                errors.email =
                    'E-mail requis.'
            } else if (
                !emailPattern.test(
                    cleanEmail,
                )
            ) {
                errors.email =
                    'Saisissez une adresse e-mail valide.'
            }

            if (!form.id_role) {
                errors.id_role =
                    'Sélectionnez un rôle.'
            }
        }

        if (
            state.mode === 'create'
            || state.mode === 'password'
        ) {
            if (!form.password) {
                errors.password =
                    'Mot de passe requis.'
            } else if (
                form.password.length < 8
            ) {
                errors.password =
                    '8 caractères minimum.'
            }

            if (!form.confirmPassword) {
                errors.confirmPassword =
                    'Confirmez le mot de passe.'
            } else if (
                form.password
                !== form.confirmPassword
            ) {
                errors.confirmPassword =
                    'Les mots de passe ne correspondent pas.'
            }
        }

        if (
            Object.keys(errors).length > 0
        ) {
            setFieldErrors(errors)
            return
        }

        setFieldErrors({})
        setSubmitting(true)
        let success = false

        if (state.mode === 'create') {
            success =
                await runAction(
                    () =>
                        createUser({
                            nom: form.nom,
                            prenom:
                                form.prenom,
                            email:
                                form.email,
                            id_role:
                                Number(
                                    form.id_role,
                                ),
                            mot_de_passe:
                                form.password,
                        }),
                    'Utilisateur créé avec succès.',
                )
        }

        if (
            state.mode === 'edit'
            && user
        ) {
            success =
                await runAction(
                    () =>
                        patchUser(
                            user.id_util,
                            {
                                nom:
                                    form.nom,
                                prenom:
                                    form.prenom,
                                email:
                                    form.email,
                                id_role:
                                    Number(
                                        form.id_role,
                                    ),
                            },
                        ),
                    'Utilisateur modifié avec succès.',
                )
        }

        if (
            state.mode === 'password'
            && user
        ) {
            success =
                await runAction(
                    () =>
                        patchUser(
                            user.id_util,
                            {
                                mot_de_passe:
                                    form.password,
                            },
                        ),
                    'Mot de passe réinitialisé avec succès.',
                )
        }

        setSubmitting(false)

        if (success) {
            onClose()
        }
    }

    const title =
        state.mode === 'create'
            ? 'Nouvel utilisateur'
            : state.mode === 'edit'
                ? 'Modifier l’utilisateur'
                : 'Réinitialiser le mot de passe'

    return (
        <div className="admin-modal-backdrop">
            <form
                className="admin-modal"
                noValidate
                onSubmit={submit}
            >
                <div className="admin-modal__header">
                    <div>
                        <span>UTILISATEURS</span>
                        <h2>{title}</h2>
                    </div>

                    <button
                        type="button"
                        aria-label="Fermer"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {state.mode === 'password' ? (
                    <>
                        <label>
                            <span>
                                Nouveau mot de passe
                            </span>
                            <div className="admin-password-field">
                                <input
                                    className={
                                        fieldErrors.password
                                            ? 'admin-field--invalid'
                                            : ''
                                    }
                                    aria-invalid={
                                        Boolean(
                                            fieldErrors.password,
                                        )
                                    }
                                    maxLength={128}
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    autoComplete="off"
                                    placeholder="8 caractères minimum"
                                    value={form.password}
                                    onChange={
                                        (event) =>
                                            setForm({
                                                ...form,
                                                password:
                                                    event.target.value,
                                            })
                                    }
                                />
                                <button
                                    type="button"
                                    className="admin-password-toggle"
                                    aria-label={
                                        showPassword
                                            ? 'Masquer le mot de passe'
                                            : 'Afficher le mot de passe'
                                    }
                                    onClick={() =>
                                        setShowPassword(
                                            (current) => !current,
                                        )
                                    }
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                                        <circle cx="12" cy="12" r="2.6" />
                                    </svg>
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <span className="admin-field-error">
                                    {fieldErrors.password}
                                </span>
                            )}
                        </label>

                        <label>
                            <span>
                                Confirmer le mot de passe
                            </span>
                            <div className="admin-password-field">
                                <input
                                    className={
                                        fieldErrors.confirmPassword
                                            ? 'admin-field--invalid'
                                            : ''
                                    }
                                    aria-invalid={
                                        Boolean(
                                            fieldErrors.confirmPassword,
                                        )
                                    }
                                    maxLength={128}
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    autoComplete="off"
                                    placeholder="Retapez le mot de passe"
                                    value={
                                        form.confirmPassword
                                    }
                                    onChange={
                                        (event) =>
                                            setForm({
                                                ...form,
                                                confirmPassword:
                                                    event.target.value,
                                            })
                                    }
                                />
                                <button
                                    type="button"
                                    className="admin-password-toggle"
                                    aria-label={
                                        showConfirmPassword
                                            ? 'Masquer le mot de passe'
                                            : 'Afficher le mot de passe'
                                    }
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (current) => !current,
                                        )
                                    }
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                                        <circle cx="12" cy="12" r="2.6" />
                                    </svg>
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && (
                                <span className="admin-field-error">
                                    {fieldErrors.confirmPassword}
                                </span>
                            )}
                        </label>
                    </>
                ) : (
                    <>
                        <div className="admin-modal__grid">
                            <label>
                                <span>Prénom</span>
                                <input
                                    className={
                                        fieldErrors.prenom
                                            ? 'admin-field--invalid'
                                            : ''
                                    }
                                    aria-invalid={
                                        Boolean(
                                            fieldErrors.prenom,
                                        )
                                    }
                                    required
                                    placeholder=""
                                    value={form.prenom}
                                    onChange={
                                        (event) =>
                                            setForm({
                                                ...form,
                                                prenom:
                                                    event.target.value,
                                            })
                                    }
                                />
                                {fieldErrors.prenom && (
                                    <span className="admin-field-error">
                                        {fieldErrors.prenom}
                                    </span>
                                )}
                            </label>

                            <label>
                                <span>Nom</span>
                                <input
                                    className={
                                        fieldErrors.nom
                                            ? 'admin-field--invalid'
                                            : ''
                                    }
                                    aria-invalid={
                                        Boolean(
                                            fieldErrors.nom,
                                        )
                                    }
                                    required
                                    placeholder=""
                                    value={form.nom}
                                    onChange={
                                        (event) =>
                                            setForm({
                                                ...form,
                                                nom:
                                                    event.target.value,
                                            })
                                    }
                                />
                                {fieldErrors.nom && (
                                    <span className="admin-field-error">
                                        {fieldErrors.nom}
                                    </span>
                                )}
                            </label>
                        </div>

                        <label>
                            <span>E-mail</span>
                            <input
                                className={
                                    fieldErrors.email
                                        ? 'admin-field--invalid'
                                        : ''
                                }
                                aria-invalid={
                                    Boolean(
                                        fieldErrors.email,
                                    )
                                }
                                required
                                type="text"
                                inputMode="email"
                                autoComplete="off"
                                spellCheck={false}
                                name="admin-user-email"
                                placeholder="exemple@domaine.com"
                                value={form.email}
                                onChange={
                                    (event) =>
                                        setForm({
                                            ...form,
                                            email:
                                                event.target.value,
                                        })
                                }
                            />
                            {fieldErrors.email && (
                                <span className="admin-field-error">
                                    {fieldErrors.email}
                                </span>
                            )}
                        </label>

                        <label>
                            <span>Rôle</span>
                            <select
                                className={
                                    fieldErrors.id_role
                                        ? 'admin-field--invalid'
                                        : ''
                                }
                                aria-invalid={
                                    Boolean(
                                        fieldErrors.id_role,
                                    )
                                }
                                required
                                value={form.id_role}
                                onChange={
                                    (event) =>
                                        setForm({
                                            ...form,
                                            id_role:
                                                Number(
                                                    event.target.value,
                                                ),
                                        })
                                }
                            >
                                {roles.map(
                                    (role) => (
                                        <option
                                            key={
                                                role.id_role
                                            }
                                            value={
                                                role.id_role
                                            }
                                        >
                                            {
                                                role.nom_role
                                                === 'operateur_de_production'
                                                    ? 'Opérateur de production'
                                                    : role.nom_role
                                                        .replaceAll('_', ' ')
                                                        .replace(
                                                            /^./,
                                                            (letter) =>
                                                                letter.toUpperCase(),
                                                        )
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                            {fieldErrors.id_role && (
                                <span className="admin-field-error">
                                    {fieldErrors.id_role}
                                </span>
                            )}
                        </label>

                        {state.mode === 'create' && (
                            <>
                                <label>
                                    <span>
                                        Mot de passe
                                    </span>
                                    <div className="admin-password-field">
                                        <input
                                            maxLength={128}
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            autoComplete="off"
                                            placeholder="8 caractères minimum"
                                            value={form.password}
                                            onChange={
                                                (event) =>
                                                    setForm({
                                                        ...form,
                                                        password:
                                                            event.target.value,
                                                    })
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="admin-password-toggle"
                                            aria-label={
                                                showPassword
                                                    ? 'Masquer le mot de passe'
                                                    : 'Afficher le mot de passe'
                                            }
                                            onClick={() =>
                                                setShowPassword(
                                                    (current) => !current,
                                                )
                                            }
                                        >
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                                                <circle cx="12" cy="12" r="2.6" />
                                            </svg>
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <span className="admin-field-error">
                                            {fieldErrors.password}
                                        </span>
                                    )}
                                </label>

                                <label>
                                    <span>
                                        Confirmer le mot de passe
                                    </span>
                                    <div className="admin-password-field">
                                        <input
                                            maxLength={128}
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            autoComplete="off"
                                            placeholder="Retapez le mot de passe"
                                            value={form.confirmPassword}
                                            onChange={
                                                (event) =>
                                                    setForm({
                                                        ...form,
                                                        confirmPassword:
                                                            event.target.value,
                                                    })
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="admin-password-toggle"
                                            aria-label={
                                                showConfirmPassword
                                                    ? 'Masquer le mot de passe'
                                                    : 'Afficher le mot de passe'
                                            }
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (current) => !current,
                                                )
                                            }
                                        >
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                                                <circle cx="12" cy="12" r="2.6" />
                                            </svg>
                                        </button>
                                    </div>
                                    {fieldErrors.confirmPassword && (
                                        <span className="admin-field-error">
                                            {fieldErrors.confirmPassword}
                                        </span>
                                    )}
                                </label>
                            </>
                        )}
                    </>
                )}

                <div className="admin-modal__actions">
                    <button
                        type="button"
                        className="admin-button admin-button--ghost"
                        disabled={submitting}
                        onClick={onClose}
                    >
                        Annuler
                    </button>

                    <button
                        type="submit"
                        className="admin-button admin-button--primary"
                        disabled={submitting}
                    >
                        {
                            submitting
                                ? 'Enregistrement…'
                                : state.mode === 'create'
                                    ? 'Créer le compte'
                                    : state.mode === 'password'
                                        ? 'Réinitialiser'
                                        : 'Enregistrer'
                        }
                    </button>
                </div>
            </form>
        </div>
    )
}


function OrganisationAdmin({
    departements,
    unites,
    poteaux,
    machines,
    runAction,
    requestConfirm,
}: {
    departements: Departement[]
    unites: Unite[]
    poteaux: Poteau[]
    machines: Machine[]
    runAction: (
        action: AdminAction,
        successMessage?: string,
    ) => Promise<boolean>
    requestConfirm: (
        state: ConfirmState,
    ) => void
}) {
    const navigate =
        useNavigate()

    const [selectedDepartmentId, setSelectedDepartmentId] =
        useState(
            departements[0]?.id_dep ?? 0,
        )

    const selectedDepartment =
        departements.find(
            (department) =>
                department.id_dep
                === selectedDepartmentId,
        ) ?? null

    const departmentUnits =
        unites.filter(
            (unit) =>
                unit.id_dep
                === selectedDepartmentId,
        )

    const [expandedUnitId, setExpandedUnitId] =
        useState(
            unites.find(
                (unit) =>
                    unit.id_dep
                    === (departements[0]?.id_dep ?? 0),
            )?.id_unite ?? 0,
        )

    const expandedUnit =
        departmentUnits.find(
            (unit) =>
                unit.id_unite
                === expandedUnitId,
        ) ?? null

    const [departmentModal, setDepartmentModal] =
        useState<
            | { mode: 'create' }
            | {
                mode: 'edit'
                item: Departement
            }
            | null
        >(null)

    const [unitModal, setUnitModal] =
        useState<
            | { mode: 'create' }
            | {
                mode: 'edit'
                item: Unite
            }
            | null
        >(null)

    const [poleModal, setPoleModal] =
        useState<
            | { mode: 'create' }
            | {
                mode: 'edit'
                item: Poteau
            }
            | null
        >(null)

    const departmentPoleCount =
        departmentUnits.reduce(
            (total, unit) =>
                total
                + poteaux.filter(
                    (pole) =>
                        pole.id_unite
                        === unit.id_unite,
                ).length,
            0,
        )

    return (
        <section className="admin-section">
            <div className="admin-page-heading admin-page-heading--organisation">
                <div className="admin-page-heading__title">
                    <AdminTabIcon tab="organisation" />

                    <div>
                        <h2>
                            Organisation
                        </h2>
                        <p>
                            Parcourez la structure par département, UET et poteaux.
                        </p>
                    </div>
                </div>
            </div>

            <div className="admin-organisation-topbar">
                <div className="admin-department-switcher">
                    {departements.map(
                        (department) => (
                            <button
                                type="button"
                                key={department.id_dep}
                                className={
                                    department.id_dep
                                        === selectedDepartmentId
                                        ? 'admin-department-chip admin-department-chip--active'
                                        : 'admin-department-chip'
                                }
                                onClick={() => {
                                    setSelectedDepartmentId(
                                        department.id_dep,
                                    )
                                    setExpandedUnitId(
                                        unites.find(
                                            (unit) =>
                                                unit.id_dep
                                                === department.id_dep,
                                        )?.id_unite ?? 0,
                                    )
                                }}
                            >
                                {department.nom_dep}
                            </button>
                        ),
                    )}
                </div>
            </div>

            {selectedDepartment && (
                departmentUnits.length === 0 ? (
                    <section className="admin-department-unavailable">
                        <div className="admin-empty-organisation-icon">
                            <svg viewBox="0 0 64 64" aria-hidden="true">
                                <rect x="27" y="8" width="10" height="10" rx="2" />
                                <path d="M32 18v10M15 38v-8h34v8M15 38v8M32 30v16M49 38v8" />
                                <rect x="9" y="46" width="12" height="10" rx="2" />
                                <rect x="26" y="46" width="12" height="10" rx="2" />
                                <rect x="43" y="46" width="12" height="10" rx="2" />
                            </svg>
                        </div>

                        <strong>
                            Ce département n’est pas encore intégré
                        </strong>

                        <p>
                            Le suivi opérationnel de {selectedDepartment.nom_dep} sera disponible lorsqu’il sera configuré dans SOMACA RADAR.
                        </p>
                    </section>
                ) : (
                    <section className="admin-org-tree">
                        <header className="admin-org-tree__header">
                            <div>
                                <span className="admin-org-tree__eyebrow">
                                    DÉPARTEMENT
                                </span>

                                <h3>
                                    {selectedDepartment.nom_dep}
                                </h3>

                                <p>
                                    {departmentUnits.length} UET configurée{
                                        departmentUnits.length > 1
                                            ? 's'
                                            : ''
                                    } · {departmentPoleCount} poteau{
                                        departmentPoleCount > 1
                                            ? 'x'
                                            : ''
                                    } au total
                                </p>
                            </div>

                            <div className="admin-org-tree__header-actions">
                                <div className="admin-actions">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDepartmentModal({
                                                mode: 'edit',
                                                item:
                                                    selectedDepartment,
                                            })
                                        }
                                    >
                                        Modifier
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            requestConfirm({
                                                title:
                                                    'Supprimer ce département ?',
                                                message:
                                                    'La suppression sera refusée si ce département possède déjà un historique structurel.',
                                                confirmLabel:
                                                    'Supprimer',
                                                danger: true,
                                                action:
                                                    () =>
                                                        runAction(
                                                            () =>
                                                                deleteOrganisationResource(
                                                                    'departements',
                                                                    selectedDepartment.id_dep,
                                                                ),
                                                            'Département supprimé avec succès.',
                                                        ),
                                            })
                                        }
                                    >
                                        Supprimer
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="admin-org-add-button"
                                    onClick={() =>
                                        setUnitModal({
                                            mode: 'create',
                                        })
                                    }
                                >
                                    <span>+</span>
                                    Ajouter une UET
                                </button>
                            </div>
                        </header>

                        <div className="admin-org-units">
                            {departmentUnits.map(
                                (unit) => {
                                    const isExpanded =
                                        unit.id_unite
                                        === expandedUnitId

                                    const unitPoles =
                                        poteaux.filter(
                                            (pole) =>
                                                pole.id_unite
                                                === unit.id_unite,
                                        )

                                    return (
                                        <article
                                            key={unit.id_unite}
                                            className={
                                                isExpanded
                                                    ? 'admin-org-unit admin-org-unit--expanded'
                                                    : 'admin-org-unit'
                                            }
                                        >
                                            <div className="admin-org-unit__summary">
                                                <button
                                                    type="button"
                                                    className="admin-org-unit__toggle"
                                                    aria-expanded={
                                                        isExpanded
                                                    }
                                                    onClick={() =>
                                                        setExpandedUnitId(
                                                            isExpanded
                                                                ? 0
                                                                : unit.id_unite,
                                                        )
                                                    }
                                                >
                                                    <span className="admin-org-unit__chevron">
                                                        <svg viewBox="0 0 20 20" aria-hidden="true">
                                                            <path d="m6.5 8 3.5 3.5L13.5 8" />
                                                        </svg>
                                                    </span>

                                                    <span className="admin-org-unit__identity">
                                                        <strong>
                                                            {unit.nom_unite}
                                                        </strong>

                                                        <span>
                                                            {unitPoles.length} poteau{
                                                                unitPoles.length > 1
                                                                    ? 'x'
                                                                    : ''
                                                            } configuré{
                                                                unitPoles.length > 1
                                                                    ? 's'
                                                                    : ''
                                                            }
                                                        </span>
                                                    </span>
                                                </button>

                                                <div className="admin-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setUnitModal({
                                                                mode: 'edit',
                                                                item: unit,
                                                            })
                                                        }
                                                    >
                                                        Modifier
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            requestConfirm({
                                                                title:
                                                                    'Supprimer cette UET ?',
                                                                message:
                                                                    'La suppression sera refusée si cette UET possède déjà un historique structurel.',
                                                                confirmLabel:
                                                                    'Supprimer',
                                                                danger: true,
                                                                action:
                                                                    () =>
                                                                        runAction(
                                                                            () =>
                                                                                deleteOrganisationResource(
                                                                                    'unites',
                                                                                    unit.id_unite,
                                                                                ),
                                                                            'UET supprimée avec succès.',
                                                                        ),
                                                            })
                                                        }
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="admin-org-unit__details">
                                                    <div className="admin-org-poles-toolbar">
                                                        <span>
                                                            POTEAUX ({unitPoles.length})
                                                        </span>

                                                        <button
                                                            type="button"
                                                            className="admin-org-add-button admin-org-add-button--small"
                                                            onClick={() => {
                                                                setExpandedUnitId(
                                                                    unit.id_unite,
                                                                )
                                                                setPoleModal({
                                                                    mode: 'create',
                                                                })
                                                            }}
                                                        >
                                                            <span>+</span>
                                                            Ajouter un poteau
                                                        </button>
                                                    </div>

                                                    {unitPoles.length === 0 ? (
                                                        <div className="admin-org-empty-poles">
                                                            <div className="admin-org-empty-poles__icon">
                                                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                                                    <path d="M12 3v18M8 7h8M7 11h10M6 21h12M9 11l-3 10M15 11l3 10" />
                                                                </svg>
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    Aucun poteau configuré pour cette UET
                                                                </strong>
                                                                <p>
                                                                    Commencez par ajouter un poteau pour organiser cette UET.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="admin-org-pole-grid">
                                                            {unitPoles.map(
                                                                (pole) => (
                                                                    <article
                                                                        key={pole.id_poteau}
                                                                        className="admin-org-pole"
                                                                    >
                                                                        <div className="admin-org-pole__icon">
                                                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                                                <path d="M12 3v18M8 7h8M7 11h10M6 21h12M9 11l-3 10M15 11l3 10" />
                                                                            </svg>
                                                                        </div>

                                                                        <div className="admin-org-pole__identity">
                                                                            <strong>
                                                                                {pole.nom_poteau}
                                                                            </strong>

                                                                            {(() => {
                                                                                const poleMachines =
                                                                                    machines.filter(
                                                                                        (machine) =>
                                                                                            machine.id_poteau
                                                                                            === pole.id_poteau,
                                                                                    )

                                                                                return (
                                                                                    <>
                                                                                        <span>
                                                                                            {
                                                                                                pole.represente_carte
                                                                                                    ? 'Sur la cartographie'
                                                                                                    : 'Non représenté sur la carte'
                                                                                            }
                                                                                            {' · '}
                                                                                            {poleMachines.length} machine{
                                                                                                poleMachines.length > 1
                                                                                                    ? 's'
                                                                                                    : ''
                                                                                            }
                                                                                        </span>

                                                                                        {
                                                                                            poleMachines.length > 0
                                                                                            && (
                                                                                                <span className="admin-org-pole__machines">
                                                                                                    {
                                                                                                        poleMachines
                                                                                                            .map(
                                                                                                                (machine) =>
                                                                                                                    machine.nom_machine,
                                                                                                            )
                                                                                                            .join(' · ')
                                                                                                    }
                                                                                                </span>
                                                                                            )
                                                                                        }

                                                                                        {
                                                                                            pole.represente_carte
                                                                                            && (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="admin-org-map-link"
                                                                                                    onClick={() =>
                                                                                                        navigate(
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
                                                                                                    Voir sur la carte
                                                                                                </button>
                                                                                            )
                                                                                        }
                                                                                    </>
                                                                                )
                                                                            })()}
                                                                        </div>

                                                                        <div className="admin-actions">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setExpandedUnitId(
                                                                                        unit.id_unite,
                                                                                    )
                                                                                    setPoleModal({
                                                                                        mode: 'edit',
                                                                                        item: pole,
                                                                                    })
                                                                                }}
                                                                            >
                                                                                Modifier
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    requestConfirm({
                                                                                        title:
                                                                                            'Supprimer ce poteau ?',
                                                                                        message:
                                                                                            'La suppression sera refusée si ce poteau possède déjà un historique structurel.',
                                                                                        confirmLabel:
                                                                                            'Supprimer',
                                                                                        danger: true,
                                                                                        action:
                                                                                            () =>
                                                                                                runAction(
                                                                                                    () =>
                                                                                                        deleteOrganisationResource(
                                                                                                            'poteaux',
                                                                                                            pole.id_poteau,
                                                                                                        ),
                                                                                                    'Poteau supprimé avec succès.',
                                                                                                ),
                                                                                    })
                                                                                }
                                                                            >
                                                                                Supprimer
                                                                            </button>
                                                                        </div>
                                                                    </article>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </article>
                                    )
                                },
                            )}
                        </div>
                    </section>
                )
            )}

            {departmentModal && (
                <OrganisationEditorModal
                    type="departement"
                    state={departmentModal}
                    parentId={null}
                    runAction={runAction}
                    onClose={() =>
                        setDepartmentModal(null)
                    }
                />
            )}

            {unitModal && selectedDepartment && (
                <OrganisationEditorModal
                    type="unite"
                    state={unitModal}
                    parentId={
                        selectedDepartment.id_dep
                    }
                    runAction={runAction}
                    onClose={() =>
                        setUnitModal(null)
                    }
                />
            )}

            {poleModal && expandedUnit && (
                <OrganisationEditorModal
                    type="poteau"
                    state={poleModal}
                    parentId={
                        expandedUnit.id_unite
                    }
                    runAction={runAction}
                    onClose={() =>
                        setPoleModal(null)
                    }
                />
            )}
        </section>
    )
}



function OrganisationEditorModal({
    type,
    state,
    parentId,
    runAction,
    onClose,
}: {
    type:
        | 'departement'
        | 'unite'
        | 'poteau'
    state:
        | { mode: 'create' }
        | {
            mode: 'edit'
            item:
                | Departement
                | Unite
                | Poteau
        }
    parentId: number | null
    runAction: (
        action: AdminAction,
        successMessage?: string,
    ) => Promise<boolean>
    onClose: () => void
}) {
    const initialName =
        state.mode === 'edit'
            ? (
                'nom_dep' in state.item
                    ? state.item.nom_dep
                    : 'nom_unite' in state.item
                        ? state.item.nom_unite
                        : state.item.nom_poteau
            )
            : ''

    const [name, setName] =
        useState(initialName)

    const [submitting, setSubmitting] =
        useState(false)

    const [nameError, setNameError] =
        useState('')

    async function submit(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {
        event.preventDefault()

        const cleanName =
            name.trim()

        if (!cleanName) {
            setNameError(
                'Nom requis.',
            )
            return
        }

        if (cleanName.length > 100) {
            setNameError(
                '100 caractères maximum.',
            )
            return
        }

        setNameError('')
        setSubmitting(true)
        let success = false

        if (type === 'departement') {
            success =
                state.mode === 'create'
                    ? await runAction(
                        () =>
                            createOrganisationResource(
                                'departements',
                                {
                                    nom_dep:
                                        cleanName,
                                },
                            ),
                        'Département ajouté avec succès.',
                    )
                    : await runAction(
                        () =>
                            patchOrganisationResource(
                                'departements',
                                (state.item as Departement)
                                    .id_dep,
                                {
                                    nom_dep:
                                        cleanName,
                                },
                            ),
                        'Département modifié avec succès.',
                    )
        }

        if (
            type === 'unite'
            && parentId
        ) {
            success =
                state.mode === 'create'
                    ? await runAction(
                        () =>
                            createOrganisationResource(
                                'unites',
                                {
                                    nom_unite:
                                        cleanName,
                                    id_dep:
                                        parentId,
                                },
                            ),
                        'UET ajoutée avec succès.',
                    )
                    : await runAction(
                        () =>
                            patchOrganisationResource(
                                'unites',
                                (state.item as Unite)
                                    .id_unite,
                                {
                                    nom_unite:
                                        cleanName,
                                },
                            ),
                        'UET modifiée avec succès.',
                    )
        }

        if (
            type === 'poteau'
            && parentId
        ) {
            success =
                state.mode === 'create'
                    ? await runAction(
                        () =>
                            createOrganisationResource(
                                'poteaux',
                                {
                                    nom_poteau:
                                        cleanName,
                                    id_unite:
                                        parentId,
                                },
                            ),
                        'Poteau ajouté avec succès.',
                    )
                    : await runAction(
                        () =>
                            patchOrganisationResource(
                                'poteaux',
                                (state.item as Poteau)
                                    .id_poteau,
                                {
                                    nom_poteau:
                                        cleanName,
                                },
                            ),
                        'Poteau modifié avec succès.',
                    )
        }

        setSubmitting(false)

        if (success) {
            onClose()
        }
    }

    const noun =
        type === 'departement'
            ? 'département'
            : type === 'unite'
                ? 'UET'
                : 'poteau'

    return (
        <div className="admin-modal-backdrop">
            <form
                className="admin-modal admin-modal--small"
                noValidate
                onSubmit={submit}
            >
                <div className="admin-modal__header">
                    <div>
                        <span>
                            ORGANISATION
                        </span>
                        <h2>
                            {
                                state.mode === 'create'
                                    ? `Ajouter un ${noun}`
                                    : `Modifier le ${noun}`
                            }
                        </h2>
                    </div>

                    <button
                        type="button"
                        aria-label="Fermer"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <label>
                    <span>Nom</span>
                    <input
                        className={
                            nameError
                                ? 'admin-field--invalid'
                                : ''
                        }
                        aria-invalid={
                            Boolean(nameError)
                        }
                        autoFocus
                        required
                        maxLength={100}
                        value={name}
                        onChange={
                            (event) =>
                                setName(
                                    event.target.value,
                                )
                        }
                    />
                    {nameError && (
                        <span className="admin-field-error">
                            {nameError}
                        </span>
                    )}
                </label>

                <div className="admin-modal__actions">
                    <button
                        type="button"
                        className="admin-button admin-button--ghost"
                        onClick={onClose}
                    >
                        Annuler
                    </button>

                    <button
                        type="submit"
                        className="admin-button admin-button--primary"
                        disabled={submitting}
                    >
                        {
                            submitting
                                ? 'Enregistrement…'
                                : 'Enregistrer'
                        }
                    </button>
                </div>
            </form>
        </div>
    )
}


function MachinesAdmin({
    machines,
    total,
    page,
    totalPages,
    poteaux,
    poleById,
    filters,
    runAction,
    onFiltersChange,
    onPageChange,
    requestConfirm,
}: {
    machines: Machine[]
    total: number
    page: number
    totalPages: number
    poteaux: Poteau[]
    poleById: Map<number, string>
    filters: MachineFilters
    runAction: (
        action: AdminAction,
        successMessage?: string,
    ) => Promise<boolean>
    onFiltersChange: (
        filters: MachineFilters,
    ) => Promise<void>
    onPageChange: (
        page: number,
    ) => Promise<void>
    requestConfirm: (
        state: ConfirmState,
    ) => void
}) {
    const [draftFilters, setDraftFilters] =
        useState<MachineFilters>(filters)

    const [editor, setEditor] =
        useState<
            | { mode: 'create' }
            | {
                mode: 'edit'
                machine: Machine
            }
            | null
        >(null)

    const machineTypes =
        useMemo(
            () =>
                Array.from(
                    new Set(
                        machines.map(
                            (machine) =>
                                machine.type_machine,
                        ),
                    ),
                ).sort(),
            [machines],
        )

    return (
        <section className="admin-section">
            <div className="admin-page-heading">
                <div className="admin-page-heading__title">
                    <AdminTabIcon tab="machines" />

                    <div>
                        <h2>
                            Machines
                        </h2>
                        <p>
                            Gérez l’inventaire, le rattachement et le cycle de service.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="admin-button admin-button--accent"
                    onClick={() =>
                        setEditor({
                            mode: 'create',
                        })
                    }
                >
                    <span>+</span>
                    Nouvelle machine
                </button>
            </div>

            <form
                className="admin-filterbar admin-filterbar--machines"
                onSubmit={
                    (event) => {
                        event.preventDefault()
                        void onFiltersChange(
                            draftFilters,
                        )
                    }
                }
            >
                <input
                    type="search"
                    placeholder="Rechercher par nom ou IP…"
                    value={draftFilters.search}
                    onChange={
                        (event) =>
                            setDraftFilters({
                                ...draftFilters,
                                search:
                                    event.target.value,
                            })
                    }
                />

                <select
                    value={
                        draftFilters.typeMachine
                    }
                    onChange={
                        (event) =>
                            setDraftFilters({
                                ...draftFilters,
                                typeMachine:
                                    event.target.value,
                            })
                    }
                >
                    <option value="">
                        Tous les types
                    </option>

                    {machineTypes.map(
                        (type) => (
                            <option
                                key={type}
                                value={type}
                            >
                                {type}
                            </option>
                        ),
                    )}
                </select>

                <select
                    value={draftFilters.poleId}
                    onChange={
                        (event) =>
                            setDraftFilters({
                                ...draftFilters,
                                poleId:
                                    event.target.value,
                            })
                    }
                >
                    <option value="">
                        Tous les poteaux
                    </option>

                    {poteaux.map(
                        (pole) => (
                            <option
                                key={
                                    pole.id_poteau
                                }
                                value={
                                    pole.id_poteau
                                }
                            >
                                {
                                    pole.nom_poteau
                                }
                            </option>
                        ),
                    )}
                </select>

                <select
                    value={draftFilters.active}
                    onChange={
                        (event) =>
                            setDraftFilters({
                                ...draftFilters,
                                active:
                                    event.target.value as MachineFilters['active'],
                            })
                    }
                >
                    <option value="">
                        Toutes
                    </option>
                    <option value="true">
                        En service
                    </option>
                    <option value="false">
                        Décommissionnées
                    </option>
                </select>

                <button
                    type="submit"
                    className="admin-button admin-button--dark"
                >
                    Filtrer
                </button>

                <button
                    type="button"
                    className="admin-button admin-button--ghost"
                    onClick={() => {
                        const empty: MachineFilters = {
                            search: '',
                            typeMachine: '',
                            poleId: '',
                            active: '',
                        }

                        setDraftFilters(empty)
                        void onFiltersChange(empty)
                    }}
                >
                    Réinitialiser
                </button>
            </form>

            <div className="admin-register">
                <div className="admin-table-scroll">
                <div className="admin-machines-head">
                    <span>Machine</span>
                    <span>Type</span>
                    <span>Poteau</span>
                    <span>Service</span>
                    <span>Actions</span>
                </div>

                {machines.map(
                    (machine) => (
                        <div
                            className="admin-machines-row"
                            key={
                                machine.id_machine
                            }
                        >
                            <div className="admin-identity">
                                <strong>
                                    {
                                        machine.nom_machine
                                    }
                                </strong>
                                <span>
                                    {
                                        machine.ip_address
                                    }
                                </span>
                            </div>

                            <span>
                                {
                                    machine.type_machine
                                }
                            </span>

                            <strong>
                                {
                                    poleById.get(
                                        machine.id_poteau,
                                    )
                                    ?? `Poteau ${machine.id_poteau}`
                                }
                            </strong>

                            <div className="admin-status-stack">
                                <span
                                    className={
                                        machine.actif
                                            ? 'admin-service-state admin-service-state--active'
                                            : 'admin-service-state admin-service-state--inactive'
                                    }
                                >
                                    {
                                        machine.actif
                                            ? 'En service'
                                            : 'Décommissionnée'
                                    }
                                </span>

                                {
                                    !machine.actif
                                    && machine.date_decommissionnement
                                    && (
                                        <small>
                                            Depuis {
                                                formatAdminDateTime(
                                                    machine.date_decommissionnement,
                                                )
                                            }
                                        </small>
                                    )
                                }
                            </div>

                            <div className="admin-actions">
                                <button
                                    type="button"
                                    className="admin-action admin-action--edit"
                                    onClick={() =>
                                        setEditor({
                                            mode: 'edit',
                                            machine,
                                        })
                                    }
                                >
                                    Modifier
                                </button>

                                {machine.actif ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            requestConfirm({
                                                title:
                                                    'Décommissionner cette machine ?',
                                                message:
                                                    `${machine.nom_machine} restera dans l’historique mais ne sera plus considérée comme une machine active.`,
                                                confirmLabel:
                                                    'Décommissionner',
                                                danger: true,
                                                action:
                                                    () =>
                                                        runAction(
                                                            () =>
                                                                decommissionMachine(
                                                                    machine.id_machine,
                                                                ),
                                                            'Machine décommissionnée avec succès.',
                                                        ),
                                            })
                                        }
                                    >
                                        Mettre hors service
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            requestConfirm({
                                                title:
                                                    'Réactiver cette machine ?',
                                                message:
                                                    `${machine.nom_machine} redeviendra disponible dans l’inventaire actif.`,
                                                confirmLabel:
                                                    'Réactiver',
                                                action:
                                                    () =>
                                                        runAction(
                                                            () =>
                                                                reactivateMachine(
                                                                    machine.id_machine,
                                                                ),
                                                            'Machine réactivée avec succès.',
                                                        ),
                                            })
                                        }
                                    >
                                        Réactiver
                                    </button>
                                )}
                            </div>
                        </div>
                    ),
                )}

                {machines.length === 0 && (
                    <AdminEmptyState
                        title="Aucune machine trouvée"
                        message="Aucune machine ne correspond aux filtres sélectionnés."
                    />
                )}

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    label="machines"
                    onPageChange={
                        onPageChange
                    }
                />
                </div>
            </div>

            {editor && (
                <MachineEditorModal
                    state={editor}
                    poteaux={poteaux}
                    runAction={runAction}
                    onClose={() =>
                        setEditor(null)
                    }
                />
            )}
        </section>
    )
}


function MachineEditorModal({
    state,
    poteaux,
    runAction,
    onClose,
}: {
    state:
        | { mode: 'create' }
        | {
            mode: 'edit'
            machine: Machine
        }
    poteaux: Poteau[]
    runAction: (
        action: AdminAction,
        successMessage?: string,
    ) => Promise<boolean>
    onClose: () => void
}) {
    const machine =
        state.mode === 'edit'
            ? state.machine
            : null

    const [form, setForm] =
        useState({
            nom_machine:
                machine?.nom_machine
                ?? '',
            type_machine:
                machine?.type_machine
                ?? '',
            ip_address:
                machine?.ip_address
                ?? '',
            mac_address:
                machine?.mac_address
                ?? '',
            date_installation:
                machine?.date_installation
                ?? new Date()
                    .toISOString()
                    .slice(0, 10),
            id_poteau:
                machine?.id_poteau
                ?? poteaux[0]?.id_poteau
                ?? 0,
        })

    const [submitting, setSubmitting] =
        useState(false)

    const [fieldErrors, setFieldErrors] =
        useState<{
            nom_machine?: string
            type_machine?: string
            ip_address?: string
            mac_address?: string
            date_installation?: string
            id_poteau?: string
        }>({})

    function isValidIpAddress(
        value: string,
    ) {
        const ipv4Parts =
            value.split('.')

        if (ipv4Parts.length === 4) {
            return ipv4Parts.every(
                (part) => {
                    if (!/^\d{1,3}$/.test(part)) {
                        return false
                    }

                    const number =
                        Number(part)

                    return (
                        number >= 0
                        && number <= 255
                        && String(number)
                            === String(
                                Number(part),
                            )
                    )
                },
            )
        }

        // Keep IPv6 accepted without forcing IPv4-only data.
        return (
            value.includes(':')
            && /^[0-9a-fA-F:]+$/.test(value)
            && value.length <= 45
        )
    }

    function normalizeMacAddress(
        value: string,
    ) {
        const compact =
            value
                .trim()
                .replace(/[^0-9a-fA-F]/g, '')
                .toUpperCase()

        if (compact.length !== 12) {
            return value.trim()
        }

        return compact
            .match(/.{1,2}/g)
            ?.join(':')
            ?? value.trim()
    }

    function isValidMacAddress(
        value: string,
    ) {
        return /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(
            normalizeMacAddress(value),
        )
    }

    async function submit(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {
        event.preventDefault()

        const errors: {
            nom_machine?: string
            type_machine?: string
            ip_address?: string
            mac_address?: string
            date_installation?: string
            id_poteau?: string
        } = {}

        const cleanName =
            form.nom_machine.trim()

        const cleanType =
            form.type_machine.trim()

        const cleanIp =
            form.ip_address.trim()

        const cleanMac =
            form.mac_address.trim()
                ? normalizeMacAddress(
                    form.mac_address,
                )
                : ''

        if (!cleanName) {
            errors.nom_machine =
                'Nom requis.'
        } else if (
            cleanName.length > 100
        ) {
            errors.nom_machine =
                '100 caractères maximum.'
        }

        if (!cleanType) {
            errors.type_machine =
                'Type requis.'
        } else if (
            cleanType.length > 50
        ) {
            errors.type_machine =
                '50 caractères maximum.'
        }

        if (!cleanIp) {
            errors.ip_address =
                'Adresse IP requise.'
        } else if (
            !isValidIpAddress(cleanIp)
        ) {
            errors.ip_address =
                'Adresse IP invalide.'
        }

        if (
            cleanMac
            && !isValidMacAddress(cleanMac)
        ) {
            errors.mac_address =
                'Format attendu : AA:BB:CC:DD:EE:FF.'
        }

        if (!form.date_installation) {
            errors.date_installation =
                'Date requise.'
        } else if (
            form.date_installation
            > new Date()
                .toISOString()
                .slice(0, 10)
        ) {
            errors.date_installation =
                'La date ne peut pas être dans le futur.'
        }

        if (!form.id_poteau) {
            errors.id_poteau =
                'Sélectionnez un poteau.'
        }

        if (
            Object.keys(errors).length > 0
        ) {
            setFieldErrors(errors)
            return
        }

        setFieldErrors({})
        setSubmitting(true)

        const payload = {
            nom_machine:
                cleanName,
            type_machine:
                cleanType,
            ip_address:
                cleanIp,
            mac_address:
                cleanMac || null,
            date_installation:
                form.date_installation,
            id_poteau:
                Number(
                    form.id_poteau,
                ),
        }

        const success =
            state.mode === 'edit'
                ? await runAction(
                    () =>
                        patchMachine(
                            state.machine.id_machine,
                            payload,
                        ),
                    'Machine modifiée avec succès.',
                )
                : await runAction(
                    () =>
                        createMachine(
                            payload,
                        ),
                    'Machine ajoutée avec succès.',
                )

        setSubmitting(false)

        if (success) {
            onClose()
        }
    }

    return (
        <div className="admin-modal-backdrop">
            <form
                className="admin-modal"
                noValidate
                onSubmit={submit}
            >
                <div className="admin-modal__header">
                    <div>
                        <span>MACHINES</span>
                        <h2>
                            {
                                state.mode === 'edit'
                                    ? 'Modifier la machine'
                                    : 'Nouvelle machine'
                            }
                        </h2>
                    </div>

                    <button
                        type="button"
                        aria-label="Fermer"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="admin-modal__grid">
                    <label>
                        <span>Nom</span>
                        <input
                            className={
                                fieldErrors.nom_machine
                                    ? 'admin-field--invalid'
                                    : ''
                            }
                            aria-invalid={
                                Boolean(
                                    fieldErrors.nom_machine,
                                )
                            }
                            required
                            maxLength={100}
                            placeholder="Ex. Convoyeur P-01"
                            value={
                                form.nom_machine
                            }
                            onChange={
                                (event) =>
                                    setForm({
                                        ...form,
                                        nom_machine:
                                            event.target.value,
                                    })
                            }
                        />
                        {fieldErrors.nom_machine && (
                            <span className="admin-field-error">
                                {fieldErrors.nom_machine}
                            </span>
                        )}
                    </label>

                    <label>
                        <span>Type</span>
                        <input
                            className={
                                fieldErrors.type_machine
                                    ? 'admin-field--invalid'
                                    : ''
                            }
                            aria-invalid={
                                Boolean(
                                    fieldErrors.type_machine,
                                )
                            }
                            required
                            maxLength={50}
                            placeholder="Ex. Convoyeur"
                            value={
                                form.type_machine
                            }
                            onChange={
                                (event) =>
                                    setForm({
                                        ...form,
                                        type_machine:
                                            event.target.value,
                                    })
                            }
                        />
                        {fieldErrors.type_machine && (
                            <span className="admin-field-error">
                                {fieldErrors.type_machine}
                            </span>
                        )}
                    </label>
                </div>

                <div className="admin-modal__grid">
                    <label>
                        <span>Adresse IP</span>
                        <input
                            className={
                                fieldErrors.ip_address
                                    ? 'admin-field--invalid'
                                    : ''
                            }
                            aria-invalid={
                                Boolean(
                                    fieldErrors.ip_address,
                                )
                            }
                            required
                            maxLength={45}
                            spellCheck={false}
                            placeholder="Ex. 10.42.20.11"
                            value={
                                form.ip_address
                            }
                            onChange={
                                (event) =>
                                    setForm({
                                        ...form,
                                        ip_address:
                                            event.target.value,
                                    })
                            }
                        />
                        {fieldErrors.ip_address && (
                            <span className="admin-field-error">
                                {fieldErrors.ip_address}
                            </span>
                        )}
                    </label>

                    <label>
                        <span>Adresse MAC</span>
                        <input
                            className={
                                fieldErrors.mac_address
                                    ? 'admin-field--invalid'
                                    : ''
                            }
                            aria-invalid={
                                Boolean(
                                    fieldErrors.mac_address,
                                )
                            }
                            maxLength={17}
                            spellCheck={false}
                            placeholder="AA:BB:CC:DD:EE:FF"
                            value={
                                form.mac_address
                            }
                            onChange={
                                (event) =>
                                    setForm({
                                        ...form,
                                        mac_address:
                                            event.target.value,
                                    })
                            }
                            onBlur={() =>
                                setForm({
                                    ...form,
                                    mac_address:
                                        normalizeMacAddress(
                                            form.mac_address,
                                        ),
                                })
                            }
                        />
                        {fieldErrors.mac_address && (
                            <span className="admin-field-error">
                                {fieldErrors.mac_address}
                            </span>
                        )}
                    </label>
                </div>

                <div className="admin-modal__grid">
                    <label>
                        <span>
                            Date d’installation
                        </span>
                        <input
                            className={
                                fieldErrors.date_installation
                                    ? 'admin-field--invalid'
                                    : ''
                            }
                            aria-invalid={
                                Boolean(
                                    fieldErrors.date_installation,
                                )
                            }
                            required
                            title="Date actuelle ou antérieure"
                            type="date"
                            max={
                                new Date()
                                    .toISOString()
                                    .slice(0, 10)
                            }
                            value={
                                form.date_installation
                            }
                            onChange={
                                (event) =>
                                    setForm({
                                        ...form,
                                        date_installation:
                                            event.target.value,
                                    })
                            }
                        />
                        {fieldErrors.date_installation && (
                            <span className="admin-field-error">
                                {fieldErrors.date_installation}
                            </span>
                        )}
                    </label>

                    <label>
                        <span>Poteau</span>
                        <select
                            className={
                                fieldErrors.id_poteau
                                    ? 'admin-field--invalid'
                                    : ''
                            }
                            aria-invalid={
                                Boolean(
                                    fieldErrors.id_poteau,
                                )
                            }
                            required
                            value={
                                form.id_poteau
                            }
                            onChange={
                                (event) =>
                                    setForm({
                                        ...form,
                                        id_poteau:
                                            Number(
                                                event.target.value,
                                            ),
                                    })
                            }
                        >
                            {poteaux.map(
                                (pole) => (
                                    <option
                                        key={
                                            pole.id_poteau
                                        }
                                        value={
                                            pole.id_poteau
                                        }
                                    >
                                        {
                                            pole.nom_poteau
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                        {fieldErrors.id_poteau && (
                            <span className="admin-field-error">
                                {fieldErrors.id_poteau}
                            </span>
                        )}
                    </label>
                </div>

                <div className="admin-modal__actions">
                    <button
                        type="button"
                        className="admin-button admin-button--ghost"
                        onClick={onClose}
                    >
                        Annuler
                    </button>

                    <button
                        type="submit"
                        className="admin-button admin-button--primary"
                        disabled={submitting}
                    >
                        {
                            submitting
                                ? 'Enregistrement…'
                                : state.mode === 'edit'
                                    ? 'Enregistrer'
                                    : 'Ajouter la machine'
                        }
                    </button>
                </div>
            </form>
        </div>
    )
}


function SessionsAdmin({
    sessions,
    hasPrevious,
    hasNext,
    runAction,
    filters,
    onFiltersChange,
    onPrevious,
    onNext,
    requestConfirm,
}: {
    sessions: SessionRecord[]
    hasPrevious: boolean
    hasNext: boolean
    runAction: (
        action: AdminAction,
        successMessage?: string,
    ) => Promise<boolean>
    filters: SessionFilters
    onFiltersChange: (
        filters: SessionFilters,
    ) => Promise<void>
    onPrevious: () => Promise<void>
    onNext: () => Promise<void>
    requestConfirm: (
        state: ConfirmState,
    ) => void
}) {
    function statusLabel(
        status: SessionRecord['status'],
    ) {
        switch (status) {
            case 'active':
                return 'Active'
            case 'expired':
                return 'Expirée'
            case 'revoked':
                return 'Révoquée'
        }
    }

    const [
        draftFilters,
        setDraftFilters,
    ] = useState<SessionFilters>(
        filters,
    )

    useEffect(() => {
        setDraftFilters(filters)
    }, [filters])


    return (
        <section className="admin-section">
            <div className="admin-page-heading">
                <div className="admin-page-heading__title">
                    <AdminTabIcon tab="sessions" />

                    <div>
                        <h2>
                            Accès
                        </h2>
                        <p>
                            Consultez les sessions actives et révoquez un accès si nécessaire.
                        </p>
                    </div>
                </div>
            </div>

            <form
                className="admin-access-filterbar"
                onSubmit={(event) => {
                    event.preventDefault()
                    void onFiltersChange(
                        draftFilters,
                    )
                }}
            >
                <input
                    type="search"
                    placeholder="Rechercher un utilisateur…"
                    value={draftFilters.search}
                    onChange={(event) =>
                        setDraftFilters({
                            ...draftFilters,
                            search:
                                event.target.value,
                        })
                    }
                />

                <select
                    value={draftFilters.status}
                    onChange={(event) =>
                        setDraftFilters({
                            ...draftFilters,
                            status:
                                event.target.value as SessionFilters['status'],
                        })
                    }
                >
                    <option value="">
                        Tous les statuts
                    </option>
                    <option value="active">
                        Actives
                    </option>
                    <option value="revoked">
                        Révoquées
                    </option>
                    <option value="expired">
                        Expirées
                    </option>
                </select>

                <button
                    type="submit"
                    className="admin-button admin-button--dark"
                >
                    Filtrer
                </button>

                <button
                    type="button"
                    className="admin-button admin-button--ghost"
                    onClick={() => {
                        const empty: SessionFilters = {
                            search: '',
                            status: '',
                        }

                        setDraftFilters(empty)
                        void onFiltersChange(empty)
                    }}
                >
                    Réinitialiser
                </button>
            </form>

            <div className="admin-register">
                <div className="admin-table-scroll">
                <div className="admin-access-head">
                    <span>Utilisateur</span>
                    <span>Créée le</span>
                    <span>Expiration</span>
                    <span>Statut</span>
                    <span>Action</span>
                </div>

                {sessions.map(
                    (session) => (
                        <div
                            className="admin-access-row"
                            key={
                                session.id_session
                            }
                        >
                            <div className="admin-user-cell">
                                <span className="admin-user-avatar">
                                    {
                                        `${session.user_prenom?.[0] ?? ''}${session.user_nom?.[0] ?? ''}`
                                            .toUpperCase()
                                    }
                                </span>

                                <div className="admin-identity">
                                    <strong>
                                        {
                                            session.user_prenom
                                        }{' '}
                                        {
                                            session.user_nom
                                        }
                                    </strong>

                                    <span>
                                        {
                                            session.user_email
                                        }
                                    </span>
                                </div>
                            </div>

                            <time>
                                {
                                    formatAdminDateTime(
                                        session.date_creation,
                                    )
                                }
                            </time>

                            <time>
                                {
                                    formatAdminDateTime(
                                        session.date_expiration,
                                    )
                                }
                            </time>

                            <div className="admin-access-status-stack">
                                <span
                                    className={
                                        `admin-access-status admin-access-status--${session.status}`
                                    }
                                >
                                    {
                                        statusLabel(
                                            session.status,
                                        )
                                    }
                                </span>

                                {
                                    session.status
                                        === 'revoked'
                                    && session.date_revocation
                                    && (
                                        <small>
                                            Le {
                                                formatAdminDateTime(
                                                    session.date_revocation,
                                                )
                                            }
                                        </small>
                                    )
                                }
                            </div>

                            <div className="admin-access-action">
                                {
                                    session.status
                                        === 'active'
                                    ? (
                                        <button
                                            type="button"
                                            className="admin-action admin-action--revoke"
                                            onClick={() =>
                                                requestConfirm({
                                                    title:
                                                        'Révoquer cette session ?',
                                                    message:
                                                        `La session de ${session.user_prenom} ${session.user_nom} sera immédiatement invalidée.`,
                                                    confirmLabel:
                                                        'Révoquer',
                                                    danger: true,
                                                    action:
                                                        () =>
                                                            runAction(
                                                                () =>
                                                                    revokeSession(
                                                                        session.id_session,
                                                                    ),
                                                                'Session révoquée avec succès.',
                                                            ),
                                                })
                                            }
                                        >
                                            Révoquer
                                        </button>
                                    )
                                    : (
                                        <span className="admin-access-action__muted">
                                            {
                                                session.status
                                                    === 'revoked'
                                                    ? 'Déjà révoquée'
                                                    : 'Session expirée'
                                            }
                                        </span>
                                    )
                                }
                            </div>
                        </div>
                    ),
                )}

                <div className="admin-pagination admin-pagination--cursor">
                    <button
                        type="button"
                        disabled={!hasPrevious}
                        onClick={
                            () =>
                                void onPrevious()
                        }
                    >
                        ‹ Précédent
                    </button>

                    <button
                        type="button"
                        disabled={!hasNext}
                        onClick={
                            () =>
                                void onNext()
                        }
                    >
                        Suivant ›
                    </button>
                </div>
                </div>
            </div>
        </section>
    )
}


function AdminEmptyState({
    title,
    message,
    actionLabel,
    onAction,
}: {
    title: string
    message: string
    actionLabel?: string
    onAction?: () => void
}) {
    return (
        <div className="admin-empty-state">
            <strong>
                {title}
            </strong>

            <p>
                {message}
            </p>

            {
                actionLabel
                && onAction
                && (
                    <button
                        type="button"
                        className="admin-button admin-button--ghost"
                        onClick={onAction}
                    >
                        {actionLabel}
                    </button>
                )
            }
        </div>
    )
}
