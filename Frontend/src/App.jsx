import { useState } from 'react'
import { Alert, Box, Container, CssBaseline, ThemeProvider, Typography } from '@mui/material'
import Navbar from './components/layout/Navbar'
import HeroPage from './pages/HeroPage'
import ContactInfoPage from './pages/ContactInfoPage'
import AuthPage from './pages/AuthPage'
import EventsPage from './pages/EventsPage'
import CustomerDashboardPage from './pages/CustomerDashboardPage'
import OrganizerDashboardPage from './pages/OrganizerDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import { createAppTheme } from './theme/appTheme'

const theme = createAppTheme()

const protectedRoutes = {
  customer: 'customer',
  organizer: 'organizer',
  admin: 'admin',
}

function App() {
  const [activePage, setActivePage] = useState('hero')
  const [currentUser, setCurrentUser] = useState(null)

  const handleNavigate = (pageKey) => {
    if (pageKey === 'dashboard') {
      if (!currentUser) {
        setActivePage('auth')
        return
      }
      setActivePage(currentUser.role)
      return
    }

    const requiredRole = protectedRoutes[pageKey]
    if (!requiredRole) {
      setActivePage(pageKey)
      return
    }

    if (!currentUser) {
      setActivePage('auth')
      return
    }

    setActivePage(pageKey)
  }

  const renderProtectedPage = (requiredRole, pageComponent) => {
    if (!currentUser) {
      return (
        <Alert severity="info">
          Please login first. This dashboard is visible only to {requiredRole} users.
        </Alert>
      )
    }

    if (currentUser.role !== requiredRole) {
      return (
        <Alert severity="error">
          You are logged in as {currentUser.role}. This section is only for {requiredRole} users.
        </Alert>
      )
    }

    return pageComponent
  }

  const pages = {
    hero: <HeroPage onNavigate={handleNavigate} />,
    contact: <ContactInfoPage />,
    auth: (
      <AuthPage
        currentUser={currentUser}
        onLogin={(user) => {
          setCurrentUser(user)
          setActivePage(user.role)
        }}
        onLogout={() => {
          setCurrentUser(null)
          setActivePage('hero')
        }}
      />
    ),
    events: <EventsPage />,
    customer: renderProtectedPage('customer', <CustomerDashboardPage currentUser={currentUser} />),
    organizer: renderProtectedPage('organizer', <OrganizerDashboardPage currentUser={currentUser} />),
    admin: renderProtectedPage('admin', <AdminDashboardPage currentUser={currentUser} />),
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
            bgcolor: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 1100,
          }}
        >
          <Container maxWidth="lg" disableGutters={false}>
            <Navbar activePage={activePage} onNavigate={handleNavigate} currentUser={currentUser} />
          </Container>
        </Box>
        <Box component="main" sx={{ flex: 1, py: { xs: 3, md: 4 } }}>
          <Container maxWidth="lg">
            {pages[activePage] || <Typography variant="body1">Page not found.</Typography>}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
