import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import type {
    FormEvent,
    KeyboardEvent,
    PointerEvent as ReactPointerEvent,
    ReactNode,
    UIEvent,
} from 'react'

import {
    ApiError,
    askSomacaHelper,
    deleteHelperConversation,
    getHelperConversation,
    getHelperConversations,
} from '../../api/client'

import type {
    HelperAskResponse,
    HelperConversationSummary,
    SomacaHelperMessage,
} from '../../api/types'

import {
    useSomacaHelperContext,
} from '../../helper/SomacaHelperContext'

import {
    useOperations,
} from '../../operations/OperationsContext'

import './SomacaHelperLauncher.css'


interface LocalMessage {
    id: string
    role: 'USER' | 'ASSISTANT'
    content: string
    status?: HelperAskResponse['status']
}


const HELPER_CONVERSATION_STORAGE_KEY =
    'somaca-helper-conversation-id'

const HELPER_WIDTH_STORAGE_KEY =
    'somaca-helper-width'

const DEFAULT_HELPER_WIDTH = 390
const MIN_HELPER_WIDTH = 320
const MAX_HELPER_WIDTH = 560


function clampHelperWidth(
    value: number,
) {
    return Math.min(
        MAX_HELPER_WIDTH,
        Math.max(
            MIN_HELPER_WIDTH,
            value,
        ),
    )
}


function getInitialHelperWidth() {
    const stored =
        Number(
            window.localStorage.getItem(
                HELPER_WIDTH_STORAGE_KEY,
            ),
        )

    return Number.isFinite(stored)
        ? clampHelperWidth(stored)
        : DEFAULT_HELPER_WIDTH
}


function getConversationId() {
    const stored =
        window.sessionStorage.getItem(
            HELPER_CONVERSATION_STORAGE_KEY,
        )

    if (stored) {
        return stored
    }

    const created =
        crypto.randomUUID()

    window.sessionStorage.setItem(
        HELPER_CONVERSATION_STORAGE_KEY,
        created,
    )

    return created
}


function RadarMark({
    size = 28,
}: {
    size?: number
}) {
    return (
        <svg
            viewBox="0 0 32 32"
            width={size}
            height={size}
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="16"
                cy="16"
                r="12"
                stroke="#F2B705"
                strokeWidth="2"
            />

            <circle
                cx="16"
                cy="16"
                r="7.1"
                stroke="#F2B705"
                strokeWidth="2"
            />

            <path
                d="M16 16 25.8 10.3"
                stroke="#F2B705"
                strokeWidth="2.4"
                strokeLinecap="round"
            />

            <path
                d="M8.4 7.8A12 12 0 0 1 16 4"
                stroke="#F2B705"
                strokeWidth="2"
                strokeLinecap="round"
            />

            <circle
                cx="16"
                cy="16"
                r="2.5"
                fill="#F2B705"
            />

            <circle
                cx="23.4"
                cy="11.7"
                r="2.35"
                fill="#F2B705"
            />
        </svg>
    )
}


function CollapseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <path d="M7 12h10" />
        </svg>
    )
}


function SystemNoticeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 3 2.8 19h18.4L12 3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    )
}


function SendIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 12 20 4l-5 16-3-6-8-2Z" />
            <path d="m12 14 8-10" />
        </svg>
    )
}


function HistoryIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
            <path d="M12 7v5l3 2" />
        </svg>
    )
}


function PlusIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    )
}


function UserIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="8"
                r="3.2"
            />

            <path
                d="M5.5 19c.8-3.5 3.1-5.3 6.5-5.3s5.7 1.8 6.5 5.3"
            />
        </svg>
    )
}


function CopyIcon({
    copied = false,
}: {
    copied?: boolean
}) {
    if (copied) {
        return (
            <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="m5 12 4 4 10-10" />
            </svg>
        )
    }

    return (
        <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect
                x="8"
                y="8"
                width="10"
                height="10"
                rx="2"
            />

            <path
                d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
            />
        </svg>
    )
}


function TrashIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 7h16" />
            <path d="M9 7V4h6v3" />
            <path d="m7 7 1 13h8l1-13" />
        </svg>
    )
}


function BackIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    )
}


function ChevronIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="m9 6 6 6-6 6" />
        </svg>
    )
}


function formatInlineText(
    value: string,
): ReactNode[] {
    const parts =
        value.split(
            /(\*\*[^*]+\*\*)/g,
        )

    return parts.map(
        (part, index) => {
            if (
                part.startsWith('**')
                && part.endsWith('**')
                && part.length > 4
            ) {
                return (
                    <strong
                        key={`${part}-${index}`}
                    >
                        {part.slice(2, -2)}
                    </strong>
                )
            }

            return (
                <span
                    key={`${part}-${index}`}
                >
                    {part}
                </span>
            )
        },
    )
}


