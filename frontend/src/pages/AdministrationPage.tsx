import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    createMachine,
    createOrganisationResource,
    createUser,
    deleteMachine,
    deleteOrganisationResource,
    deleteUser,
    getDepartements,
    getEtats,
    getMachines,
    getPoteaux,
    getRoles,
    getSessions,
    getUnites,
    getUsers,
    patchMachine,
    patchOrganisationResource,
    patchUser,
    revokeSession,
} from '../api/client'

import type {
    Departement,
    Etat,
    Machine,
    Poteau,
    Role,
    SessionRecord,
    Unite,
    User,
} from '../api/types'

import { useAuth } from '../auth/AuthContext'


type Tab =
    | 'users'
    | 'organisation'
    | 'machines'
    | 'states'
    | 'sessions'


type AdminAction = () => Promise<unknown>


export function AdministrationPage() {
    const { isAdmin } = useAuth()

    const [
        tab,
        setTab,
    ] = useState<Tab>('users')

    const [
        users,
        setUsers,
    ] = useState<User[]>([])

    const [
        roles,
        setRoles,
    ] = useState<Role[]>([])

    const [
        machines,
        setMachines,
    ] = useState<Machine[]>([])

    const [
        departements,
        setDepartements,
    ] = useState<Departement[]>([])

    const [
        unites,
        setUnites,
    ] = useState<Unite[]>([])

    const [
        poteaux,
        setPoteaux,
    ] = useState<Poteau[]>([])

    const [
        etats,
        setEtats,
    ] = useState<Etat[]>([])

    const [
        sessions,
        setSessions,
    ] = useState<SessionRecord[]>([])

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] = useState('')


    async function load() {
        setLoading(true)
        setError('')

        try {
            const [
                nextUsers,
                nextRoles,
                nextMachines,
                nextDepartements,
                nextUnites,
                nextPoteaux,
                nextEtats,
                nextSessions,
            ] = await Promise.all([
                getUsers(),
                getRoles(),
                getMachines(),
                getDepartements(),
                getUnites(),
                getPoteaux(),
                getEtats(),
                getSessions(),
            ])

            setUsers(nextUsers)
            setRoles(nextRoles)
            setMachines(nextMachines)
            setDepartements(
                nextDepartements,
            )
            setUnites(nextUnites)
            setPoteaux(nextPoteaux)
            setEtats(nextEtats)
            setSessions(nextSessions)

        } catch (currentError) {
            setError(
                currentError
                    instanceof Error
                    ? currentError.message
                    : 'Chargement impossible.',
            )

        } finally {
            setLoading(false)
        }
    }


    async function runAdminAction(
        action: AdminAction,
    ) {
        setError('')

        try {
            await action()
            await load()

            return true

        } catch (currentError) {
            setError(
                currentError
                    instanceof Error
                    ? currentError.message
                    : (
                        'L’action demandée '
                        + 'n’a pas pu être effectuée.'
                    ),
            )

            return false
        }
    }


    useEffect(() => {
        if (isAdmin) {
            void load()
        }
    }, [isAdmin])


    if (!isAdmin) {
        return (
            <section className="operations-page">
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
                        [
                            'users',
                            'Utilisateurs',
                        ],
                        [
                            'organisation',
                            'Organisation',
                        ],
                        [
                            'machines',
                            'Équipements',
                        ],
                        [
                            'states',
                            'États',
                        ],
                        [
                            'sessions',
                            'Sessions',
                        ],
                    ] as Array<
                        [Tab, string]
                    >
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
                                setTab(value)
                            }
                        >
                            {label}
                        </button>
                    ),
                )}
            </div>


            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}


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
                    {tab === 'users' && (
                        <UsersAdmin
                            users={users}
                            roles={roles}
                            roleById={
                                roleById
                            }
                            runAction={
                                runAdminAction
                            }
                        />
                    )}


                    {tab
                        === 'organisation'
                        && (
                            <OrganisationAdmin
                                departements={
                                    departements
                                }
                                unites={
                                    unites
                                }
                                poteaux={
                                    poteaux
                                }
                                runAction={
                                    runAdminAction
                                }
                            />
                        )}


                    {tab === 'machines' && (
                        <MachinesAdmin
                            machines={machines}
                            poteaux={poteaux}
                            poleById={
                                poleById
                            }
                            runAction={
                                runAdminAction
                            }
                        />
                    )}


                    {tab === 'states' && (
                        <StatesAdmin
                            etats={etats}
                            runAction={
                                runAdminAction
                            }
                        />
                    )}


                    {tab === 'sessions' && (
                        <SessionsAdmin
                            sessions={sessions}
                            users={users}
                            runAction={
                                runAdminAction
                            }
                        />
                    )}
                </>
            )}
        </section>
    )
}


