import { AdminJobOfferRequestsPanel } from '../components/AdminJobOfferRequestsPanel'
import { PremiumBackground } from '../components/PremiumBackground'
import '../styles/dashboard.css'

export function AdminJobRequestsPage() {
  return (
    <div className="dashboard-page">
      <PremiumBackground />
      <div className="dashboard-container">
        <AdminJobOfferRequestsPanel />
      </div>
    </div>
  )
}

export default AdminJobRequestsPage
