import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import type { ReactNode } from 'react'

import {
    getMe,
    login as loginRequest,
    logoutRequest,
    onAuthExpired,
    resetAuthExpiredDispatch,
} from '../api/client'
import type { CurrentUser } from '../api/types'

interface AuthContextValue {
    user: CurrentUser | null
    loading: boolean
    isAdmin: boolean
    authNotice: string | null
    clearAuthNotice: () => void
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_ENDED_MESSAGE =
    'Votre session n’est plus valide. Veuillez vous reconnecter.'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [authNotice, setAuthNotice] = useState<string | null>(null)

    useEffect(
        () => onAuthExpired(() => {
            setUser(null)
            setLoading(false)
            setAuthNotice(SESSION_ENDED_MESSAGE)
        }),
        [],
    )

    useEffect(() => {
        let active = true

        async function restore() {
            try {
                const current = await getMe({
                    notifyAuthExpired: false,
                })

                if (!active) return

                resetAuthExpiredDispatch()
                setUser(current)
                setAuthNotice(null)
            } catch {
                if (active) {
                    setUser(null)
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        void restore()

        return () => {
            active = false
        }
    }, [])

    function clearAuthNotice() {
        setAuthNotice(null)
    }

    async function login(
        email: string,
        password: string,
    ) {
        setAuthNotice(null)

        await loginRequest(
            email,
            password,
        )

        const current = await getMe({
            notifyAuthExpired: false,
        })

        resetAuthExpiredDispatch()
        setUser(current)
    }

    async function logout() {
        try {
            await logoutRequest()
        } catch {
            // Leaving the local authenticated workspace must not depend on
            // whether the server can still validate the current session.
        } finally {
            setAuthNotice(null)
            setUser(null)
        }
    }

    const value = useMemo(
        () => ({
            user,
            loading,
            isAdmin: user?.role === 'administrateur',
            authNotice,
            clearAuthNotice,
            login,
            logout,
        }),
        [user, loading, authNotice],
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}