function UsersAdmin({
    users,
    roles,
    roleById,
    runAction,
}: {
    users: User[]
    roles: Role[]
    roleById: Map<number, string>
    runAction:
        (
            action: AdminAction,
        ) => Promise<boolean>
}) {
    const empty = {
        nom: '',
        prenom: '',
        email: '',
        id_role:
            roles[0]?.id_role
            ?? 0,
        mot_de_passe: '',
    }


    const [
        form,
        setForm,
    ] = useState(empty)


    const [
        editingId,
        setEditingId,
    ] = useState<
        number | null
    >(null)


    const [
        resettingUser,
        setResettingUser,
    ] = useState<
        User | null
    >(null)


    const [
        newPassword,
        setNewPassword,
    ] = useState('')


    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState('')


    const [
        passwordError,
        setPasswordError,
    ] = useState('')


    async function submit(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {
        event.preventDefault()

        const success =
            await runAction(
                () => {
                    if (editingId) {
                        return patchUser(
                            editingId,
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
                        )
                    }

                    return createUser({
                        nom:
                            form.nom,

                        prenom:
                            form.prenom,

                        email:
                            form.email,

                        id_role:
                            Number(
                                form.id_role
                                || roles[0]
                                    ?.id_role
                                || 0,
                            ),

                        mot_de_passe:
                            form
                                .mot_de_passe,
                    })
                },
            )

        if (!success) {
            return
        }

        setEditingId(null)

        setForm({
            nom: '',
            prenom: '',
            email: '',
            id_role:
                roles[0]
                    ?.id_role
                ?? 0,
            mot_de_passe: '',
        })
    }


    async function resetPassword(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {
        event.preventDefault()

        if (!resettingUser) {
            return
        }

        setPasswordError('')


        if (
            newPassword.length
            < 8
        ) {
            setPasswordError(
                'Le mot de passe doit '
                + 'contenir au moins '
                + '8 caractères.',
            )

            return
        }


        if (
            newPassword
            !== confirmPassword
        ) {
            setPasswordError(
                'Les deux mots de passe '
                + 'ne correspondent pas.',
            )

            return
        }


        const success =
            await runAction(
                () =>
                    patchUser(
                        resettingUser
                            .id_util,
                        {
                            mot_de_passe:
                                newPassword,
                        },
                    ),
            )

        if (!success) {
            return
        }

        setResettingUser(null)
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
    }


    function cancelReset() {
        setResettingUser(null)
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
    }


    return (
        <div className="admin-grid">
            {resettingUser ? (
                <form
                    className={
                        'data-panel '
                        + 'admin-form'
                    }
                    onSubmit={
                        resetPassword
                    }
                >
                    <div
                        className={
                            'data-panel'
                            + '__header'
                        }
                    >
                        <div>
                            <strong>
                                RÉINITIALISER
                                LE MOT DE PASSE
                            </strong>

                            <span>
                                {
                                    resettingUser
                                        .prenom
                                }{' '}
                                {
                                    resettingUser
                                        .nom
                                }
                            </span>
                        </div>
                    </div>


                    <p>
                        Définissez un nouveau
                        mot de passe pour ce compte.
                    </p>


                    {passwordError && (
                        <div
                            className={
                                'form-error'
                            }
                        >
                            {
                                passwordError
                            }
                        </div>
                    )}


                    <input
                        required
                        minLength={8}
                        maxLength={128}
                        type="password"
                        autoComplete={
                            'new-password'
                        }
                        placeholder={
                            'Nouveau mot '
                            + 'de passe'
                        }
                        value={
                            newPassword
                        }
                        onChange={
                            (event) =>
                                setNewPassword(
                                    event.target
                                        .value,
                                )
                        }
                    />


                    <input
                        required
                        minLength={8}
                        maxLength={128}
                        type="password"
                        autoComplete={
                            'new-password'
                        }
                        placeholder={
                            'Confirmer le '
                            + 'mot de passe'
                        }
                        value={
                            confirmPassword
                        }
                        onChange={
                            (event) =>
                                setConfirmPassword(
                                    event.target
                                        .value,
                                )
                        }
                    />


                    <button
                        className={
                            'primary-button'
                        }
                        type="submit"
                    >
                        RÉINITIALISER
                    </button>


                    <button
                        type="button"
                        onClick={
                            cancelReset
                        }
                    >
                        Annuler
                    </button>
                </form>

            ) : (
                <form
                    className={
                        'data-panel '
                        + 'admin-form'
                    }
                    onSubmit={submit}
                >
                    <div
                        className={
                            'data-panel'
                            + '__header'
                        }
                    >
                        <div>
                            <strong>
                                {
                                    editingId
                                        ? (
                                            'MODIFIER '
                                            + 'L’UTILISATEUR'
                                        )
                                        : (
                                            'NOUVEL '
                                            + 'UTILISATEUR'
                                        )
                                }
                            </strong>

                            <span>
                                {
                                    editingId
                                        ? (
                                            'Informations '
                                            + 'et rôle '
                                            + 'du compte'
                                        )
                                        : (
                                            'Création et '
                                            + 'attribution '
                                            + 'du rôle'
                                        )
                                }
                            </span>
                        </div>
                    </div>


                    <input
                        required
                        placeholder="Prénom"
                        value={
                            form.prenom
                        }
                        onChange={
                            (event) =>
                                setForm({
                                    ...form,
                                    prenom:
                                        event
                                            .target
                                            .value,
                                })
                        }
                    />


                    <input
                        required
                        placeholder="Nom"
                        value={form.nom}
                        onChange={
                            (event) =>
                                setForm({
                                    ...form,
                                    nom:
                                        event
                                            .target
                                            .value,
                                })
                        }
                    />


                    <input
                        required
                        type="email"
                        placeholder="E-mail"
                        value={
                            form.email
                        }
                        onChange={
                            (event) =>
                                setForm({
                                    ...form,
                                    email:
                                        event
                                            .target
                                            .value,
                                })
                        }
                    />


                    <select
                        required
                        value={
                            form.id_role
                            || roles[0]
                                ?.id_role
                            || ''
                        }
                        onChange={
                            (event) =>
                                setForm({
                                    ...form,
                                    id_role:
                                        Number(
                                            event
                                                .target
                                                .value,
                                        ),
                                })
                        }
                    >
                        {roles.map(
                            (role) => (
                                <option
                                    key={
                                        role
                                            .id_role
                                    }
                                    value={
                                        role
                                            .id_role
                                    }
                                >
                                    {
                                        role
                                            .nom_role
                                    }
                                </option>
                            ),
                        )}
                    </select>


                    {!editingId && (
                        <input
                            required
                            minLength={8}
                            maxLength={128}
                            type="password"
                            autoComplete={
                                'new-password'
                            }
                            placeholder={
                                'Mot de passe'
                            }
                            value={
                                form
                                    .mot_de_passe
                            }
                            onChange={
                                (event) =>
                                    setForm({
                                        ...form,

                                        mot_de_passe:
                                            event
                                                .target
                                                .value,
                                    })
                            }
                        />
                    )}


                    <button
                        className={
                            'primary-button'
                        }
                        type="submit"
                    >
                        {
                            editingId
                                ? 'ENREGISTRER'
                                : (
                                    'CRÉER '
                                    + 'LE COMPTE'
                                )
                        }
                    </button>


                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(
                                    null,
                                )

                                setForm({
                                    nom: '',
                                    prenom: '',
                                    email: '',
                                    id_role:
                                        roles[0]
                                            ?.id_role
                                        ?? 0,
                                    mot_de_passe:
                                        '',
                                })
                            }}
                        >
                            Annuler
                        </button>
                    )}
                </form>
            )}


            <div
                className={
                    'data-panel '
                    + 'admin-list'
                }
            >
                <div
                    className={
                        'data-panel'
                        + '__header'
                    }
                >
                    <div>
                        <strong>
                            UTILISATEURS
                        </strong>

                        <span>
                            {
                                users.length
                            } comptes
                        </span>
                    </div>
                </div>


                {users.map(
                    (user) => (
                        <div
                            className={
                                'admin-row'
                            }
                            key={
                                user.id_util
                            }
                        >
                            <div>
                                <strong>
                                    {
                                        user
                                            .prenom
                                    }{' '}
                                    {
                                        user
                                            .nom
                                    }
                                </strong>

                                <span>
                                    {
                                        user
                                            .email
                                    }
                                </span>
                            </div>


                            <span
                                className={
                                    'admin-role'
                                }
                            >
                                {
                                    roleById.get(
                                        user
                                            .id_role,
                                    )
                                    ?? (
                                        `Rôle ${
                                            user
                                                .id_role
                                        }`
                                    )
                                }
                            </span>


                            <div
                                className={
                                    'admin-row'
                                    + '__actions'
                                }
                            >
                                <button
                                    type="button"
                                    onClick={
                                        () => {
                                            setResettingUser(
                                                null,
                                            )

                                            setPasswordError(
                                                '',
                                            )

                                            setEditingId(
                                                user
                                                    .id_util,
                                            )

                                            setForm({
                                                nom:
                                                    user
                                                        .nom,

                                                prenom:
                                                    user
                                                        .prenom,

                                                email:
                                                    user
                                                        .email,

                                                id_role:
                                                    user
                                                        .id_role,

                                                mot_de_passe:
                                                    '',
                                            })
                                        }
                                    }
                                >
                                    Modifier
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        () => {
                                            setEditingId(
                                                null,
                                            )

                                            setResettingUser(
                                                user,
                                            )

                                            setNewPassword(
                                                '',
                                            )

                                            setConfirmPassword(
                                                '',
                                            )

                                            setPasswordError(
                                                '',
                                            )
                                        }
                                    }
                                >
                                    Réinitialiser
                                    le mot de passe
                                </button>


                                <button
                                    type="button"
                                    className={
                                        'danger-link'
                                    }
                                    onClick={
                                        () =>
                                            void runAction(
                                                () =>
                                                    deleteUser(
                                                        user
                                                            .id_util,
                                                    ),
                                            )
                                    }
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ),
                )}
            </div>
        </div>
    )
}


