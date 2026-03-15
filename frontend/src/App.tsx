import { useEffect, lazy, Suspense } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store'
import './styles/auth.css'
import './styles/premium-bg.css'
import './styles/talent-search.css'
import './styles/job-seeker-profile.css'
import './styles/dashboard.css'
import './styles/topnav.css'
import './styles/transitions.css'
import './styles/toast.css'
import './styles/animations.css'
import './styles/loading.css'
import './styles/form-validation.css'
import './styles/mobile-menu.css'
import './styles/dark-mode-colors.css'
import './styles/demo.css'
import './styles/select-input.css'
import './styles/micro-interactions.css'
import './styles/validation.css'
import './styles/undo-redo.css'
import './styles/global-ux.css'
import './styles/notifications-history.css'
// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })))
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const TalentSearchPage = lazy(() => import('./pages/TalentSearchPage').then(m => ({ default: m.TalentSearchPage })))
const JobSeekerProfilePage = lazy(() => import('./pages/JobSeekerProfilePage').then(m => ({ default: m.JobSeekerProfilePage })))
const RecruiterApplicationsPage = lazy(() => import('./pages/RecruiterApplicationsPage').then(m => ({ default: m.RecruiterApplicationsPage })))
const JobSeekerApplicationsPage = lazy(() => import('./pages/JobSeekerApplicationsPage').then(m => ({ default: m.JobSeekerApplicationsPage })))
const AdminJobRequestsPage = lazy(() => import('./pages/AdminJobRequestsPage').then(m => ({ default: m.AdminJobRequestsPage })))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'))
const AnalyticsDashboardPage = lazy(() => import('./pages/AnalyticsDashboardPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
import { TopNav } from './components/TopNav'
import { ToastContainer } from './components/ToastContainer'
import { Loading } from './components/Loading'
import { ThemeProvider } from './utils/ThemeContext'
import { LanguageProvider } from './utils/LanguageContext'
import { AuthProvider, useAuth } from './utils/AuthContext'
import { NavigationProvider, useNavigation } from './utils/NavigationContext'
import { ToastProvider } from './utils/ToastContext'
import { useGlobalScrollReveals } from './hooks/useGlobalScrollReveals'
import { usePageSEO } from './hooks/useSEO'

function AppContent() {
  const { currentPage, navigateTo } = useNavigation()
  const { isLoggedIn, isAdmin, userType } = useAuth()
  
  // Initialize scroll animations
  useGlobalScrollReveals()
  
  // Initialize SEO meta tags based on page
  usePageSEO()

  useEffect(() => {
    // Admin-only pages list
    const adminPages = ['admin-dashboard', 'admin-job-requests', 'user-management', 'analytics', 'reports']
    const recruiterPages = ['talent-search', 'recruiter-applications']
    const seekerPages = ['job-seeker-profile', 'job-seeker-applications']
    
    // Redirect to landing if logged in and on auth page
    if (isLoggedIn && currentPage === 'auth') {
      if (isAdmin) {
        navigateTo('admin-dashboard')
      } else {
        navigateTo('dashboard')
      }
    }
    
    // Protect admin pages - redirect to auth if not admin
    if (adminPages.includes(currentPage)) {
      if (!isLoggedIn || !isAdmin) {
        navigateTo('auth')
      }
    }

    if (recruiterPages.includes(currentPage) && (!isLoggedIn || userType !== 'recruiter')) {
      navigateTo('dashboard')
    }

    if (seekerPages.includes(currentPage) && (!isLoggedIn || userType !== 'job_seeker')) {
      navigateTo('dashboard')
    }

    if (currentPage === 'notifications' && !isLoggedIn) {
      navigateTo('auth')
    }
  }, [isLoggedIn, isAdmin, userType, currentPage, navigateTo])

  return (
    <>
      <TopNav onLogout={() => navigateTo('landing')} />
      <ToastContainer />
      
      <Suspense fallback={<Loading />}>
        <div className="page-content">
          {currentPage === 'landing' && (
            <LandingPage 
              onNavigateToAuth={() => navigateTo('auth')}
            />
          )}
          
          {currentPage === 'auth' && (
            <AuthPage 
              onAuthSuccess={() => navigateTo(isAdmin ? 'admin-dashboard' : 'dashboard')}
            />
          )}
          
          {currentPage === 'dashboard' && isLoggedIn && !isAdmin && (
            <DashboardPage 
              onNavigateToNotifications={() => navigateTo('notifications')}
              onNavigateToTalentSearch={() => navigateTo('talent-search')}
              onNavigateToRecruiterApplications={() => navigateTo('recruiter-applications')}
              onNavigateToProfile={() => navigateTo('job-seeker-profile')}
              onNavigateToMyApplications={() => navigateTo('job-seeker-applications')}
              onLogout={() => navigateTo('landing')}
            />
          )}
          
          {currentPage === 'talent-search' && (
            <TalentSearchPage />
          )}
          
          {currentPage === 'job-seeker-profile' && (
            <JobSeekerProfilePage />
          )}

          {currentPage === 'recruiter-applications' && (
            <RecruiterApplicationsPage />
          )}

          {currentPage === 'job-seeker-applications' && (
            <JobSeekerApplicationsPage />
          )}

          {currentPage === 'notifications' && isLoggedIn && (
            <NotificationsPage />
          )}

          {/* Admin Pages */}
          {currentPage === 'admin-dashboard' && isLoggedIn && isAdmin && (
            <AdminDashboardPage />
          )}

          {currentPage === 'admin-job-requests' && isLoggedIn && isAdmin && (
            <AdminJobRequestsPage />
          )}

          {currentPage === 'user-management' && isLoggedIn && isAdmin && (
            <UserManagementPage />
          )}

          {currentPage === 'analytics' && isLoggedIn && isAdmin && (
            <AnalyticsDashboardPage />
          )}

          {currentPage === 'reports' && isLoggedIn && isAdmin && (
            <ReportsPage />
          )}
        </div>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <NavigationProvider>
                <ToastProvider>
                  <AppContent />
                </ToastProvider>
              </NavigationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
