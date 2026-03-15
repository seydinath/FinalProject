import { RecruiterApplicationsList } from '../components/RecruiterApplicationsList'
import { PremiumBackground } from '../components/PremiumBackground'
import '../styles/dashboard.css'

export function RecruiterApplicationsPage() {
  return (
    <div className="dashboard-page">
      <PremiumBackground />
      <div className="dashboard-container">
        <RecruiterApplicationsList />
      </div>
    </div>
  )
}

export default RecruiterApplicationsPage