function OrganisationAdmin({
    departements,
    unites,
    poteaux,
    runAction,
}: {
    departements:
        Departement[]

    unites:
        Unite[]

    poteaux:
        Poteau[]

    runAction:
        (
            action: AdminAction,
        ) => Promise<boolean>
}) {
    return (
        <div
            className={
                'organisation-columns'
            }
        >
            <SimpleResourceCard
                title="DÉPARTEMENTS"
                items={
                    departements.map(
                        (item) => ({
                            id:
                                item.id_dep,

                            label:
                                item.nom_dep,
                        }),
                    )
                }
                placeholder={
                    'Nom du département'
                }
                onCreate={
                    (value) =>
                        runAction(
                            () =>
                                createOrganisationResource(
                                    'departements',
                                    {
                                        nom_dep:
                                            value,
                                    },
                                ),
                        )
                }
                onRename={
                    (id, value) =>
                        runAction(
                            () =>
                                patchOrganisationResource(
                                    'departements',
                                    id,
                                    {
                                        nom_dep:
                                            value,
                                    },
                                ),
                        )
                }
                onDelete={
                    (id) =>
                        runAction(
                            () =>
                                deleteOrganisationResource(
                                    'departements',
                                    id,
                                ),
                        )
                }
            />


            <SimpleResourceCard
                title="UET / UNITÉS"
                items={
                    unites.map(
                        (item) => ({
                            id:
                                item.id_unite,

                            label:
                                item.nom_unite,
                        }),
                    )
                }
                placeholder={
                    'Nom de l’unité'
                }
                onCreate={
                    (value) =>
                        runAction(
                            () =>
                                createOrganisationResource(
                                    'unites',
                                    {
                                        nom_unite:
                                            value,

                                        id_dep:
                                            departements[0]
                                                ?.id_dep
                                            ?? 0,
                                    },
                                ),
                        )
                }
                onRename={
                    (id, value) =>
                        runAction(
                            () =>
                                patchOrganisationResource(
                                    'unites',
                                    id,
                                    {
                                        nom_unite:
                                            value,
                                    },
                                ),
                        )
                }
                onDelete={
                    (id) =>
                        runAction(
                            () =>
                                deleteOrganisationResource(
                                    'unites',
                                    id,
                                ),
                        )
                }
            />


            <SimpleResourceCard
                title="POTEAUX"
                items={
                    poteaux.map(
                        (item) => ({
                            id:
                                item.id_poteau,

                            label:
                                item.nom_poteau,
                        }),
                    )
                }
                placeholder={
                    'Nom du poteau'
                }
                onCreate={
                    (value) =>
                        runAction(
                            () =>
                                createOrganisationResource(
                                    'poteaux',
                                    {
                                        nom_poteau:
                                            value,

                                        id_unite:
                                            unites[0]
                                                ?.id_unite
                                            ?? 0,
                                    },
                                ),
                        )
                }
                onRename={
                    (id, value) =>
                        runAction(
                            () =>
                                patchOrganisationResource(
                                    'poteaux',
                                    id,
                                    {
                                        nom_poteau:
                                            value,
                                    },
                                ),
                        )
                }
                onDelete={
                    (id) =>
                        runAction(
                            () =>
                                deleteOrganisationResource(
                                    'poteaux',
                                    id,
                                ),
                        )
                }
            />
        </div>
    )
}


