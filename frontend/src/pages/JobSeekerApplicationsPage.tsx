import { JobSeekerApplicationStatus } from '../components/JobSeekerApplicationStatus'
import { PremiumBackground } from '../components/PremiumBackground'
import '../styles/dashboard.css'

export function JobSeekerApplicationsPage() {
  return (
    <div className="dashboard-page">
      <PremiumBackground />
      <div className="dashboard-container">
        <JobSeekerApplicationStatus />
      </div>
    </div>
  )
}

export default JobSeekerApplicationsPage
