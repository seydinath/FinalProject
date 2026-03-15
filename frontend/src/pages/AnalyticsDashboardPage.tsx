import { memo, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { getAdminAnalytics, type AdminAnalyticsResponse } from '../services/adminService'
import '../styles/AnalyticsDashboardPage.css'

const AnalyticsDashboardPage = memo(() => {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const result = await getAdminAnalytics()
      setAnalytics(result)
      setLoading(false)
    }

    load()
  }, [])

  const keyMetrics = useMemo(() => {
    if (!analytics) return []
    return [
      {
        label: language === 'fr' ? 'Utilisateurs total' : 'Total Users',
        value: analytics.keyMetrics.totalUsers,
        icon: '👥',
      },
      {
        label: language === 'fr' ? 'Offres total' : 'Total Jobs',
        value: analytics.keyMetrics.totalJobs,
        icon: '📋',
      },
      {
        label: language === 'fr' ? 'Offres ouvertes' : 'Open Jobs',
        value: analytics.keyMetrics.totalOpenJobs,
        icon: '🟢',
      },
      {
        label: language === 'fr' ? 'Demandes en attente' : 'Pending Requests',
        value: analytics.keyMetrics.totalPendingRequests,
        icon: '⏳',
      },
      {
        label: language === 'fr' ? 'Candidatures' : 'Applications',
        value: analytics.keyMetrics.totalApplications,
        icon: '📨',
      },
      {
        label: language === 'fr' ? 'Taux conversion' : 'Conversion Rate',
        value: `${analytics.keyMetrics.conversionRate}%`,
        icon: '📈',
      },
    ]
  }, [analytics, language])

  const getMax = (arr: Array<{ value: number }>) => {
    const values = arr.map((x) => x.value)
    return values.length ? Math.max(...values, 1) : 1
  }

  const usersByType = analytics?.usersByType || []
  const appsByStatus = analytics?.applicationsByStatus || []
  const jobsByPublication = analytics?.jobsByPublication || []

  const mapLabel = (label: string) => {
    if (label === 'job_seeker') return language === 'fr' ? 'Demandeurs' : 'Job Seekers'
    if (label === 'recruiter') return language === 'fr' ? 'Recruteurs' : 'Recruiters'
    if (label === 'admin') return 'Admins'
    if (label === 'applied') return language === 'fr' ? 'En attente' : 'Pending'
    if (label === 'accepted') return language === 'fr' ? 'Acceptees' : 'Accepted'
    if (label === 'rejected') return language === 'fr' ? 'Rejetees' : 'Rejected'
    if (label === 'pending') return language === 'fr' ? 'Publication en attente' : 'Publication pending'
    if (label === 'approved') return language === 'fr' ? 'Publiees' : 'Approved'
    return language === 'fr' ? 'Refusees' : 'Rejected'
  }

  return (
    <div className="analytics-dashboard-page">
      <div className="analytics-dashboard-container">
        <div className="analytics-header">
          <h1 className="analytics-title">{language === 'fr' ? 'Analytiques' : 'Analytics'}</h1>
        </div>

        {loading ? (
          <p>{language === 'fr' ? 'Chargement des donnees...' : 'Loading data...'}</p>
        ) : (
          <>
            <div className="key-metrics-grid">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="metric-card">
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{metric.icon}</div>
                  <p className="metric-label">{metric.label}</p>
                  <p className="metric-value">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">{language === 'fr' ? 'Applications par statut' : 'Applications by Status'}</h3>
                <div className="simple-chart">
                  {appsByStatus.map((item, index) => {
                    const maxVal = getMax(appsByStatus)
                    const height = (item.value / maxVal) * 200
                    return (
                      <div key={index} className="chart-bar-wrapper">
                        <div className="chart-bar" style={{ height: `${height}px` }} title={`${mapLabel(item.label)}: ${item.value}`}></div>
                        <p className="chart-label">{mapLabel(item.label)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">{language === 'fr' ? 'Publications d offres' : 'Job Publication Status'}</h3>
                <div className="simple-chart">
                  {jobsByPublication.map((item, index) => {
                    const maxVal = getMax(jobsByPublication)
                    const height = (item.value / maxVal) * 200
                    return (
                      <div key={index} className="chart-bar-wrapper">
                        <div className="chart-bar chart-bar-alt" style={{ height: `${height}px` }} title={`${mapLabel(item.label)}: ${item.value}`}></div>
                        <p className="chart-label">{mapLabel(item.label)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="distribution-grid">
              <div className="distribution-card">
                <h3 className="distribution-title">{language === 'fr' ? 'Utilisateurs par type' : 'Users by Type'}</h3>
                <div className="distribution-list">
                  {usersByType.map((item, index) => {
                    const total = usersByType.reduce((sum, x) => sum + x.value, 0)
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                    return (
                      <div key={index} className="distribution-item">
                        <div className="distribution-label-wrapper">
                          <p className="distribution-label">{mapLabel(item.label)}</p>
                          <p className="distribution-value">{item.value}</p>
                        </div>
                        <div className="distribution-bar-wrapper">
                          <div className="distribution-bar" style={{ width: `${pct}%` }}></div>
                        </div>
                        <p className="distribution-percentage">{pct}%</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
})

AnalyticsDashboardPage.displayName = 'AnalyticsDashboardPage'

export default AnalyticsDashboardPage