function SimpleResourceCard({
    title,
    items,
    placeholder,
    onCreate,
    onRename,
    onDelete,
}: {
    title: string

    items:
        Array<{
            id: number
            label: string
        }>

    placeholder: string

    onCreate:
        (
            value: string,
        ) => Promise<boolean>

    onRename:
        (
            id: number,
            value: string,
        ) => Promise<boolean>

    onDelete:
        (
            id: number,
        ) => Promise<boolean>
}) {
    const [
        value,
        setValue,
    ] = useState('')


    return (
        <article
            className={
                'data-panel '
                + 'organisation-card'
            }
        >
            <div
                className={
                    'data-panel'
                    + '__header'
                }
            >
                <strong>
                    {title}
                </strong>
            </div>


            <form
                onSubmit={
                    (event) => {
                        event.preventDefault()

                        const next =
                            value.trim()

                        if (!next) {
                            return
                        }

                        void (
                            async () => {
                                const success =
                                    await onCreate(
                                        next,
                                    )

                                if (success) {
                                    setValue(
                                        '',
                                    )
                                }
                            }
                        )()
                    }
                }
            >
                <input
                    placeholder={
                        placeholder
                    }
                    value={value}
                    onChange={
                        (event) =>
                            setValue(
                                event
                                    .target
                                    .value,
                            )
                    }
                />

                <button
                    type="submit"
                    className={
                        'primary-button '
                        + 'primary-button'
                        + '--small'
                    }
                >
                    Ajouter
                </button>
            </form>


            <div
                className={
                    'simple-resource-list'
                }
            >
                {items.map(
                    (item) => (
                        <div
                            key={
                                item.id
                            }
                        >
                            <span>
                                {
                                    item.label
                                }
                            </span>


                            <div>
                                <button
                                    type="button"
                                    onClick={
                                        () => {
                                            const next =
                                                window.prompt(
                                                    'Nouveau nom',
                                                    item.label,
                                                )

                                            if (
                                                next
                                                    ?.trim()
                                            ) {
                                                void onRename(
                                                    item.id,
                                                    next.trim(),
                                                )
                                            }
                                        }
                                    }
                                >
                                    Modifier
                                </button>


                                <button
                                    type="button"
                                    className={
                                        'danger-link'
                                    }
                                    onClick={
                                        () =>
                                            void onDelete(
                                                item.id,
                                            )
                                    }
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ),
                )}
            </div>
        </article>
    )
}


