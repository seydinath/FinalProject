import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import {
  deleteAdminUser,
  getAdminUsers,
  type AdminUser,
  updateAdminRights,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../services/adminService'
import '../styles/UserManagementPage.css'

const UserManagementPage = memo(() => {
  const { language } = useLanguage()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'job_seeker' | 'recruiter' | 'admin'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const result = await getAdminUsers()
    setUsers(result?.users || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

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
      </div>
    </div>
  )
})

UserManagementPage.displayName = 'UserManagementPage'

export default UserManagementPage
