import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Rating,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import ScrollRevealSection from '../components/layout/ScrollRevealSection'
import { customerDashboard } from '../data/sampleData'

function CustomerDashboardPage({ currentUser }) {
  const [snack, setSnack] = useState({ open: false, message: '' })

  return (
    <Stack spacing={4}>
      <ScrollRevealSection threshold={0.06} rootMargin="0px 0px 0px 0px">
        <Box
          sx={{
            borderRadius: { xs: 3, md: 4 },
            p: { xs: 3, md: 5 },
            color: 'common.white',
            background: 'linear-gradient(120deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
            boxShadow: '0 24px 70px rgba(79, 70, 229, 0.35)',
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: '0.18em' }}>
            NextTicket · Your hub
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
            Hi {currentUser?.name?.split(' ')[0] || 'there'} — your Egypt events at a glance
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 640, opacity: 0.95 }}>
            Upcoming seats in Cairo and beyond, past highlights, and quick actions so Egyptian hosts get the feedback
            they deserve.
          </Typography>
        </Box>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Upcoming registrations
        </Typography>
        <Grid container spacing={2}>
          {customerDashboard.upcomingRegistrations.map((item) => (
            <Grid key={item.id} size={{ xs: 12, md: 6 }}>
              <Card sx={{ border: 'none', height: '100%', background: 'rgba(255,255,255,0.95)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography fontWeight={800}>{item.eventTitle}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.date}
                  </Typography>
                  <Button size="small" variant="contained" sx={{ mt: 2 }} onClick={() => setSnack({ open: true, message: 'Reminder saved — we’ll ping you 24h before doors open (demo).' })}>
                    Add calendar reminder
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Past experiences
        </Typography>
        <Stack spacing={2}>
          {customerDashboard.pastRegistrations.map((item) => (
            <Card key={item.id} sx={{ border: 'none', background: 'rgba(248,250,252,0.95)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
                    <Box>
                      <Typography fontWeight={800}>{item.eventTitle}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.date}
                      </Typography>
                    </Box>
                    {item.canReview && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Your rating
                        </Typography>
                        <Rating value={item.previousRating} readOnly size="small" />
                      </Stack>
                    )}
                  </Stack>
                  {item.canReview && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={() => setSnack({ open: true, message: 'Thanks! Your review was submitted (demo).' })}
                      >
                        Leave review
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => setSnack({ open: true, message: 'Rating updated — organizers will see it shortly (demo).' })}>
                        Update stars
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </ScrollRevealSection>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ open: false, message: '' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert variant="filled" severity="success" onClose={() => setSnack({ open: false, message: '' })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default CustomerDashboardPage