function MachinesAdmin({
    machines,
    poteaux,
    poleById,
    runAction,
}: {
    machines:
        Machine[]

    poteaux:
        Poteau[]

    poleById:
        Map<number, string>

    runAction:
        (
            action: AdminAction,
        ) => Promise<boolean>
}) {
    const empty = {
        nom_machine: '',
        ip_address: '',
        mac_address: '',
        date_installation:
            new Date()
                .toISOString()
                .slice(
                    0,
                    10,
                ),
        id_poteau:
            poteaux[0]
                ?.id_poteau
            ?? 0,
    }


    const [
        form,
        setForm,
    ] = useState(empty)


    const [
        editing,
        setEditing,
    ] = useState<
        number | null
    >(null)


    async function submit(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {
        event.preventDefault()


        const payload = {
            nom_machine:
                form.nom_machine,

            ip_address:
                form.ip_address,

            mac_address:
                form.mac_address
                || null,

            date_installation:
                form.date_installation,

            id_poteau:
                Number(
                    form.id_poteau,
                ),
        }


        const success =
            await runAction(
                () =>
                    editing
                        ? patchMachine(
                            editing,
                            payload,
                        )
                        : createMachine(
                            payload,
                        ),
            )


        if (!success) {
            return
        }

        setEditing(null)
        setForm(empty)
    }


    return (
        <div className="admin-grid">
            <form
                className={
                    'data-panel '
                    + 'admin-form'
                }
                onSubmit={submit}
            >
                <div
                    className={
                        'data-panel'
                        + '__header'
                    }
                >
                    <strong>
                        {
                            editing
                                ? (
                                    'MODIFIER '
                                    + 'LA MACHINE'
                                )
                                : (
                                    'NOUVEL '
                                    + 'ÉQUIPEMENT'
                                )
                        }
                    </strong>
                </div>


                <input
                    required
                    placeholder={
                        'Nom machine'
                    }
                    value={
                        form.nom_machine
                    }
                    onChange={
                        (event) =>
                            setForm({
                                ...form,
                                nom_machine:
                                    event
                                        .target
                                        .value,
                            })
                    }
                />


                <input
                    required
                    placeholder={
                        'Adresse IP'
                    }
                    value={
                        form.ip_address
                    }
                    onChange={
                        (event) =>
                            setForm({
                                ...form,
                                ip_address:
                                    event
                                        .target
                                        .value,
                            })
                    }
                />


                <input
                    placeholder={
                        'Adresse MAC'
                    }
                    value={
                        form.mac_address
                    }
                    onChange={
                        (event) =>
                            setForm({
                                ...form,
                                mac_address:
                                    event
                                        .target
                                        .value,
                            })
                    }
                />


                <input
                    type="date"
                    required
                    value={
                        form
                            .date_installation
                    }
                    onChange={
                        (event) =>
                            setForm({
                                ...form,
                                date_installation:
                                    event
                                        .target
                                        .value,
                            })
                    }
                />


                <select
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
                                        event
                                            .target
                                            .value,
                                    ),
                            })
                    }
                >
                    {poteaux.map(
                        (pole) => (
                            <option
                                key={
                                    pole
                                        .id_poteau
                                }
                                value={
                                    pole
                                        .id_poteau
                                }
                            >
                                {
                                    pole
                                        .nom_poteau
                                }
                            </option>
                        ),
                    )}
                </select>


                <button
                    type="submit"
                    className={
                        'primary-button'
                    }
                >
                    {
                        editing
                            ? 'ENREGISTRER'
                            : (
                                'AJOUTER '
                                + 'LA MACHINE'
                            )
                    }
                </button>
            </form>


            <div
                className={
                    'data-panel '
                    + 'admin-list'
                }
            >
                <div
                    className={
                        'data-panel'
                        + '__header'
                    }
                >
                    <div>
                        <strong>
                            ÉQUIPEMENTS
                        </strong>

                        <span>
                            {
                                machines
                                    .length
                            } machines
                        </span>
                    </div>
                </div>


                {machines.map(
                    (machine) => (
                        <div
                            className={
                                'admin-row'
                            }
                            key={
                                machine
                                    .id_machine
                            }
                        >
                            <div>
                                <strong>
                                    {
                                        machine
                                            .nom_machine
                                    }
                                </strong>

                                <span>
                                    {
                                        machine
                                            .ip_address
                                    }
                                </span>
                            </div>


                            <span
                                className={
                                    'admin-role'
                                }
                            >
                                {
                                    poleById.get(
                                        machine
                                            .id_poteau,
                                    )
                                    ?? (
                                        `Poteau ${
                                            machine
                                                .id_poteau
                                        }`
                                    )
                                }
                            </span>


                            <div
                                className={
                                    'admin-row'
                                    + '__actions'
                                }
                            >
                                <button
                                    type="button"
                                    onClick={
                                        () => {
                                            setEditing(
                                                machine
                                                    .id_machine,
                                            )

                                            setForm({
                                                nom_machine:
                                                    machine
                                                        .nom_machine,

                                                ip_address:
                                                    machine
                                                        .ip_address,

                                                mac_address:
                                                    machine
                                                        .mac_address
                                                    ?? '',

                                                date_installation:
                                                    machine
                                                        .date_installation,

                                                id_poteau:
                                                    machine
                                                        .id_poteau,
                                            })
                                        }
                                    }
                                >
                                    Modifier
                                </button>


                                <button
                                    type="button"
                                    className={
                                        'danger-link'
                                    }
                                    onClick={
                                        () =>
                                            void runAction(
                                                () =>
                                                    deleteMachine(
                                                        machine
                                                            .id_machine,
                                                    ),
                                            )
                                    }
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ),
                )}
            </div>
        </div>
    )
}


