import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useLanguage } from '../utils/LanguageContext'
import {
  deleteAdminUser,
  getAdminUsers,
  type AdminUser,
  updateAdminRights,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../services/adminService'
import {
  getAdminSupportSummary,
  getAdminSupportConversations,
  getSupportMessages,
  markSupportThreadRead,
  sendSupportMessage,
  type SupportConversationSummary,
  type SupportMessage,
  updateSupportConversationStatus,
} from '../services/supportService'
import '../styles/UserManagementPage.css'

const UserManagementPage = memo(() => {
  const { language } = useLanguage()
  const socketUrl = useMemo(() => (import.meta as any).env.VITE_API_URL || 'http://localhost:5000', [])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [supportConversations, setSupportConversations] = useState<SupportConversationSummary[]>([])
  const [selectedSupportUserId, setSelectedSupportUserId] = useState<string | null>(null)
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([])
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportDraft, setSupportDraft] = useState('')
  const [supportSending, setSupportSending] = useState(false)
  const [supportOpenCount, setSupportOpenCount] = useState(0)
  const [supportSearchTerm, setSupportSearchTerm] = useState('')
  const [supportFilter, setSupportFilter] = useState<'all' | 'open' | 'resolved' | 'unread'>('all')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'job_seeker' | 'recruiter' | 'admin'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const [result, conversations, summary] = await Promise.all([
      getAdminUsers(),
      getAdminSupportConversations(),
      getAdminSupportSummary(),
    ])

    setUsers(result?.users || [])
    setSupportConversations(conversations)
    setSupportOpenCount(summary.openConversations)
    setLoading(false)
  }, [])

  const refreshSupportSummary = useCallback(async () => {
    const summary = await getAdminSupportSummary()
    setSupportOpenCount(summary.openConversations)
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const loadSupportThread = useCallback(async (userId: string) => {
    setSupportLoading(true)
    setSelectedSupportUserId(userId)
    const payload = await getSupportMessages(userId)
    setSupportMessages(payload.messages)
    if (payload.conversation) {
      setSupportConversations((current) => {
        const existing = current.find((item) => item.userId === userId)
        if (!existing) return current
        return current.map((item) => item.userId === userId ? { ...item, ...payload.conversation } : item)
      })
    }
    await markSupportThreadRead(userId)
    setSupportConversations((current) =>
      current.map((item) => (item.userId === userId ? { ...item, unreadCount: 0 } : item))
    )
    setSupportLoading(false)
  }, [])

  useEffect(() => {
    if (!selectedSupportUserId && supportConversations.length > 0) {
      loadSupportThread(supportConversations[0].userId)
    }
  }, [loadSupportThread, selectedSupportUserId, supportConversations])

  useEffect(() => {
    const token = localStorage.getItem('authToken') || ''
    if (!token) return

    const socket: Socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('support:message', (payload: { message?: SupportMessage; conversation?: SupportConversationSummary }) => {
      if (payload.conversation) {
        setSupportConversations((current) => {
          const existing = current.find((item) => item.userId === payload.conversation?.userId)
          const next = existing
            ? current.map((item) => item.userId === payload.conversation?.userId ? { ...item, ...payload.conversation } : item)
            : [payload.conversation as SupportConversationSummary, ...current]

          return [...next].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        })
      }

      if (payload.message && selectedSupportUserId === payload.message.userId) {
        setSupportMessages((current) => {
          if (current.some((item) => item._id === payload.message?._id)) {
            return current
          }
          return [...current, payload.message as SupportMessage]
        })
      }

      refreshSupportSummary()
    })

    socket.on('support:conversation', (payload: SupportConversationSummary) => {
      setSupportConversations((current) => {
        const existing = current.find((item) => item.userId === payload.userId)
        if (!existing) return [payload, ...current]
        return current.map((item) => item.userId === payload.userId ? { ...item, ...payload } : item)
      })
      refreshSupportSummary()
    })

    return () => {
      socket.disconnect()
    }
  }, [refreshSupportSummary, selectedSupportUserId, socketUrl])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all'
        || (filterType === 'admin' ? user.isAdmin : user.type === filterType)
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [users, searchTerm, filterType, filterStatus])

  const changeStatus = useCallback(
    async (id: string, status: 'active' | 'suspended' | 'banned') => {
      const ok = await updateAdminUserStatus(id, status)
      if (ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
      }
    },
    []
  )

  const changeRole = useCallback(async (id: string, role: 'job_seeker' | 'recruiter') => {
    const ok = await updateAdminUserRole(id, role)
    if (ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, type: role } : u)))
    } else {
      window.alert(language === 'fr'
        ? 'Changement de role impossible a cause des donnees liees a cet utilisateur.'
        : 'Role change failed because this user has linked records.')
    }
  }, [language])

  const toggleAdminRights = useCallback(async (user: AdminUser) => {
    const fallbackUserType = user.type === 'admin' ? 'recruiter' : undefined
    const ok = await updateAdminRights(user.id, !user.isAdmin, fallbackUserType)
    if (ok) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u)))
    } else {
      window.alert(language === 'fr'
        ? 'Modification des droits admin impossible.'
        : 'Unable to update admin rights.')
    }
  }, [language])

  const handleDeleteUser = useCallback(
    async (id: string) => {
      const confirm = window.confirm(
        language === 'fr'
          ? 'Etes-vous sur de vouloir supprimer cet utilisateur ?'
          : 'Are you sure you want to delete this user?'
      )
      if (!confirm) return

      const ok = await deleteAdminUser(id)
      if (ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id))
      }
    },
    [language]
  )

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-badge status-active'
      case 'suspended':
        return 'status-badge status-suspended'
      case 'banned':
        return 'status-badge status-banned'
      default:
        return 'status-badge'
    }
  }

  const getStatusLabel = (status: string) => {
    if (language === 'fr') {
      if (status === 'active') return 'Actif'
      if (status === 'suspended') return 'Suspendu'
      if (status === 'banned') return 'Banni'
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const selectedConversation = useMemo(
    () => supportConversations.find((item) => item.userId === selectedSupportUserId) || null,
    [selectedSupportUserId, supportConversations]
  )

  const selectedUser = useMemo(
    () => users.find((item) => item.id === selectedSupportUserId) || null,
    [selectedSupportUserId, users]
  )

  const filteredSupportConversations = useMemo(() => {
    const search = supportSearchTerm.trim().toLowerCase()

    return supportConversations.filter((item) => {
      const matchesSearch = !search
        || item.userName.toLowerCase().includes(search)
        || item.userEmail.toLowerCase().includes(search)
        || item.lastMessage.toLowerCase().includes(search)

      const matchesFilter = supportFilter === 'all'
        || (supportFilter === 'open' && item.status === 'open')
        || (supportFilter === 'resolved' && item.status === 'resolved')
        || (supportFilter === 'unread' && item.unreadCount > 0)

      return matchesSearch && matchesFilter
    })
  }, [supportConversations, supportFilter, supportSearchTerm])

  const formatSupportDate = (value: string) => {
    try {
      return new Date(value).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    } catch {
      return value
    }
  }

  const handleSendSupportReply = useCallback(async () => {
    const nextMessage = supportDraft.trim()
    if (!selectedSupportUserId || !nextMessage || supportSending) return

    setSupportSending(true)
    const created = await sendSupportMessage(nextMessage, selectedSupportUserId)
    if (created?.message) {
      setSupportMessages((current) => [...current, created.message])
      setSupportDraft('')
      setSupportConversations((current) => {
        const existing = current.find((item) => item.userId === selectedSupportUserId)
        const updated: SupportConversationSummary = {
          userId: selectedSupportUserId,
          userName: existing?.userName || selectedUser?.name || 'Utilisateur',
          userEmail: existing?.userEmail || selectedUser?.email || '',
          userType: existing?.userType || (selectedUser?.type === 'admin' ? 'recruiter' : selectedUser?.type || 'job_seeker'),
          unreadCount: 0,
          lastMessage: created.message.message,
          lastSenderRole: 'admin',
          lastMessageAt: created.message.createdAt,
          status: ((created.conversation as SupportConversationSummary | null)?.status) || 'open',
          resolvedAt: ((created.conversation as SupportConversationSummary | null)?.resolvedAt) || null,
          resolvedBy: ((created.conversation as SupportConversationSummary | null)?.resolvedBy) || null,
        }

        const remaining = current.filter((item) => item.userId !== selectedSupportUserId)
        return [updated, ...remaining]
      })
    }
    setSupportSending(false)
  }, [selectedSupportUserId, supportDraft, supportSending, selectedUser])

  const handleUpdateConversationStatus = useCallback(async (status: 'open' | 'resolved') => {
    if (!selectedSupportUserId) return

    const updated = await updateSupportConversationStatus(selectedSupportUserId, status)
    if (!updated) return

    setSupportConversations((current) => current.map((item) => item.userId === selectedSupportUserId ? updated : item))
    setSupportOpenCount((current) => {
      const wasOpen = selectedConversation?.status === 'open'
      if (status === 'resolved' && wasOpen) return Math.max(current - 1, 0)
      if (status === 'open' && !wasOpen) return current + 1
      return current
    })
  }, [selectedConversation?.status, selectedSupportUserId])

  return (
    <div className="user-management-page">
      <div className="user-management-container">
        <div className="user-management-header">
          <h1 className="user-management-title">
            {language === 'fr' ? 'Gestion des utilisateurs' : 'User Management'}
          </h1>
          <p className="user-management-subtitle">
            {language === 'fr' ? `Total: ${filteredUsers.length} utilisateur(s)` : `Total: ${filteredUsers.length} user(s)`}
          </p>
        </div>

        <div className="user-management-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'job_seeker' | 'recruiter' | 'admin')}
              className="filter-select"
            >
              <option value="all">{language === 'fr' ? 'Type: Tous' : 'Type: All'}</option>
              <option value="job_seeker">{language === 'fr' ? "Demandeur d'emploi" : 'Job Seeker'}</option>
              <option value="recruiter">{language === 'fr' ? 'Recruteur' : 'Recruiter'}</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'suspended' | 'banned')}
              className="filter-select"
            >
              <option value="all">{language === 'fr' ? 'Statut: Tous' : 'Status: All'}</option>
              <option value="active">{language === 'fr' ? 'Actif' : 'Active'}</option>
              <option value="suspended">{language === 'fr' ? 'Suspendu' : 'Suspended'}</option>
              <option value="banned">{language === 'fr' ? 'Banni' : 'Banned'}</option>
            </select>
          </div>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>{language === 'fr' ? 'Nom' : 'Name'}</th>
                <th>Email</th>
                <th>{language === 'fr' ? 'Role metier' : 'Business role'}</th>
                <th>{language === 'fr' ? 'Droits admin' : 'Admin rights'}</th>
                <th>{language === 'fr' ? 'Statut' : 'Status'}</th>
                <th>{language === 'fr' ? 'Inscrit le' : 'Joined'}</th>
                <th>{language === 'fr' ? 'Actif le' : 'Last Active'}</th>
                <th>{language === 'fr' ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="user-row">
                  <td className="user-name">{user.name}</td>
                  <td className="user-email">{user.email}</td>
                  <td className="user-type">
                    <select
                      className="role-select"
                      value={user.type === 'admin' ? 'recruiter' : user.type}
                      onChange={(e) => changeRole(user.id, e.target.value as 'job_seeker' | 'recruiter')}
                    >
                      <option value="job_seeker">{language === 'fr' ? 'Demandeur' : 'Job seeker'}</option>
                      <option value="recruiter">{language === 'fr' ? 'Recruteur' : 'Recruiter'}</option>
                    </select>
                  </td>
                  <td className="user-admin-rights">
                    <button
                      className={`admin-rights-btn ${user.isAdmin ? 'enabled' : 'disabled'}`}
                      onClick={() => toggleAdminRights(user)}
                    >
                      {user.isAdmin
                        ? (language === 'fr' ? 'Retirer admin' : 'Remove admin')
                        : (language === 'fr' ? 'Rendre admin' : 'Make admin')}
                    </button>
                  </td>
                  <td className="user-status">
                    <span className={getStatusBadgeClass(user.status)}>{getStatusLabel(user.status)}</span>
                  </td>
                  <td className="user-date">{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td className="user-date">{new Date(user.lastActive).toLocaleDateString()}</td>
                  <td className="user-actions">
                    <div className="action-buttons">
                      {user.status === 'active' && (
                        <>
                          <button
                            className="action-btn action-suspend"
                            onClick={() => changeStatus(user.id, 'suspended')}
                            title={language === 'fr' ? 'Suspendre' : 'Suspend'}
                          >
                            ⏸️
                          </button>
                          <button
                            className="action-btn action-ban"
                            onClick={() => changeStatus(user.id, 'banned')}
                            title={language === 'fr' ? 'Bannir' : 'Ban'}
                          >
                            🚫
                          </button>
                        </>
                      )}
                      {(user.status === 'suspended' || user.status === 'banned') && (
                        <button
                          className="action-btn action-activate"
                          onClick={() => changeStatus(user.id, 'active')}
                          title={language === 'fr' ? 'Activer' : 'Activate'}
                        >
                          ✅
                        </button>
                      )}
                      <button
                        className="action-btn action-support"
                        onClick={() => loadSupportThread(user.id)}
                        title={language === 'fr' ? 'Ouvrir le canal' : 'Open channel'}
                      >
                        💬
                      </button>
                      <button
                        className="action-btn action-delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title={language === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(loading || filteredUsers.length === 0) && (
          <div className="no-users-message">
            <p>
              {loading
                ? language === 'fr'
                  ? 'Chargement...'
                  : 'Loading...'
                : language === 'fr'
                  ? 'Aucun utilisateur trouve'
                  : 'No users found'}
            </p>
          </div>
        )}

        <section className="support-admin-panel">
          <div className="support-admin-header">
            <div>
              <h2>{language === 'fr' ? 'Canal admin-utilisateurs' : 'Admin-user channel'}</h2>
              <p>
                {language === 'fr'
                  ? 'Echanges simples avec les utilisateurs, sans interface de chat lourde.'
                  : 'Simple conversations with users, without a heavy chat interface.'}
              </p>
            </div>
            <span className="support-open-counter">
              {supportOpenCount} {language === 'fr' ? 'fil(s) ouverts' : 'open thread(s)'}
            </span>
          </div>

          <div className="support-admin-layout">
            <aside className="support-admin-sidebar">
              <div className="support-sidebar-controls">
                <input
                  type="text"
                  value={supportSearchTerm}
                  onChange={(event) => setSupportSearchTerm(event.target.value)}
                  placeholder={language === 'fr' ? 'Rechercher un fil...' : 'Search a thread...'}
                />

                <select
                  value={supportFilter}
                  onChange={(event) => setSupportFilter(event.target.value as 'all' | 'open' | 'resolved' | 'unread')}
                >
                  <option value="all">{language === 'fr' ? 'Tous les fils' : 'All threads'}</option>
                  <option value="open">{language === 'fr' ? 'Ouverts' : 'Open'}</option>
                  <option value="resolved">{language === 'fr' ? 'Résolus' : 'Resolved'}</option>
                  <option value="unread">{language === 'fr' ? 'Non lus' : 'Unread'}</option>
                </select>
              </div>

              {supportConversations.length === 0 && (
                <p className="support-admin-empty">
                  {language === 'fr' ? 'Aucun message utilisateur pour le moment.' : 'No user messages yet.'}
                </p>
              )}

              {supportConversations.length > 0 && filteredSupportConversations.length === 0 && (
                <p className="support-admin-empty">
                  {language === 'fr' ? 'Aucun fil ne correspond aux filtres.' : 'No threads match current filters.'}
                </p>
              )}

              {filteredSupportConversations.map((conversation) => (
                <button
                  key={conversation.userId}
                  type="button"
                  className={`support-conversation-item ${selectedSupportUserId === conversation.userId ? 'active' : ''}`}
                  onClick={() => loadSupportThread(conversation.userId)}
                >
                  <div className="support-conversation-top">
                    <strong>{conversation.userName}</strong>
                    <div className="support-conversation-flags">
                      <span className={`support-conversation-status ${conversation.status}`}>
                        {conversation.status === 'resolved'
                          ? (language === 'fr' ? 'Résolu' : 'Resolved')
                          : (language === 'fr' ? 'Ouvert' : 'Open')}
                      </span>
                      {conversation.unreadCount > 0 && <span className="support-conversation-badge">{conversation.unreadCount}</span>}
                    </div>
                  </div>
                  <span>{conversation.userEmail}</span>
                  <p>{conversation.lastMessage}</p>
                  <time>{formatSupportDate(conversation.lastMessageAt)}</time>
                </button>
              ))}
            </aside>

            <div className="support-thread-admin">
              {!selectedSupportUserId && (
                <p className="support-admin-empty">
                  {language === 'fr' ? 'Selectionnez un utilisateur pour ouvrir le fil.' : 'Select a user to open the thread.'}
                </p>
              )}

              {selectedSupportUserId && (
                <>
                  <div className="support-thread-admin-header">
                    <div>
                      <h3>{selectedConversation?.userName || selectedUser?.name || (language === 'fr' ? 'Utilisateur' : 'User')}</h3>
                      <p>{selectedConversation?.userEmail || selectedUser?.email || ''}</p>
                      {selectedConversation?.resolvedAt && (
                        <p className="support-thread-audit">
                          {language === 'fr' ? 'Résolu le ' : 'Resolved on '}
                          {formatSupportDate(selectedConversation.resolvedAt)}
                          {selectedConversation.resolvedBy?.name
                            ? `${language === 'fr' ? ' par ' : ' by '}${selectedConversation.resolvedBy.name}`
                            : ''}
                        </p>
                      )}
                    </div>
                    {selectedConversation && (
                      <div className="support-thread-admin-actions">
                        <span className={`support-conversation-status ${selectedConversation.status}`}>
                          {selectedConversation.status === 'resolved'
                            ? (language === 'fr' ? 'Résolu' : 'Resolved')
                            : (language === 'fr' ? 'Ouvert' : 'Open')}
                        </span>
                        <button
                          type="button"
                          className="support-status-btn"
                          onClick={() => handleUpdateConversationStatus(selectedConversation.status === 'open' ? 'resolved' : 'open')}
                        >
                          {selectedConversation.status === 'open'
                            ? (language === 'fr' ? 'Marquer résolu' : 'Mark resolved')
                            : (language === 'fr' ? 'Rouvrir' : 'Reopen')}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="support-thread-admin-list">
                    {supportLoading && (
                      <p className="support-admin-empty">{language === 'fr' ? 'Chargement du fil...' : 'Loading thread...'}</p>
                    )}

                    {!supportLoading && supportMessages.length === 0 && (
                      <p className="support-admin-empty">{language === 'fr' ? 'Aucun message dans ce fil.' : 'No messages in this thread.'}</p>
                    )}

                    {!supportLoading && supportMessages.map((message) => (
                      <article
                        key={message._id}
                        className={`support-admin-message ${message.senderRole === 'admin' ? 'from-admin' : 'from-user'}`}
                      >
                        <div className="support-admin-bubble">
                          <strong>
                            {message.senderRole === 'admin'
                              ? 'Admin'
                              : (selectedConversation?.userName || selectedUser?.name || (language === 'fr' ? 'Utilisateur' : 'User'))}
                          </strong>
                          <p>{message.message}</p>
                          <time>{formatSupportDate(message.createdAt)}</time>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="support-thread-admin-composer">
                    <textarea
                      rows={3}
                      value={supportDraft}
                      onChange={(event) => setSupportDraft(event.target.value)}
                      placeholder={language === 'fr' ? 'Repondre a cet utilisateur...' : 'Reply to this user...'}
                    />
                    <button
                      type="button"
                      onClick={handleSendSupportReply}
                      disabled={supportSending || !supportDraft.trim()}
                    >
                      {supportSending
                        ? (language === 'fr' ? 'Envoi...' : 'Sending...')
                        : (language === 'fr' ? 'Envoyer' : 'Send')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
})

UserManagementPage.displayName = 'UserManagementPage'

export default UserManagementPage