function FormattedAnswer({
    content,
}: {
    content: string
}) {
    const lines =
        content.split(/\r?\n/)

    const blocks:
        ReactNode[] = []

    let bulletItems:
        string[] = []

    function flushBullets() {
        if (
            bulletItems.length === 0
        ) {
            return
        }

        const current =
            bulletItems

        bulletItems = []

        blocks.push(
            <ul
                key={`list-${blocks.length}`}
                className="helper-answer__list"
            >
                {
                    current.map(
                        (item, index) => (
                            <li
                                key={`${item}-${index}`}
                            >
                                {formatInlineText(item)}
                            </li>
                        ),
                    )
                }
            </ul>,
        )
    }

    lines.forEach(
        (rawLine) => {
            const line =
                rawLine.trim()

            if (!line) {
                flushBullets()
                return
            }

            const bulletMatch =
                line.match(
                    /^[-*]\s+(.+)$/,
                )

            if (bulletMatch) {
                bulletItems.push(
                    bulletMatch[1],
                )

                return
            }

            flushBullets()

            blocks.push(
                <p
                    key={`paragraph-${blocks.length}`}
                    className="helper-answer__paragraph"
                >
                    {formatInlineText(line)}
                </p>,
            )
        },
    )

    flushBullets()

    return (
        <div className="helper-answer">
            {blocks}
        </div>
    )
}


function toLocalMessages(
    storedMessages:
        SomacaHelperMessage[],
): LocalMessage[] {
    return storedMessages.map(
        (message) => ({
            id:
                `stored-${message.id_message}`,
            role:
                message.role,
            content:
                message.content,
        }),
    )
}


function formatHistoryDate(
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
                hour:
                    '2-digit',
                minute:
                    '2-digit',
            },
        ).format(
            new Date(value),
        )
    )
}