function StatesAdmin({
    etats,
    runAction,
}: {
    etats: Etat[]

    runAction:
        (
            action: AdminAction,
        ) => Promise<boolean>
}) {
    const [
        label,
        setLabel,
    ] = useState('')


    const [
        color,
        setColor,
    ] = useState(
        '#62a875',
    )


    return (
        <article
            className={
                'data-panel '
                + 'states-panel'
            }
        >
            <div
                className={
                    'data-panel'
                    + '__header'
                }
            >
                <div>
                    <strong>
                        ÉTATS MACHINE
                    </strong>

                    <span>
                        Libellés utilisés
                        par la supervision
                    </span>
                </div>
            </div>


            <form
                className={
                    'state-create'
                }
                onSubmit={
                    (event) => {
                        event.preventDefault()

                        if (
                            !label.trim()
                        ) {
                            return
                        }

                        void (
                            async () => {
                                const success =
                                    await runAction(
                                        () =>
                                            createOrganisationResource(
                                                'etats',
                                                {
                                                    libelle_etat:
                                                        label.trim(),

                                                    couleur:
                                                        color,
                                                },
                                            ),
                                    )

                                if (
                                    success
                                ) {
                                    setLabel(
                                        '',
                                    )
                                }
                            }
                        )()
                    }
                }
            >
                <input
                    placeholder="Libellé"
                    value={label}
                    onChange={
                        (event) =>
                            setLabel(
                                event
                                    .target
                                    .value,
                            )
                    }
                />


                <input
                    type="color"
                    value={color}
                    onChange={
                        (event) =>
                            setColor(
                                event
                                    .target
                                    .value,
                            )
                    }
                />


                <button
                    className={
                        'primary-button '
                        + 'primary-button'
                        + '--small'
                    }
                    type="submit"
                >
                    Ajouter
                </button>
            </form>


            <div
                className={
                    'state-list'
                }
            >
                {etats.map(
                    (etat) => (
                        <div
                            key={
                                etat.id_etat
                            }
                        >
                            <span
                                style={{
                                    background:
                                        etat
                                            .couleur,
                                }}
                            />

                            <strong>
                                {
                                    etat
                                        .libelle_etat
                                }
                            </strong>

                            <code>
                                {
                                    etat
                                        .couleur
                                }
                            </code>


                            <button
                                type="button"
                                onClick={
                                    () => {
                                        const next =
                                            window.prompt(
                                                'Nouveau libellé',
                                                etat
                                                    .libelle_etat,
                                            )

                                        if (
                                            next
                                                ?.trim()
                                        ) {
                                            void runAction(
                                                () =>
                                                    patchOrganisationResource(
                                                        'etats',
                                                        etat
                                                            .id_etat,
                                                        {
                                                            libelle_etat:
                                                                next.trim(),
                                                        },
                                                    ),
                                            )
                                        }
                                    }
                                }
                            >
                                Modifier
                            </button>


                            <button
                                type="button"
                                className={
                                    'danger-link'
                                }
                                onClick={
                                    () =>
                                        void runAction(
                                            () =>
                                                deleteOrganisationResource(
                                                    'etats',
                                                    etat
                                                        .id_etat,
                                                ),
                                        )
                                }
                            >
                                Supprimer
                            </button>
                        </div>
                    ),
                )}
            </div>
        </article>
    )
}


