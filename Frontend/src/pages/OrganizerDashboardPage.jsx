import { Box, Card, CardContent, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import CreateEventCard from '../components/cards/CreateEventCard'
import DeleteEventCard from '../components/cards/DeleteEventCard'
import ScrollRevealSection from '../components/layout/ScrollRevealSection'
import { organizerDashboard } from '../data/sampleData'

function OrganizerDashboardPage({ currentUser }) {
  const featuredEvent = organizerDashboard.managedEvents[0]?.title

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

      <ScrollRevealSection>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CreateEventCard />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DeleteEventCard eventTitle={featuredEvent} />
          </Grid>
        </Grid>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Managed events
        </Typography>
        <Stack spacing={2}>
          {organizerDashboard.managedEvents.map((event) => {
            const pct = Math.min(100, Math.round((event.registrations / event.capacity) * 100))
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
        </Stack>
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
