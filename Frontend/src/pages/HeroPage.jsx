import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Snackbar,
  Alert,
  Stack,
  Typography,
} from '@mui/material'
import ScrollRevealSection from '../components/layout/ScrollRevealSection'
import { SITE_DESCRIPTION, SITE_NAME } from '../config/site'
import { events } from '../data/sampleData'

const statAccents = [
  { value: '48+', label: 'Events live across Egypt', tint: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
  { value: '320+', label: 'Guests & professionals', tint: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)' },
  { value: '16', label: 'Verified Egyptian hosts', tint: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
  { value: '4.8', label: 'Average experience rating', tint: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
]

const eventTints = [
  'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
  'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(34,211,238,0.08) 100%)',
  'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(236,72,153,0.06) 100%)',
]

function HeroPage({ onNavigate }) {
  const featuredEvents = events.slice(0, 3)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity })
  }

  const handleReserveOrWaitlist = (event) => {
    if (event.status === 'open') {
      showSnack(`Spot reserved on ${SITE_NAME} for “${event.title}” — check your inbox (demo).`)
    } else if (event.status === 'full') {
      showSnack(`Waitlist joined on ${SITE_NAME} for “${event.title}” — we’ll notify you in Egypt time (demo).`)
    } else {
      showSnack(`“${event.title}” has ended — discover what’s on in Cairo & beyond on Events.`, 'info')
    }
  }

  return (
    <Stack spacing={{ xs: 5, md: 7 }}>
      <ScrollRevealSection threshold={0.08} rootMargin="0px 0px 0px 0px">
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: { xs: 3, md: 4 },
            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.18)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(125deg, #1e1b4b 0%, #312e81 28%, #4338ca 55%, #0f766e 100%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 420,
              height: 420,
              borderRadius: '50%',
              top: '-18%',
              right: '-8%',
              background: 'radial-gradient(circle, rgba(244,114,182,0.45) 0%, transparent 70%)',
              filter: 'blur(2px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 320,
              height: 320,
              borderRadius: '50%',
              bottom: '-25%',
              left: '-5%',
              background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, transparent 70%)',
            }}
          />
          <Box sx={{ position: 'relative', p: { xs: 3, md: 6 }, color: 'common.white' }}>
            <Stack spacing={2.5} alignItems="flex-start">
              <Chip
                label={`${SITE_NAME} · Built for Egypt`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.14)',
                  color: 'common.white',
                  border: '1px solid rgba(255,255,255,0.22)',
                  fontWeight: 600,
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.1rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  maxWidth: 720,
                  textShadow: '0 12px 40px rgba(0,0,0,0.25)',
                }}
              >
                Egypt’s next workshop, meetup, or night out — one ticket away
              </Typography>
              <Typography sx={{ maxWidth: 640, opacity: 0.92, fontSize: '1.05rem', lineHeight: 1.65 }}>
                {SITE_DESCRIPTION}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{ px: 3 }}
                  onClick={() => onNavigate?.('events')}
                >
                  Browse Egypt events
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 3,
                    borderColor: 'rgba(255,255,255,0.55)',
                    color: 'common.white',
                    '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                  onClick={() => onNavigate?.('auth')}
                >
                  Host on NextTicket
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Grid container spacing={2}>
          {statAccents.map((stat) => (
            <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.88)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.1)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 6,
                      borderRadius: 999,
                      mb: 1.5,
                      background: stat.tint,
                    }}
                  />
                  <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h4" fontWeight={800}>
            Featured in Egypt this week
          </Typography>
          <Button variant="text" color="primary" onClick={() => onNavigate?.('events')} sx={{ fontWeight: 700 }}>
            See full calendar →
          </Button>
        </Stack>
        <Grid container spacing={2.5}>
          {featuredEvents.map((event, index) => (
            <Grid key={event.id} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  border: 'none',
                  background: eventTints[index % eventTints.length],
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 24px 48px rgba(79, 70, 229, 0.15)',
                  },
                }}
              >
                <Box sx={{ height: 6, background: statAccents[index % statAccents.length].tint }} />
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Typography variant="h6" fontWeight={800}>
                        {event.title}
                      </Typography>
                      <Chip label={event.category} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {event.date} · {event.location}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hosted by <strong>{event.organizer}</strong>
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                      onClick={() => handleReserveOrWaitlist(event)}
                    >
                      {event.status === 'open'
                        ? 'Reserve a spot'
                        : event.status === 'full'
                          ? 'Join waitlist'
                          : 'View recap'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Box
          sx={{
            position: 'relative',
            borderRadius: { xs: 3, md: 4 },
            overflow: 'hidden',
            p: { xs: 3, md: 5 },
            color: 'common.white',
            background: 'linear-gradient(110deg, #0f766e 0%, #0ea5e9 45%, #6366f1 100%)',
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: '0.2em' }}>
            For Egyptian organizers
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1, maxWidth: 640 }}>
            Fill venues in Cairo, Giza, Alexandria — without drowning in spreadsheets
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 560, opacity: 0.95 }}>
            Publish bilingual listings, track registrations in EGP-friendly flows, and keep your lineup organized for
            Ramadan seasons, Cairene tech weeks, and Red Sea getaways — all in one calm workspace on {SITE_NAME}.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 3 }}
            onClick={() => onNavigate?.('auth')}
          >
            List your first event
          </Button>
        </Box>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Box
          sx={{
            borderRadius: { xs: 3, md: 4 },
            overflow: 'hidden',
            p: { xs: 3, md: 5 },
            background:
              'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(236,72,153,0.1) 50%, rgba(14,165,233,0.12) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
          }}
        >
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.18em' }}>
            For guests in Egypt
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1, maxWidth: 640 }}>
            From Zamalek rooftops to Alex corniche walks — book with confidence
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 560 }}>
            Save your spot, get reminders in local time, and leave reviews that help the community find trusted hosts
            across governorates.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
            <Button variant="contained" size="large" onClick={() => onNavigate?.('events')}>
              Explore Egypt events
            </Button>
            <Button variant="outlined" size="large" onClick={() => onNavigate?.('contact')}>
              Cairo support team
            </Button>
          </Stack>
        </Box>
      </ScrollRevealSection>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default HeroPage