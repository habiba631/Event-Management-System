import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Card, CardContent, CircularProgress, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import CreateEventCard from '../components/cards/CreateEventCard'
import DeleteEventCard from '../components/cards/DeleteEventCard'
import ScrollRevealSection from '../components/layout/ScrollRevealSection'
import { organizerDashboard } from '../data/sampleData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function mapManagedRow(doc) {
  const id = doc._id != null ? String(doc._id) : String(doc.id)
  return {
    id,
    title: doc.title,
    registrations: Number(doc.registrations ?? 0),
    capacity: Number(doc.capacity ?? 0),
  }
}

function OrganizerDashboardPage({ currentUser }) {
  const [managedEvents, setManagedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadManagedEvents = useCallback(async () => {
    const organizerId = currentUser?._id
    if (!organizerId) {
      setManagedEvents([])
      setLoading(false)
      setLoadError('Your session has no user id. Log in again to load events.')
      return
    }

    setLoading(true)
    setLoadError('')

    try {
      const params = new URLSearchParams({ organizerUser: String(organizerId) })
      const response = await fetch(`${API_BASE_URL}/api/events?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load your events')
      }

      const list = Array.isArray(data) ? data : []
      setManagedEvents(list.map(mapManagedRow))
    } catch (err) {
      setLoadError(err.message)
      setManagedEvents([])
    } finally {
      setLoading(false)
    }
  }, [currentUser?._id])

  useEffect(() => {
    loadManagedEvents()
  }, [loadManagedEvents])

  return (
    <Stack spacing={4}>
      <ScrollRevealSection threshold={0.06} rootMargin="0px 0px 0px 0px">
        <Box
          sx={{
            borderRadius: { xs: 3, md: 4 },
            p: { xs: 3, md: 5 },
            color: 'common.white',
            background: 'linear-gradient(125deg, #0f766e 0%, #0ea5e9 55%, #6366f1 100%)',
            boxShadow: '0 24px 70px rgba(15, 118, 110, 0.35)',
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: '0.18em' }}>
            NextTicket · Organizer cockpit
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
            Welcome back, {currentUser?.name?.split(' ')[0] || 'host'}
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 640, opacity: 0.95 }}>
            Draft launches for Egyptian venues, watch fills in real time, and keep Ramadan pop-ups and weekend festivals
            organized in one vibrant workspace.
          </Typography>
        </Box>
      </ScrollRevealSection>

      {loadError && (
        <Alert severity="warning" onClose={() => setLoadError('')}>
          {loadError}
        </Alert>
      )}

      <ScrollRevealSection>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CreateEventCard currentUser={currentUser} onEventCreated={loadManagedEvents} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DeleteEventCard managedEvents={managedEvents} onDeleted={loadManagedEvents} />
          </Grid>
        </Grid>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Managed events
        </Typography>
        {loading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={2}>
            {managedEvents.map((event) => {
              const pct = event.capacity > 0 ? Math.min(100, Math.round((event.registrations / event.capacity) * 100)) : 0
              return (
                <Card key={event.id} sx={{ border: 'none', background: 'rgba(255,255,255,0.95)' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Typography fontWeight={800}>{event.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.registrations}/{event.capacity}
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 10, borderRadius: 999 }} />
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
            {managedEvents.length === 0 && !loading && (
              <Typography color="text.secondary">No events yet — use Create event to add your first one.</Typography>
            )}
          </Stack>
        )}
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Box
          sx={{
            borderRadius: { xs: 3, md: 4 },
            p: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(99,102,241,0.1) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            Pending actions
          </Typography>
          <Stack component="ul" sx={{ m: 0, pl: 2.5, mt: 1.5 }} spacing={1}>
            {organizerDashboard.pendingActions.map((action) => (
              <Typography key={action} component="li" variant="body2" color="text.secondary">
                {action}
              </Typography>
            ))}
          </Stack>
        </Box>
      </ScrollRevealSection>
    </Stack>
  )
}

export default OrganizerDashboardPage
