import { useCallback, useEffect, useMemo, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useLanguage } from '../utils/LanguageContext'
import { useTheme } from '../utils/ThemeContext'
import { useNavigation } from '../utils/NavigationContext'
import { useAuth } from '../utils/AuthContext'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification,
} from '../services/notificationService'
import {
  getSupportMessages,
  markSupportThreadRead,
  sendSupportMessage,
  type SupportConversationState,
  type SupportMessage,
} from '../services/supportService'

const PAGE_SIZE = 20

export function NotificationsPage() {
  const { language } = useLanguage()
  const { isDark } = useTheme()
  const { navigateTo } = useNavigation()
  const { isAdmin } = useAuth()
  const socketUrl = useMemo(() => (import.meta as any).env.VITE_API_URL || 'http://localhost:5000', [])

  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | UserNotification['type']>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([])
  const [supportConversation, setSupportConversation] = useState<SupportConversationState | null>(null)
  const [supportDraft, setSupportDraft] = useState('')
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportSending, setSupportSending] = useState(false)

  const labels = useMemo(() => ({
    title: language === 'fr' ? 'Historique des notifications' : 'Notifications history',
    subtitle: language === 'fr' ? 'Retrouvez toutes vos alertes, et filtrez ce qui est important.' : 'Browse all your alerts and filter what matters.',
    unreadOnly: language === 'fr' ? 'Non lues uniquement' : 'Unread only',
    markAllRead: language === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    empty: language === 'fr' ? 'Aucune notification pour ce filtre.' : 'No notifications for this filter.',
    loadMore: language === 'fr' ? 'Voir plus' : 'Load more',
    back: language === 'fr' ? 'Retour tableau de bord' : 'Back to dashboard',
    unreadBadge: language === 'fr' ? 'non lues' : 'unread',
    supportTitle: language === 'fr' ? 'Canal avec l\'administration' : 'Admin channel',
    supportSubtitle: language === 'fr' ? 'Posez une question simple et recevez une reponse directement ici.' : 'Ask a simple question and get an answer directly here.',
    supportPlaceholder: language === 'fr' ? 'Ecrire un message a l\'administration...' : 'Write a message to the admin team...',
    supportEmpty: language === 'fr' ? 'Aucun echange pour le moment.' : 'No messages yet.',
    supportSend: language === 'fr' ? 'Envoyer' : 'Send',
    supportLoading: language === 'fr' ? 'Chargement du fil...' : 'Loading thread...',
    supportResolved: language === 'fr' ? 'Résolu' : 'Resolved',
    supportOpen: language === 'fr' ? 'Ouvert' : 'Open',
    supportResolvedHint: language === 'fr' ? 'La conversation est marquée comme résolue. Un nouveau message la rouvrira automatiquement.' : 'This conversation is marked as resolved. A new message will reopen it automatically.',
  }), [language])

  const typeOptions: Array<{ value: 'all' | UserNotification['type']; label: string }> = [
    { value: 'all', label: language === 'fr' ? 'Tous types' : 'All types' },
    { value: 'application_submitted', label: language === 'fr' ? 'Candidature soumise' : 'Application submitted' },
    { value: 'application_accepted', label: language === 'fr' ? 'Candidature acceptee' : 'Application accepted' },
    { value: 'application_rejected', label: language === 'fr' ? 'Candidature rejetee' : 'Application rejected' },
    { value: 'job_request_approved', label: language === 'fr' ? 'Offre approuvee' : 'Job request approved' },
    { value: 'job_request_rejected', label: language === 'fr' ? 'Offre rejetee' : 'Job request rejected' },
    { value: 'support_message', label: language === 'fr' ? 'Message support' : 'Support message' },
    { value: 'support_reply', label: language === 'fr' ? 'Reponse admin' : 'Admin reply' },
    { value: 'system', label: language === 'fr' ? 'Systeme' : 'System' },
  ]

  const loadSupportThread = useCallback(async () => {
    if (isAdmin) return
    setSupportLoading(true)
    const payload = await getSupportMessages()
    setSupportMessages(payload.messages)
    setSupportConversation(payload.conversation)
    await markSupportThreadRead()
    setSupportLoading(false)
  }, [isAdmin])

  const loadPage = useCallback(async (nextPage: number, reset = false) => {
    setLoading(true)
    const payload = await getNotifications(PAGE_SIZE, unreadOnly, nextPage, typeFilter)

    setNotifications((current) => {
      return reset ? payload.notifications : [...current, ...payload.notifications]
    })

    setUnreadCount(payload.unreadCount)
    setHasMore(payload.hasMore)
    setPage(nextPage)
    setLoading(false)
  }, [typeFilter, unreadOnly])

  useEffect(() => {
    loadPage(1, true)
  }, [loadPage])

  useEffect(() => {
    if (!isAdmin) {
      loadSupportThread()
    }
  }, [isAdmin, loadSupportThread])

  useEffect(() => {
    if (isAdmin) return

    const token = localStorage.getItem('authToken') || ''
    if (!token) return

    const socket: Socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('support:message', (payload: { message?: SupportMessage; conversation?: SupportConversationState }) => {
      if (payload.message) {
        setSupportMessages((current) => {
          if (current.some((item) => item._id === payload.message?._id)) {
            return current
          }
          return [...current, payload.message as SupportMessage]
        })
      }

      if (payload.conversation) {
        setSupportConversation(payload.conversation)
      }
    })

    socket.on('support:conversation', (payload: SupportConversationState) => {
      setSupportConversation(payload)
    })

    return () => {
      socket.disconnect()
    }
  }, [isAdmin, socketUrl])

  const handleFilterUnread = () => {
    setUnreadOnly((prev) => !prev)
  }

  const handleTypeFilter = (value: 'all' | UserNotification['type']) => {
    setTypeFilter(value)
  }

  const handleMarkRead = async (notification: UserNotification) => {
    if (notification.readAt) return
    const ok = await markNotificationRead(notification._id)
    if (!ok) return

    setNotifications((current) =>
      current.map((item) => (item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item))
    )
    setUnreadCount((count) => Math.max(count - 1, 0))
  }

  const handleMarkAllRead = async () => {
    const ok = await markAllNotificationsRead()
    if (!ok) return

    setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })))
    setUnreadCount(0)
  }

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return value
    }
  }

  const resolveAction = (link?: string) => {
    if (!link) return
    if (link.includes('recruiter-applications')) return navigateTo('recruiter-applications')
    if (link.includes('job-seeker-applications')) return navigateTo('job-seeker-applications')
    if (link.includes('user-management')) return navigateTo('user-management')
    if (link.includes('notifications')) return navigateTo('notifications')
    return navigateTo('dashboard')
  }

  const handleSendSupportMessage = async () => {
    const nextMessage = supportDraft.trim()
    if (!nextMessage || supportSending) return

    setSupportSending(true)
    const created = await sendSupportMessage(nextMessage)
    if (created?.message) {
      setSupportMessages((current) => [...current, created.message])
      setSupportConversation((created.conversation as SupportConversationState | null) || null)
      setSupportDraft('')
    }
    setSupportSending(false)
  }

  return (
    <div className={`notifications-page ${isDark ? 'dark' : 'light'}`}>
      <div className="notifications-history-panel">
        <header className="notifications-history-header">
          <div>
            <h1>{labels.title}</h1>
            <p>{labels.subtitle}</p>
          </div>
          <div className="notifications-actions-inline">
            <span className="notifications-unread-count">{unreadCount} {labels.unreadBadge}</span>
            <button type="button" onClick={handleMarkAllRead}>{labels.markAllRead}</button>
            <button type="button" onClick={() => navigateTo('dashboard')}>{labels.back}</button>
          </div>
        </header>

        {!isAdmin && (
          <section className="support-thread-panel">
            <div className="support-thread-header">
              <div>
                <h2>{labels.supportTitle}</h2>
                <p>{labels.supportSubtitle}</p>
              </div>
              {supportConversation && (
                <span className={`support-thread-status ${supportConversation.status}`}>
                  {supportConversation.status === 'resolved' ? labels.supportResolved : labels.supportOpen}
                </span>
              )}
            </div>

            {supportConversation?.status === 'resolved' && (
              <p className="support-thread-resolved-hint">{labels.supportResolvedHint}</p>
            )}

            <div className="support-thread-list">
              {supportLoading && <p className="notifications-list-message">{labels.supportLoading}</p>}
              {!supportLoading && supportMessages.length === 0 && (
                <p className="notifications-list-message">{labels.supportEmpty}</p>
              )}

              {!supportLoading && supportMessages.map((item) => (
                <article key={item._id} className={`support-thread-message ${item.senderRole === 'admin' ? 'from-admin' : 'from-user'}`}>
                  <div className="support-thread-bubble">
                    <strong>{item.senderRole === 'admin' ? 'Admin' : (language === 'fr' ? 'Vous' : 'You')}</strong>
                    <p>{item.message}</p>
                    <time>{formatDate(item.createdAt)}</time>
                  </div>
                </article>
              ))}
            </div>

            <div className="support-thread-composer">
              <textarea
                value={supportDraft}
                onChange={(event) => setSupportDraft(event.target.value)}
                placeholder={labels.supportPlaceholder}
                rows={3}
              />
              <button type="button" onClick={handleSendSupportMessage} disabled={supportSending || !supportDraft.trim()}>
                {supportSending ? labels.loading : labels.supportSend}
              </button>
            </div>
          </section>
        )}

        <div className="notifications-history-filters">
          <label className="checkbox-filter">
            <input type="checkbox" checked={unreadOnly} onChange={handleFilterUnread} />
            <span>{labels.unreadOnly}</span>
          </label>

          <select
            value={typeFilter}
            onChange={(event) => handleTypeFilter(event.target.value as 'all' | UserNotification['type'])}
            aria-label={language === 'fr' ? 'Filtrer par type' : 'Filter by type'}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="notifications-history-list">
          {loading && notifications.length === 0 && <p className="notifications-list-message">{labels.loading}</p>}

          {!loading && notifications.length === 0 && <p className="notifications-list-message">{labels.empty}</p>}

          {notifications.map((notification) => (
            <article key={notification._id} className={`history-item ${notification.readAt ? 'read' : 'unread'}`}>
              <div className="history-item-content" role="button" tabIndex={0} onClick={() => resolveAction(notification.link)}
                onKeyDown={(event) => event.key === 'Enter' && resolveAction(notification.link)}>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <time>{formatDate(notification.createdAt)}</time>
              </div>
              <div className="history-item-actions">
                {!notification.readAt && (
                  <button type="button" onClick={() => handleMarkRead(notification)}>
                    {language === 'fr' ? 'Marquer lu' : 'Mark read'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {hasMore && (
          <div className="notifications-load-more">
            <button type="button" disabled={loading} onClick={() => loadPage(page + 1)}>
              {loading ? labels.loading : labels.loadMore}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