function SessionsAdmin({
    sessions,
    users,
    runAction,
}: {
    sessions:
        SessionRecord[]

    users:
        User[]

    runAction:
        (
            action: AdminAction,
        ) => Promise<boolean>
}) {
    const userById =
        useMemo(
            () =>
                new Map(
                    users.map(
                        (user) => [
                            user.id_util,
                            (
                                `${user.prenom} `
                                + user.nom
                            ),
                        ],
                    ),
                ),
            [users],
        )


    function getSessionStatus(
        session:
            SessionRecord,
    ) {
        if (
            session
                .date_revocation
        ) {
            return 'Révoquée'
        }


        if (
            new Date(
                session
                    .date_expiration,
            ).getTime()
            <= Date.now()
        ) {
            return 'Expirée'
        }


        return 'Active'
    }


    return (
        <article
            className={
                'data-panel '
                + 'states-panel'
            }
        >
            <div
                className={
                    'data-panel'
                    + '__header'
                }
            >
                <div>
                    <strong>
                        SESSIONS
                    </strong>

                    <span>
                        Historique et
                        révocation des accès
                    </span>
                </div>
            </div>


            <div
                className={
                    'session-list'
                }
            >
                {sessions.map(
                    (session) => {
                        const currentStatus =
                            getSessionStatus(
                                session,
                            )


                        return (
                            <div
                                key={
                                    session
                                        .id_session
                                }
                            >
                                <div>
                                    <strong>
                                        {
                                            userById.get(
                                                session
                                                    .id_util,
                                            )
                                            ?? (
                                                `Utilisateur #${
                                                    session
                                                        .id_util
                                                }`
                                            )
                                        }
                                    </strong>

                                    <span>
                                        Créée le{' '}

                                        {
                                            new Intl
                                                .DateTimeFormat(
                                                    'fr-FR',
                                                    {
                                                        dateStyle:
                                                            'short',

                                                        timeStyle:
                                                            'short',
                                                    },
                                                )
                                                .format(
                                                    new Date(
                                                        session
                                                            .date_creation,
                                                    ),
                                                )
                                        }
                                    </span>
                                </div>


                                <small>
                                    {
                                        currentStatus
                                    }

                                    {' · '}

                                    Expire{' '}

                                    {
                                        new Intl
                                            .DateTimeFormat(
                                                'fr-FR',
                                                {
                                                    dateStyle:
                                                        'short',

                                                    timeStyle:
                                                        'short',
                                                },
                                            )
                                            .format(
                                                new Date(
                                                    session
                                                        .date_expiration,
                                                ),
                                            )
                                    }
                                </small>


                                {
                                    currentStatus
                                        === 'Active'
                                    && (
                                        <button
                                            type="button"
                                            className={
                                                'danger-link'
                                            }
                                            onClick={
                                                () =>
                                                    void runAction(
                                                        () =>
                                                            revokeSession(
                                                                session
                                                                    .id_session,
                                                            ),
                                                    )
                                            }
                                        >
                                            Révoquer
                                        </button>
                                    )
                                }
                            </div>
                        )
                    },
                )}
            </div>
        </article>
    )
}