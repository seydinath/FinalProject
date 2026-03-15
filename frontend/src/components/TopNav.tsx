import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useNavigation } from '../utils/NavigationContext'
import { useTheme } from '../utils/ThemeContext'
import { useLanguage } from '../utils/LanguageContext'
import { useAuth } from '../utils/AuthContext'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification,
} from '../services/notificationService'

interface TopNavProps {
  onLogout?: () => void
}

function TopNavContent({ onLogout }: TopNavProps) {
  const { currentPage, navigateTo, getBreadcrumbs } = useNavigation()
  const { isDark, toggle } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { isLoggedIn, logout, isAdmin, userType } = useAuth()
  const socketUrl = useMemo(() => (import.meta as any).env.VITE_API_URL || 'http://localhost:5000', [])
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false)
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const breadcrumbs = getBreadcrumbs()

  const handleLogout = useCallback(() => {
    logout()
    onLogout?.()
    navigateTo('landing')
  }, [logout, onLogout, navigateTo])

  const handleNavClick = useCallback((page: any) => {
    navigateTo(page as any)
    setShowAdminMenu(false)
    setShowNotificationsMenu(false)
  }, [navigateTo])

  const handleLanguageChange = useCallback((lang: 'fr' | 'en') => {
    setLanguage(lang)
  }, [setLanguage])

  const handleThemeToggle = useCallback(() => {
    toggle()
  }, [toggle])

  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) return

    setLoadingNotifications(true)
    const payload = await getNotifications(12, false)
    setNotifications(payload.notifications)
    setUnreadCount(payload.unreadCount)
    setLoadingNotifications(false)
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([])
      setUnreadCount(0)
      setShowNotificationsMenu(false)
      return
    }

    loadNotifications()

    const token = localStorage.getItem('authToken') || ''
    let socket: Socket | null = null

    if (token) {
      socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket'],
      })

      socket.on('notification:new', (incoming: UserNotification) => {
        setNotifications((current) => [incoming, ...current].slice(0, 20))
        setUnreadCount((count) => count + 1)
      })
    }

    return () => {
      socket?.disconnect()
    }
  }, [isLoggedIn, loadNotifications, socketUrl])

  const handleOpenNotifications = useCallback(async () => {
    const nextState = !showNotificationsMenu
    setShowNotificationsMenu(nextState)
    setShowAdminMenu(false)

    if (nextState) {
      await loadNotifications()
    }
  }, [loadNotifications, showNotificationsMenu])

  const handleNotificationClick = useCallback(async (notification: UserNotification) => {
    if (!notification.readAt) {
      await markNotificationRead(notification._id)
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item
        )
      )
      setUnreadCount((count) => Math.max(count - 1, 0))
    }

    if (notification.link) {
      if (notification.link.includes('job-seeker-applications')) {
        handleNavClick('job-seeker-applications')
      } else if (notification.link.includes('recruiter-applications')) {
        handleNavClick('recruiter-applications')
      } else {
        handleNavClick('dashboard')
      }
    }
  }, [handleNavClick])

  const handleMarkAllRead = useCallback(async () => {
    const ok = await markAllNotificationsRead()
    if (!ok) return

    setNotifications((current) =>
      current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() }))
    )
    setUnreadCount(0)
  }, [])

  const formatNotificationDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    } catch {
      return dateString
    }
  }

  const adminMenuItems = [
    { page: 'admin-dashboard', label: language === 'fr' ? 'Tableau de bord' : 'Dashboard', icon: '📊' },
    { page: 'admin-job-requests', label: language === 'fr' ? 'Demandes Offres' : 'Job Requests', icon: '📋' },
    { page: 'user-management', label: language === 'fr' ? 'Utilisateurs' : 'Users', icon: '👥' },
    { page: 'analytics', label: language === 'fr' ? 'Analytiques' : 'Analytics', icon: '📈' },
    { page: 'reports', label: language === 'fr' ? 'Rapports' : 'Reports', icon: '📄' }
  ]

  return (
    <div className={`topnav ${isDark ? 'dark' : 'light'}`}>
      <div className="topnav-container">
        {/* Logo Section */}
        <div className="topnav-logo">
          <button onClick={() => handleNavClick('landing')} className="logo-btn">
            <span className="logo-emoji">💼</span>
            <span className="logo-text">JobConnect</span>
          </button>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.page} className="breadcrumb-item">
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                <button
                  onClick={() => handleNavClick(crumb.page)}
                  className={`breadcrumb-link ${currentPage === crumb.page ? 'active' : ''}`}
                >
                  {crumb.label}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="topnav-actions">
          {!isLoggedIn && (
            <button 
              className="nav-item login-btn" 
              onClick={() => handleNavClick('auth')}
              title={language === 'fr' ? 'Se connecter' : 'Sign in'}
            >
              🔑 {language === 'fr' ? 'Se connecter' : 'Sign in'}
            </button>
          )}

          {isLoggedIn && userType === 'recruiter' && !isAdmin && (
            <>
              <button className="nav-item" onClick={() => handleNavClick('talent-search')} title={language === 'fr' ? 'Talents' : 'Talent'}>
                🔍
              </button>
              <button className="nav-item" onClick={() => handleNavClick('recruiter-applications')} title={language === 'fr' ? 'Candidatures' : 'Applications'}>
                📥
              </button>
            </>
          )}

          {isLoggedIn && userType === 'job_seeker' && !isAdmin && (
            <>
              <button className="nav-item" onClick={() => handleNavClick('job-seeker-profile')} title={language === 'fr' ? 'Mon profil' : 'My profile'}>
                👤
              </button>
              <button className="nav-item" onClick={() => handleNavClick('job-seeker-applications')} title={language === 'fr' ? 'Mes candidatures' : 'My applications'}>
                📄
              </button>
            </>
          )}

          {isLoggedIn && isAdmin && (
            <div className="admin-dropdown">
              <button 
                className="admin-menu-btn" 
                onClick={() => {
                  setShowAdminMenu(!showAdminMenu)
                  setShowNotificationsMenu(false)
                }}
                title={language === 'fr' ? 'Menu Admin' : 'Admin Menu'}
              >
                🔐 {language === 'fr' ? 'Admin' : 'Admin'}
              </button>
              {showAdminMenu && (
                <div className="admin-menu-popup">
                  {adminMenuItems.map(item => (
                    <button
                      key={item.page}
                      className={`admin-menu-item ${currentPage === item.page ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.page)}
                    >
                      <span className="admin-menu-icon">{item.icon}</span>
                      <span className="admin-menu-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isLoggedIn && (
            <div className="notifications-dropdown">
              <button
                className="nav-item notification-btn"
                onClick={handleOpenNotifications}
                title={language === 'fr' ? 'Notifications' : 'Notifications'}
              >
                🔔
                {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {showNotificationsMenu && (
                <div className="notifications-menu-popup">
                  <div className="notifications-menu-header">
                    <span>{language === 'fr' ? 'Notifications' : 'Notifications'}</span>
                    <div className="notifications-header-actions">
                      <button className="notifications-mark-all" onClick={handleMarkAllRead}>
                        {language === 'fr' ? 'Tout lu' : 'Mark all read'}
                      </button>
                      <button className="notifications-see-all" onClick={() => handleNavClick('notifications')}>
                        {language === 'fr' ? 'Historique' : 'History'}
                      </button>
                    </div>
                  </div>

                  <div className="notifications-menu-list">
                    {loadingNotifications && (
                      <p className="notifications-empty">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
                    )}

                    {!loadingNotifications && notifications.length === 0 && (
                      <p className="notifications-empty">{language === 'fr' ? 'Aucune notification' : 'No notifications yet'}</p>
                    )}

                    {!loadingNotifications && notifications.map((notification) => (
                      <button
                        key={notification._id}
                        className={`notification-item ${notification.readAt ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-item-top">
                          <span className="notification-title">{notification.title}</span>
                          {!notification.readAt && <span className="notification-dot" />}
                        </div>
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{formatNotificationDate(notification.createdAt)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoggedIn && (
            <button className="nav-item logout-btn" onClick={handleLogout} title={language === 'fr' ? "Se déconnecter" : "Logout"}>
              🚪
            </button>
          )}
          
          <div className="nav-divider"></div>

          <div className="language-selector">
            <button
              className={`lang-option ${language === 'fr' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('fr')}
            >
              FR
            </button>
            <button
              className={`lang-option ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              EN
            </button>
          </div>

          <button className="nav-item theme-btn" onClick={handleThemeToggle} title={language === 'fr' ? "Basculer le thème" : "Toggle theme"}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Animated line indicator */}
      <div className="topnav-indicator"></div>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders when parent updates
export const TopNav = memo(TopNavContent)
