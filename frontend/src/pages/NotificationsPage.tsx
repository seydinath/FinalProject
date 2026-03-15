import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { useTheme } from '../utils/ThemeContext'
import { useNavigation } from '../utils/NavigationContext'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification,
} from '../services/notificationService'

const PAGE_SIZE = 20

export function NotificationsPage() {
  const { language } = useLanguage()
  const { isDark } = useTheme()
  const { navigateTo } = useNavigation()

  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | UserNotification['type']>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

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
  }), [language])

  const typeOptions: Array<{ value: 'all' | UserNotification['type']; label: string }> = [
    { value: 'all', label: language === 'fr' ? 'Tous types' : 'All types' },
    { value: 'application_submitted', label: language === 'fr' ? 'Candidature soumise' : 'Application submitted' },
    { value: 'application_accepted', label: language === 'fr' ? 'Candidature acceptee' : 'Application accepted' },
    { value: 'application_rejected', label: language === 'fr' ? 'Candidature rejetee' : 'Application rejected' },
    { value: 'job_request_approved', label: language === 'fr' ? 'Offre approuvee' : 'Job request approved' },
    { value: 'job_request_rejected', label: language === 'fr' ? 'Offre rejetee' : 'Job request rejected' },
    { value: 'system', label: language === 'fr' ? 'Systeme' : 'System' },
  ]

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
    if (link.includes('notifications')) return navigateTo('notifications')
    return navigateTo('dashboard')
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
