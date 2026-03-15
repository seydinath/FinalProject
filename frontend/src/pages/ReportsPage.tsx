import { useEffect, useMemo, useState } from 'react'
import { getAdminReports, type AdminReport } from '../services/adminService'
import { useLanguage } from '../utils/LanguageContext'
import '../styles/ReportsPage.css'

const ReportsPage = () => {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<AdminReport[]>([])
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [reportType, setReportType] = useState<'all' | 'user' | 'job' | 'engagement'>('all')

  useEffect(() => {
    async function loadReports() {
      setLoading(true)
      const data = await getAdminReports()
      setReports(data)
      setLoading(false)
    }

    loadReports()
  }, [])

  const filteredReports = useMemo(() => {
    if (reportType === 'all') return reports
    return reports.filter((r) => r.type === reportType)
  }, [reports, reportType])

  const typeLabel = (type: AdminReport['type']) => {
    if (language === 'fr') {
      if (type === 'user') return 'Utilisateurs'
      if (type === 'job') return 'Offres'
      return 'Candidatures'
    }

    if (type === 'user') return 'Users'
    if (type === 'job') return 'Jobs'
    return 'Engagement'
  }

  const statusLabel = (status: AdminReport['status']) => {
    if (language === 'fr') {
      return status === 'completed' ? 'Termine' : status
    }
    return status
  }

  const formatMetricLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (x) => x.toUpperCase())
  }

  return (
    <div className="reports-page">
      <div className="reports-container">
        <div className="reports-header">
          <div className="reports-header-content">
            <h1 className="reports-title">{language === 'fr' ? 'Rapports' : 'Reports'}</h1>
            <p className="reports-subtitle">
              {language === 'fr'
                ? 'Donnees reelles generees depuis la base MongoDB.'
                : 'Real data generated from MongoDB records.'}
            </p>
          </div>

          <button className="generate-report-btn" onClick={() => setShowGenerator((v) => !v)}>
            {language === 'fr' ? 'Generer / Filtrer' : 'Generate / Filter'}
          </button>
        </div>

        {showGenerator && (
          <div className="generate-form-card">
            <div className="generate-form-header">
              <h2 className="generate-form-title">{language === 'fr' ? 'Filtrer les rapports' : 'Filter reports'}</h2>
            </div>
            <div className="generate-form-content">
              <div className="form-group">
                <label className="form-label" htmlFor="reportType">
                  {language === 'fr' ? 'Type de rapport' : 'Report type'}
                </label>
                <select
                  id="reportType"
                  className="form-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as 'all' | 'user' | 'job' | 'engagement')}
                >
                  <option value="all">{language === 'fr' ? 'Tous' : 'All'}</option>
                  <option value="user">{language === 'fr' ? 'Utilisateurs' : 'Users'}</option>
                  <option value="job">{language === 'fr' ? 'Offres' : 'Jobs'}</option>
                  <option value="engagement">{language === 'fr' ? 'Candidatures' : 'Engagement'}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p>{language === 'fr' ? 'Chargement des rapports...' : 'Loading reports...'}</p>
        ) : (
          <div className="reports-content">
            <div className="reports-list">
              <h2 className="reports-list-title">
                {language === 'fr' ? 'Rapports disponibles' : 'Available reports'} ({filteredReports.length})
              </h2>

              {filteredReports.length === 0 ? (
                <div className="no-reports-message">
                  {language === 'fr' ? 'Aucun rapport disponible.' : 'No reports available.'}
                </div>
              ) : (
                <div className="reports-grid">
                  {filteredReports.map((report) => (
                    <button
                      key={report.id}
                      className={`report-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="report-card-header">
                        <span className="report-type-icon">{report.type === 'user' ? '👥' : report.type === 'job' ? '📋' : '📨'}</span>
                        <span className="report-status-icon">{report.status === 'completed' ? '✅' : '⏳'}</span>
                      </div>
                      <h3 className="report-card-title">{report.title}</h3>
                      <p className="report-card-date">{new Date(report.generatedDate).toLocaleString()}</p>
                      <span className="report-card-type">{typeLabel(report.type)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedReport && (
              <aside className="report-details-panel">
                <div className="details-header">
                  <h3 className="details-title">{selectedReport.title}</h3>
                  <button className="close-btn" onClick={() => setSelectedReport(null)}>
                    ×
                  </button>
                </div>

                <div className="details-content">
                  <div className="detail-section">
                    <p className="detail-label">{language === 'fr' ? 'Type' : 'Type'}</p>
                    <p className="detail-value">{typeLabel(selectedReport.type)}</p>
                  </div>

                  <div className="detail-section">
                    <p className="detail-label">{language === 'fr' ? 'Statut' : 'Status'}</p>
                    <p className="detail-value">{statusLabel(selectedReport.status)}</p>
                  </div>

                  <div className="detail-section">
                    <p className="detail-label">{language === 'fr' ? 'Genere le' : 'Generated on'}</p>
                    <p className="detail-value">{new Date(selectedReport.generatedDate).toLocaleString()}</p>
                  </div>

                  <div className="detail-section">
                    <p className="detail-label">{language === 'fr' ? 'Description' : 'Description'}</p>
                    <p className="detail-value">{selectedReport.description}</p>
                  </div>

                  <div className="metrics-section">
                    <p className="detail-label">{language === 'fr' ? 'Metriques basees DB' : 'DB-backed metrics'}</p>
                    <div className="metrics-grid">
                      {Object.entries(selectedReport.metrics).map(([key, value]) => (
                        <div key={key} className="metric-item">
                          <p className="metric-name">{formatMetricLabel(key)}</p>
                          <p className="metric-val">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