export function SomacaHelperLauncher() {
    const {
        context,
        displayState,
        setDisplayState,
    } =
        useSomacaHelperContext()

    const {
        machines,
    } =
        useOperations()

    const [
        helperWidth,
        setHelperWidth,
    ] =
        useState(
            getInitialHelperWidth,
        )

    const [
        conversationId,
        setConversationId,
    ] =
        useState(
            getConversationId,
        )

    const [
        question,
        setQuestion,
    ] =
        useState('')

    const [
        messages,
        setMessages,
    ] =
        useState<LocalMessage[]>(
            [],
        )

    const [
        sending,
        setSending,
    ] =
        useState(false)

    const [
        sendError,
        setSendError,
    ] =
        useState('')

    const [
        copiedMessageId,
        setCopiedMessageId,
    ] =
        useState<string | null>(
            null,
        )

    const [
        conversations,
        setConversations,
    ] =
        useState<
            HelperConversationSummary[]
        >([])

    const [
        historyHasMore,
        setHistoryHasMore,
    ] =
        useState(false)

    const [
        historyCursor,
        setHistoryCursor,
    ] =
        useState<{
            activity: string
            conversationId: string
        } | null>(
            null,
        )

    const [
        historyLoadingMore,
        setHistoryLoadingMore,
    ] =
        useState(false)

    const [
        messagesHasMore,
        setMessagesHasMore,
    ] =
        useState(false)

    const [
        messagesBeforeId,
        setMessagesBeforeId,
    ] =
        useState<number | null>(
            null,
        )

    const [
        olderMessagesLoading,
        setOlderMessagesLoading,
    ] =
        useState(false)

    const [
        activeView,
        setActiveView,
    ] =
        useState<
            'chat' | 'history'
        >('chat')

    const [
        historyLoading,
        setHistoryLoading,
    ] =
        useState(false)

    const [
        conversationLoading,
        setConversationLoading,
    ] =
        useState(false)

    const [
        isClosing,
        setIsClosing,
    ] =
        useState(false)

    const [
        pendingDeleteId,
        setPendingDeleteId,
    ] =
        useState<string | null>(
            null,
        )

    const messagesEndRef =
        useRef<HTMLDivElement | null>(
            null,
        )

    const conversationScrollRef =
        useRef<HTMLDivElement | null>(
            null,
        )

    const historyScrollRef =
        useRef<HTMLElement | null>(
            null,
        )

    const suppressAutoScrollRef =
        useRef(false)

    const loadingHistoryMoreRef =
        useRef(false)

    const loadingOlderMessagesRef =
        useRef(false)

    const resizeStateRef =
        useRef<{
            startX: number
            startWidth: number
        } | null>(
            null,
        )

    const selectedMachine =
        useMemo(
            () =>
                context.current_machine_id
                    === null
                    ? null
                    : (
                        machines.find(
                            (machine) =>
                                machine.id_machine
                                === context.current_machine_id,
                        )
                        ?? null
                    ),
            [
                context.current_machine_id,
                machines,
            ],
        )

    const contextInfo =
        useMemo(
            () => {
                if (selectedMachine) {
                    return {
                        title:
                            selectedMachine.nom_machine,
                        detail:
                            `${selectedMachine.type_machine} · P-${String(
                                selectedMachine.id_poteau,
                            ).padStart(
                                2,
                                '0',
                            )}`,
                    }
                }

                if (
                    context.current_pole_id
                    !== null
                ) {
                    return {
                        title:
                            `P-${String(
                                context.current_pole_id,
                            ).padStart(
                                2,
                                '0',
                            )}`,
                        detail:
                            'Poteau sélectionné',
                    }
                }

                return null
            },
            [
                context.current_pole_id,
                selectedMachine,
            ],
        )

    const suggestions =
        useMemo(
            () => {
                if (selectedMachine) {
                    return [
                        'Résume-moi l’historique de cette machine.',
                        'Quel est son incident le plus récent ?',
                        'Avons-nous déjà eu un problème similaire sur cette machine ?',
                    ]
                }

                if (
                    context.current_pole_id
                    !== null
                ) {
                    return [
                        'Quels incidents concernent ce poteau ?',
                        'Résume-moi l’activité de ce poteau.',
                        'Quels équipements de ce poteau ont eu des incidents ?',
                    ]
                }

                return [
                    'Quels incidents critiques sont encore ouverts ?',
                    'Combien d’incidents avons-nous eus ce mois-ci, et combien étaient critiques ?',
                    'Quels incidents ont nécessité un contact Renault ?',
                ]
            },
            [
                context.current_pole_id,
                selectedMachine,
            ],
        )

    const hasMessages =
        messages.length > 0

    useEffect(() => {
        document.documentElement
            .style
            .setProperty(
                '--somaca-helper-width',
                `${helperWidth}px`,
            )

        window.localStorage.setItem(
            HELPER_WIDTH_STORAGE_KEY,
            String(helperWidth),
        )
    }, [
        helperWidth,
    ])

    useEffect(() => {
        if (
            suppressAutoScrollRef.current
        ) {
            suppressAutoScrollRef.current =
                false

            return
        }

        messagesEndRef.current
            ?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
    }, [
        messages,
        sending,
    ])

    useEffect(() => {
        let cancelled =
            false

        async function restoreConversation() {
            setConversationLoading(
                true,
            )

            try {
                const result =
                    await getHelperConversation(
                        conversationId,
                        {
                            limit: 40,
                        },
                    )

                if (cancelled) {
                    return
                }

                setMessages(
                    toLocalMessages(
                        result.items,
                    ),
                )

                setMessagesBeforeId(
                    result.next_before_id,
                )

                setMessagesHasMore(
                    result.has_more,
                )
            } catch (
                currentError
            ) {
                if (
                    currentError
                    instanceof ApiError
                    && currentError.status
                    === 404
                ) {
                    return
                }

                if (!cancelled) {
                    setSendError(
                        currentError
                            instanceof Error
                            ? currentError.message
                            : (
                                'Impossible de restaurer la conversation.'
                            ),
                    )
                }
            } finally {
                if (!cancelled) {
                    setConversationLoading(
                        false,
                    )
                }
            }
        }

        void restoreConversation()

        return () => {
            cancelled =
                true
        }
    }, [])

    useEffect(() => {
        function handlePointerMove(
            event: PointerEvent,
        ) {
            const resizeState =
                resizeStateRef.current

            if (!resizeState) {
                return
            }

            const nextWidth =
                clampHelperWidth(
                    resizeState.startWidth
                    + (
                        resizeState.startX
                        - event.clientX
                    ),
                )

            setHelperWidth(
                nextWidth,
            )
        }

        function handlePointerUp() {
            resizeStateRef.current =
                null

            document.body.style.cursor =
                ''

            document.body.style.userSelect =
                ''
        }

        window.addEventListener(
            'pointermove',
            handlePointerMove,
        )

        window.addEventListener(
            'pointerup',
            handlePointerUp,
        )

        return () => {
            window.removeEventListener(
                'pointermove',
                handlePointerMove,
            )

            window.removeEventListener(
                'pointerup',
                handlePointerUp,
            )
        }
    }, [])

    function beginResize(
        event:
            ReactPointerEvent<
                HTMLDivElement
            >,
    ) {
        resizeStateRef.current = {
            startX:
                event.clientX,
            startWidth:
                helperWidth,
        }

        document.body.style.cursor =
            'ew-resize'

        document.body.style.userSelect =
            'none'
    }

    function minimizeHelper() {
        if (isClosing) {
            return
        }

        setIsClosing(
            true,
        )

        window.setTimeout(
            () => {
                setDisplayState(
                    'collapsed',
                )

                setIsClosing(
                    false,
                )
            },
            190,
        )
    }

    function openHelper() {
        setActiveView(
            'chat',
        )

        setDisplayState(
            'open',
        )
    }

    function startNewConversation() {
        const nextConversationId =
            crypto.randomUUID()

        setConversationId(
            nextConversationId,
        )

        window.sessionStorage.setItem(
            HELPER_CONVERSATION_STORAGE_KEY,
            nextConversationId,
        )

        setMessages([])
        setMessagesHasMore(false)
        setMessagesBeforeId(null)
        setQuestion('')
        setSendError('')
        setPendingDeleteId(null)

        setActiveView(
            'chat',
        )
    }

    function errorTitle(
        message: string,
    ) {
        const normalized =
            message.toLocaleLowerCase(
                'fr-FR',
            )

        if (
            normalized.includes(
                'connexion',
            )
        ) {
            return 'Connexion impossible'
        }

        if (
            normalized.includes(
                'trop de demandes',
            )
        ) {
            return 'Limite temporaire'
        }

        if (
            normalized.includes(
                'temporairement indisponible',
            )
        ) {
            return 'Service indisponible'
        }

        return 'Analyse interrompue'
    }

    async function refreshConversationHistory() {
        setHistoryLoading(
            true,
        )

        try {
            const result =
                await getHelperConversations({
                    limit: 20,
                })

            setConversations(
                result.items,
            )

            setHistoryHasMore(
                result.has_more,
            )

            if (
                result.next_before_activity
                && result.next_before_conversation_id
            ) {
                setHistoryCursor({
                    activity:
                        result.next_before_activity,
                    conversationId:
                        result.next_before_conversation_id,
                })
            } else {
                setHistoryCursor(
                    null,
                )
            }
        } catch (
            currentError
        ) {
            setSendError(
                currentError
                    instanceof Error
                    ? currentError.message
                    : (
                        'Impossible de charger l’historique.'
                    ),
            )

            setConversations([])
            setHistoryHasMore(false)
            setHistoryCursor(null)
        } finally {
            setHistoryLoading(
                false,
            )
        }
    }

    async function loadMoreConversationHistory() {
        if (
            !historyHasMore
            || !historyCursor
            || loadingHistoryMoreRef.current
        ) {
            return
        }

        loadingHistoryMoreRef.current =
            true

        setHistoryLoadingMore(
            true,
        )

        try {
            const result =
                await getHelperConversations({
                    limit: 20,
                    beforeActivity:
                        historyCursor.activity,
                    beforeConversationId:
                        historyCursor.conversationId,
                })

            setConversations(
                (current) => [
                    ...current,
                    ...result.items,
                ],
            )

            setHistoryHasMore(
                result.has_more,
            )

            if (
                result.next_before_activity
                && result.next_before_conversation_id
            ) {
                setHistoryCursor({
                    activity:
                        result.next_before_activity,
                    conversationId:
                        result.next_before_conversation_id,
                })
            } else {
                setHistoryCursor(
                    null,
                )
            }
        } catch (
            currentError
        ) {
            setSendError(
                currentError
                    instanceof Error
                    ? currentError.message
                    : (
                        'Impossible de charger la suite de l’historique.'
                    ),
            )
        } finally {
            loadingHistoryMoreRef.current =
                false

            setHistoryLoadingMore(
                false,
            )
        }
    }

    async function loadOlderMessages() {
        if (
            !messagesHasMore
            || messagesBeforeId === null
            || loadingOlderMessagesRef.current
        ) {
            return
        }

        const container =
            conversationScrollRef.current

        if (!container) {
            return
        }

        const previousScrollHeight =
            container.scrollHeight

        loadingOlderMessagesRef.current =
            true

        setOlderMessagesLoading(
            true,
        )

        try {
            const result =
                await getHelperConversation(
                    conversationId,
                    {
                        limit: 40,
                        beforeId:
                            messagesBeforeId,
                    },
                )

            suppressAutoScrollRef.current =
                true

            setMessages(
                (current) => [
                    ...toLocalMessages(
                        result.items,
                    ),
                    ...current,
                ],
            )

            setMessagesBeforeId(
                result.next_before_id,
            )

            setMessagesHasMore(
                result.has_more,
            )

            window.requestAnimationFrame(
                () => {
                    window.requestAnimationFrame(
                        () => {
                            const addedHeight =
                                container.scrollHeight
                                - previousScrollHeight

                            container.scrollTop +=
                                addedHeight
                        },
                    )
                },
            )
        } catch (
            currentError
        ) {
            setSendError(
                currentError
                    instanceof Error
                    ? currentError.message
                    : (
                        'Impossible de charger les messages précédents.'
                    ),
            )
        } finally {
            loadingOlderMessagesRef.current =
                false

            setOlderMessagesLoading(
                false,
            )
        }
    }

    function handleConversationScroll(
        event:
            UIEvent<HTMLDivElement>,
    ) {
        if (
            event.currentTarget.scrollTop
            <= 80
        ) {
            void loadOlderMessages()
        }
    }

    function handleHistoryScroll(
        event:
            UIEvent<HTMLElement>,
    ) {
        const element =
            event.currentTarget

        const remaining =
            element.scrollHeight
            - element.scrollTop
            - element.clientHeight

        if (
            remaining <= 100
        ) {
            void loadMoreConversationHistory()
        }
    }

    async function openHistory() {
        setPendingDeleteId(
            null,
        )

        setActiveView(
            'history',
        )

        await refreshConversationHistory()
    }

    function closeHistory() {
        setPendingDeleteId(
            null,
        )

        setActiveView(
            'chat',
        )
    }

    async function openConversation(
        id: string,
    ) {
        setConversationLoading(
            true,
        )

        setSendError('')

        try {
            const result =
                await getHelperConversation(
                    id,
                    {
                        limit: 40,
                    },
                )

            setConversationId(
                id,
            )

            window.sessionStorage.setItem(
                HELPER_CONVERSATION_STORAGE_KEY,
                id,
            )

            setMessages(
                toLocalMessages(
                    result.items,
                ),
            )

            setMessagesBeforeId(
                result.next_before_id,
            )

            setMessagesHasMore(
                result.has_more,
            )

            setActiveView(
                'chat',
            )
        } catch (
            currentError
        ) {
            setSendError(
                currentError
                    instanceof Error
                    ? currentError.message
                    : (
                        'Impossible de charger cette conversation.'
                    ),
            )
        } finally {
            setConversationLoading(
                false,
            )
        }
    }

    async function removeConversation(
        id: string,
    ) {
        try {
            await deleteHelperConversation(
                id,
            )

            if (
                id === conversationId
            ) {
                startNewConversation()
            }

            setPendingDeleteId(
                null,
            )

            await refreshConversationHistory()
        } catch (
            currentError
        ) {
            setSendError(
                currentError
                    instanceof Error
                    ? currentError.message
                    : (
                        'Impossible de supprimer cette conversation.'
                    ),
            )
        }
    }

    function helperErrorMessage(
        currentError: unknown,
    ) {
        if (
            currentError
            instanceof ApiError
        ) {
            if (
                currentError.status
                === 0
            ) {
                return (
                    'Connexion au service impossible. '
                    + 'Vérifiez que SOMACA RADAR est disponible.'
                )
            }

            if (
                currentError.status
                === 429
            ) {
                return (
                    'Trop de demandes successives. '
                    + 'Réessayez dans un instant.'
                )
            }
        }

        return (
            currentError
                instanceof Error
                ? currentError.message
                : (
                    'L’analyse n’a pas pu aboutir. '
                    + 'Réessayez dans quelques instants.'
                )
        )
    }

    async function copyMessage(
        message: LocalMessage,
    ) {
        try {
            await navigator.clipboard.writeText(
                message.content,
            )

            setCopiedMessageId(
                message.id,
            )

            window.setTimeout(
                () => {
                    setCopiedMessageId(
                        (current) =>
                            current
                            === message.id
                                ? null
                                : current,
                    )
                },
                1500,
            )
        } catch {
            setSendError(
                'Impossible de copier le message.',
            )
        }
    }

    async function submitQuestion(
        event:
            FormEvent<
                HTMLFormElement
            >,
    ) {
        event.preventDefault()

        const normalizedQuestion =
            question.trim()

        if (
            !normalizedQuestion
            || sending
        ) {
            return
        }

        const userMessage:
            LocalMessage = {
                id:
                    `user-${Date.now()}`,
                role:
                    'USER',
                content:
                    normalizedQuestion,
            }

        setMessages(
            (current) => [
                ...current,
                userMessage,
            ],
        )

        setQuestion('')
        setSendError('')
        setSending(true)

        try {
            const response =
                await askSomacaHelper({
                    question:
                        normalizedQuestion,
                    conversation_id:
                        conversationId,
                    context: {
                        ...context,
                        preferred_language:
                            null,
                    },
                })

            if (
                response.status
                === 'ERROR'
            ) {
                setSendError(
                    response.answer,
                )

                return
            }

            setMessages(
                (current) => [
                    ...current,
                    {
                        id:
                            `assistant-${Date.now()}`,
                        role:
                            'ASSISTANT',
                        content:
                            response.answer,
                        status:
                            response.status,
                    },
                ],
            )

            void refreshConversationHistory()
        } catch (
            currentError
        ) {
            setSendError(
                helperErrorMessage(
                    currentError,
                ),
            )
        } finally {
            setSending(
                false,
            )
        }
    }

    function handleComposerKeyDown(
        event:
            KeyboardEvent<
                HTMLTextAreaElement
            >,
    ) {
        if (
            event.key !== 'Enter'
            || event.shiftKey
            || event.nativeEvent.isComposing
        ) {
            return
        }

        event.preventDefault()

        event.currentTarget
            .form
            ?.requestSubmit()
    }

    if (
        displayState
        === 'collapsed'
    ) {
        return (
            <button
                type="button"
                className="helper-collapsed"
                aria-label="Ouvrir SOMACA Helper"
                title="Ouvrir SOMACA Helper"
                onClick={
                    openHelper
                }
            >
                <span className="helper-collapsed__mark">
                    <RadarMark
                        size={30}
                    />
                </span>

                <span className="helper-collapsed__copy">
                    <strong>
                        SOMACA HELPER
                    </strong>

                    <small>
                        Assistant opérationnel
                    </small>
                </span>

                <span
                    className="helper-collapsed__open"
                    aria-hidden="true"
                >
                    <ChevronIcon />
                </span>
            </button>
        )
    }

    if (
        displayState
        === 'open'
    ) {
        return (
            <aside
                className={
                    isClosing
                        ? (
                            'helper-drawer '
                            + 'helper-drawer--closing'
                        )
                        : 'helper-drawer'
                }
                aria-label="SOMACA Helper"
            >
                <div
                    className="helper-resize-handle"
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Redimensionner SOMACA Helper"
                    onPointerDown={
                        beginResize
                    }
                >
                    <span />
                </div>

                <header className="helper-drawer__header">
                    <div className="helper-drawer__identity">
                        <span className="helper-radar-mark">
                            <RadarMark
                                size={28}
                            />
                        </span>

                        <div>
                            <strong>
                                SOMACA HELPER
                            </strong>

                            <span>
                                Assistance opérationnelle
                            </span>
                        </div>
                    </div>

                    <div className="helper-drawer__actions">
                        <button
                            type="button"
                            className={
                                activeView
                                === 'history'
                                    ? (
                                        'helper-icon-button '
                                        + 'helper-icon-button--active'
                                    )
                                    : 'helper-icon-button'
                            }
                            aria-label={
                                activeView
                                === 'history'
                                    ? 'Retour à la conversation'
                                    : 'Afficher l’historique'
                            }
                            title={
                                activeView
                                === 'history'
                                    ? 'Retour'
                                    : 'Historique'
                            }
                            onClick={
                                activeView
                                === 'history'
                                    ? closeHistory
                                    : () =>
                                        void openHistory()
                            }
                        >
                            {
                                activeView
                                === 'history'
                                    ? <BackIcon />
                                    : <HistoryIcon />
                            }
                        </button>

                        <button
                            type="button"
                            className="helper-icon-button helper-icon-button--new"
                            aria-label="Nouvelle conversation"
                            title="Nouvelle conversation"
                            onClick={
                                startNewConversation
                            }
                        >
                            <PlusIcon />
                        </button>

                        <button
                            type="button"
                            className="helper-icon-button"
                            aria-label="Réduire SOMACA Helper"
                            title="Réduire"
                            onClick={
                                minimizeHelper
                            }
                        >
                            <CollapseIcon />
                        </button>
                    </div>
                </header>

                {
                    contextInfo
                    && (
                        <div className="helper-context">
                            <span className="helper-context__dot" />

                            <span className="helper-context__scope">
                                Cartographie
                            </span>

                            <strong>
                                {contextInfo.title}
                            </strong>

                            <span className="helper-context__detail">
                                {contextInfo.detail}
                            </span>
                        </div>
                    )
                }

                {
                    sendError
                    && (
                        <div
                            className="helper-error"
                            role="alert"
                        >
                            <span className="helper-error__icon">
                                <SystemNoticeIcon />
                            </span>

                            <div className="helper-error__copy">
                                <strong>
                                    {errorTitle(sendError)}
                                </strong>

                                <span>
                                    {sendError}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="helper-error__close"
                                onClick={
                                    () =>
                                        setSendError('')
                                }
                                aria-label="Fermer le message"
                                title="Fermer"
                            >
                                ×
                            </button>
                        </div>
                    )
                }

                {
                    activeView
                    === 'history'
                        ? (
                            <section
                                ref={
                                    historyScrollRef
                                }
                                className="helper-history"
                                onScroll={
                                    handleHistoryScroll
                                }
                            >
                                <div className="helper-history__intro">
                                    <span>
                                        HISTORIQUE
                                    </span>

                                    <strong>
                                        Conversations
                                    </strong>

                                    <p>
                                        Retrouvez vos échanges précédents avec SOMACA Helper.
                                    </p>
                                </div>

                                {
                                    historyLoading
                                        ? (
                                            <div className="helper-loading helper-loading--center">
                                                <span />
                                                <span />
                                                <span />

                                                <strong>
                                                    Chargement
                                                </strong>
                                            </div>
                                        )
                                        : (
                                            conversations.length
                                            === 0
                                                ? (
                                                    <div className="helper-history__empty">
                                                        <HistoryIcon />

                                                        <strong>
                                                            Aucun historique
                                                        </strong>

                                                        <p>
                                                            Votre première conversation apparaîtra ici après un échange.
                                                        </p>
                                                    </div>
                                                )
                                                : (
                                                    <div className="helper-history__list">
                                                        {
                                                            conversations.map(
                                                                (conversation) => {
                                                                    const isActive =
                                                                        conversation.conversation_id
                                                                        === conversationId

                                                                    const awaitingDelete =
                                                                        pendingDeleteId
                                                                        === conversation.conversation_id

                                                                    return (
                                                                        <article
                                                                            key={
                                                                                conversation.conversation_id
                                                                            }
                                                                            className={
                                                                                isActive
                                                                                    ? (
                                                                                        'helper-history__item '
                                                                                        + 'helper-history__item--active'
                                                                                    )
                                                                                    : 'helper-history__item'
                                                                            }
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                className="helper-history__open"
                                                                                onClick={
                                                                                    () =>
                                                                                        void openConversation(
                                                                                            conversation.conversation_id,
                                                                                        )
                                                                                }
                                                                            >
                                                                                <span className="helper-history__preview">
                                                                                    {conversation.preview}
                                                                                </span>

                                                                                <span className="helper-history__meta">
                                                                                    {
                                                                                        formatHistoryDate(
                                                                                            conversation.last_activity,
                                                                                        )
                                                                                    }

                                                                                    {' · '}

                                                                                    {
                                                                                        conversation.message_count
                                                                                    }

                                                                                    {' msg'}
                                                                                </span>
                                                                            </button>

                                                                            {
                                                                                awaitingDelete
                                                                                    ? (
                                                                                        <div className="helper-history__confirm">
                                                                                            <span>
                                                                                                Supprimer cette conversation ?
                                                                                            </span>

                                                                                            <div>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={
                                                                                                        () =>
                                                                                                            setPendingDeleteId(
                                                                                                                null,
                                                                                                            )
                                                                                                    }
                                                                                                >
                                                                                                    Annuler
                                                                                                </button>

                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="helper-history__confirm-delete"
                                                                                                    onClick={
                                                                                                        () =>
                                                                                                            void removeConversation(
                                                                                                                conversation.conversation_id,
                                                                                                            )
                                                                                                    }
                                                                                                >
                                                                                                    Supprimer
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                    : (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="helper-history__delete"
                                                                                            aria-label="Supprimer la conversation"
                                                                                            title="Supprimer"
                                                                                            onClick={
                                                                                                () =>
                                                                                                    setPendingDeleteId(
                                                                                                        conversation.conversation_id,
                                                                                                    )
                                                                                            }
                                                                                        >
                                                                                            <TrashIcon />
                                                                                        </button>
                                                                                    )
                                                                            }
                                                                        </article>
                                                                    )
                                                                },
                                                            )
                                                        }
                                                    </div>
                                                )
                                        )
                                }

                                {
                                    historyLoadingMore
                                    && (
                                        <div className="helper-pagination-loading">
                                            Chargement…
                                        </div>
                                    )
                                }
                            </section>
                        )
                        : (
                            <>
                                <div
                                    ref={
                                        conversationScrollRef
                                    }
                                    className="helper-conversation"
                                    onScroll={
                                        handleConversationScroll
                                    }
                                >
                                    {
                                        olderMessagesLoading
                                        && (
                                            <div className="helper-pagination-loading">
                                                Chargement des messages précédents…
                                            </div>
                                        )
                                    }

                                    {
                                        !hasMessages
                                        && !conversationLoading
                                        && (
                                            <div className="helper-empty">
                                                <span className="helper-empty__mark">
                                                    <RadarMark
                                                        size={36}
                                                    />
                                                </span>

                                                <span className="helper-empty__eyebrow">
                                                    SOMACA RADAR
                                                </span>

                                                <h2>
                                                    Que souhaitez-vous analyser ?
                                                </h2>

                                                <p>
                                                    Incidents, équipements, historiques et cas similaires.
                                                </p>

                                                <div className="helper-empty__suggestions">
                                                    {
                                                        suggestions.map(
                                                            (suggestion) => (
                                                                <button
                                                                    key={
                                                                        suggestion
                                                                    }
                                                                    type="button"
                                                                    onClick={
                                                                        () =>
                                                                            setQuestion(
                                                                                suggestion,
                                                                            )
                                                                    }
                                                                >
                                                                    <span>
                                                                        {suggestion}
                                                                    </span>

                                                                    <ChevronIcon />
                                                                </button>
                                                            ),
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }

                                    {
                                        messages.map(
                                            (message) => {
                                                const copied =
                                                    copiedMessageId
                                                    === message.id

                                                const isUser =
                                                    message.role
                                                    === 'USER'

                                                return (
                                                    <div
                                                        key={
                                                            message.id
                                                        }
                                                        className={
                                                            isUser
                                                                ? (
                                                                    'helper-message-shell '
                                                                    + 'helper-message-shell--user'
                                                                )
                                                                : (
                                                                    'helper-message-shell '
                                                                    + 'helper-message-shell--assistant'
                                                                )
                                                        }
                                                    >
                                                        <article
                                                            className={
                                                                isUser
                                                                    ? (
                                                                        'helper-message '
                                                                        + 'helper-message--user'
                                                                    )
                                                                    : (
                                                                        'helper-message '
                                                                        + 'helper-message--assistant'
                                                                    )
                                                            }
                                                        >
                                                            {
                                                                isUser
                                                                    ? (
                                                                        <>
                                                                            <div className="helper-message__user-heading">
                                                                                <span className="helper-message__user-icon">
                                                                                    <UserIcon />
                                                                                </span>

                                                                                <strong>
                                                                                    VOUS
                                                                                </strong>
                                                                            </div>

                                                                            <p>
                                                                                {message.content}
                                                                            </p>
                                                                        </>
                                                                    )
                                                                    : (
                                                                        <>
                                                                            <div className="helper-message__assistant-heading">
                                                                                <span className="helper-mini-radar">
                                                                                    <RadarMark
                                                                                        size={18}
                                                                                    />
                                                                                </span>

                                                                                <strong>
                                                                                    SOMACA HELPER
                                                                                </strong>
                                                                            </div>

                                                                            <FormattedAnswer
                                                                                content={
                                                                                    message.content
                                                                                }
                                                                            />
                                                                        </>
                                                                    )
                                                            }
                                                        </article>

                                                        <button
                                                            type="button"
                                                            className="helper-message__copy helper-message__copy--outside"
                                                            onClick={
                                                                () =>
                                                                    void copyMessage(
                                                                        message,
                                                                    )
                                                            }
                                                        >
                                                            <CopyIcon
                                                                copied={
                                                                    copied
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    copied
                                                                        ? 'Copié'
                                                                        : 'Copier'
                                                                }
                                                            </span>
                                                        </button>
                                                    </div>
                                                )
                                            },
                                        )
                                    }

                                    {
                                        conversationLoading
                                        && (
                                            <div className="helper-loading">
                                                <span />
                                                <span />
                                                <span />

                                                <strong>
                                                    Chargement de la conversation
                                                </strong>
                                            </div>
                                        )
                                    }

                                    {
                                        sending
                                        && (
                                            <div className="helper-loading">
                                                <span />
                                                <span />
                                                <span />

                                                <strong>
                                                    Analyse des données
                                                </strong>
                                            </div>
                                        )
                                    }

                                    <div
                                        ref={
                                            messagesEndRef
                                        }
                                    />
                                </div>

                                <form
                                    className="helper-composer"
                                    onSubmit={
                                        submitQuestion
                                    }
                                >
                                    <div className="helper-composer__field">
                                        <textarea
                                            rows={2}
                                            maxLength={1000}
                                            value={
                                                question
                                            }
                                            placeholder="Posez votre question à SOMACA Helper…"
                                            onChange={
                                                (event) =>
                                                    setQuestion(
                                                        event.target.value,
                                                    )
                                            }
                                            onKeyDown={
                                                handleComposerKeyDown
                                            }
                                        />

                                        <span>
                                            Entrée : envoyer · Maj+Entrée : nouvelle ligne
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        className="helper-composer__send"
                                        disabled={
                                            sending
                                            || !question.trim()
                                        }
                                        aria-label="Envoyer la question"
                                        title="Envoyer"
                                    >
                                        <SendIcon />
                                    </button>
                                </form>
                            </>
                        )
                }
            </aside>
        )
    }

    return (
        <button
            type="button"
            className="helper-collapsed"
            aria-label="Ouvrir SOMACA Helper"
            title="Ouvrir SOMACA Helper"
            onClick={
                openHelper
            }
        >
            <span className="helper-collapsed__mark">
                <RadarMark
                    size={30}
                />
            </span>

            <span className="helper-collapsed__copy">
                <strong>
                    SOMACA HELPER
                </strong>

                <small>
                    Assistant opérationnel
                </small>
            </span>

            <span
                className="helper-collapsed__open"
                aria-hidden="true"
            >
                <ChevronIcon />
            </span>
        </button>
    )
}