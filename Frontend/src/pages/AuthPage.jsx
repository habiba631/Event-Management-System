import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import AuthSwitcher from '../components/auth/AuthSwitcher'
import ScrollRevealSection from '../components/layout/ScrollRevealSection'
import { SITE_DESCRIPTION, SITE_NAME } from '../config/site'

function AuthPage({ onLogin, currentUser, onLogout }) {
  return (
    <Stack spacing={3}>
      <ScrollRevealSection threshold={0.06} rootMargin="0px 0px 0px 0px">
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                height: '100%',
                borderRadius: { xs: 3, md: 4 },
                p: { xs: 3, md: 4 },
                color: 'common.white',
                background: 'linear-gradient(145deg, #0c4a6e 0%, #4f46e5 50%, #0f766e 100%)',
                boxShadow: '0 24px 70px rgba(12, 74, 110, 0.32)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="overline" sx={{ opacity: 0.88, letterSpacing: '0.18em' }}>
                {SITE_NAME}
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                Your account for events across Egypt
              </Typography>
              <Typography sx={{ mt: 2, opacity: 0.94, lineHeight: 1.65 }}>
                {SITE_DESCRIPTION}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              <Typography variant="h4" fontWeight={800}>
                Login or register
              </Typography>
              <Typography color="text.secondary">
                One profile for guests, hosts, and admins.
              </Typography>
              <AuthSwitcher onLogin={onLogin} currentUser={currentUser} />
              {currentUser && (
                <Box>
                  <Button variant="outlined" color="error" onClick={onLogout}>
                    Logout
                  </Button>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </ScrollRevealSection>
    </Stack>
  )
}

export default AuthPage
