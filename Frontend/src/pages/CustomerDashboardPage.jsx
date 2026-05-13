import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Rating,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import ScrollRevealSection from '../components/layout/ScrollRevealSection'
import { API_BASE_URL } from '../config/api'
import { customerDashboard } from '../data/sampleData'

function formatEventDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function CustomerDashboardPage({ currentUser }) {
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState('')

  const userId = currentUser?._id != null ? String(currentUser._id) : ''

  const loadBookings = useCallback(async () => {
    if (!userId) {
      setBookings([])
      setBookingsLoading(false)
      return
    }
    setBookingsLoading(true)
    setBookingsError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings?user=${encodeURIComponent(userId)}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Could not load bookings')
      }
      setBookings(Array.isArray(data) ? data : [])
    } catch (e) {
      setBookingsError(e.message)
      setBookings([])
    } finally {
      setBookingsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || 'Cancel failed')
      }
      setSnack({ open: true, message: 'Booking cancelled.', severity: 'success' })
      await loadBookings()
    } catch (e) {
      setSnack({ open: true, message: e.message || 'Cancel failed', severity: 'error' })
    }
  }

  const upcomingBookings = bookings.filter((b) => {
    const starts = b.event?.startsAt ? new Date(b.event.startsAt) : null
    if (!starts || Number.isNaN(starts.getTime())) return true
    return starts.getTime() >= Date.now() - 24 * 60 * 60 * 1000
  })

  const pastBookings = bookings.filter((b) => {
    const starts = b.event?.startsAt ? new Date(b.event.startsAt) : null
    if (!starts || Number.isNaN(starts.getTime())) return false
    return starts.getTime() < Date.now() - 24 * 60 * 60 * 1000
  })

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
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
          <Typography variant="h5" fontWeight={800}>
            Your bookings
          </Typography>
          <Button size="small" variant="outlined" onClick={() => void loadBookings()} disabled={bookingsLoading}>
            Refresh
          </Button>
        </Stack>
        {bookingsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {bookingsError}
          </Alert>
        )}
        {bookingsLoading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress />
          </Stack>
        ) : bookings.length === 0 ? (
          <Typography color="text.secondary">
            No bookings yet — open Events in the menu and reserve a spot.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {upcomingBookings.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                  Upcoming &amp; current
                </Typography>
                <Grid container spacing={2}>
                  {upcomingBookings.map((b) => {
                    const title = b.event?.title || 'Event'
                    const when = formatEventDate(b.event?.startsAt)
                    const bid = b._id != null ? String(b._id) : ''
                    return (
                      <Grid key={bid} size={{ xs: 12, md: 6 }}>
                        <Card sx={{ border: 'none', height: '100%', background: 'rgba(255,255,255,0.95)' }}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography fontWeight={800}>{title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {when}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Status: <strong>{b.status}</strong>
                              {b.ticketCount != null ? (
                                <>
                                  {' '}
                                  · Tickets: <strong>{b.ticketCount}</strong>
                                </>
                              ) : null}
                            </Typography>
                            {b.status === 'confirmed' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                sx={{ mt: 2 }}
                                onClick={() => void handleCancelBooking(bid)}
                              >
                                Cancel booking
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            )}
            {pastBookings.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                  Past
                </Typography>
                <Stack spacing={2}>
                  {pastBookings.map((b) => {
                    const title = b.event?.title || 'Event'
                    const when = formatEventDate(b.event?.startsAt)
                    const bid = b._id != null ? String(b._id) : ''
                    return (
                      <Card key={bid} sx={{ border: 'none', background: 'rgba(248,250,252,0.95)' }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography fontWeight={800}>{title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {when} · {b.status}
                          </Typography>
                        </CardContent>
                      </Card>
                    )
                  })}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Past experiences (demo)
        </Typography>
        <Stack spacing={2}>
          {customerDashboard.pastRegistrations.map((item) => (
            <Card key={item.id} sx={{ border: 'none', background: 'rgba(248,250,252,0.95)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ sm: 'center' }}
                    spacing={1}
                  >
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
                        onClick={() =>
                          setSnack({ open: true, message: 'Thanks! Your review was submitted (demo).' })
                        }
                      >
                        Leave review
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          setSnack({
                            open: true,
                            message: 'Rating updated — organizers will see it shortly (demo).',
                            severity: 'success',
                          })
                        }
                      >
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

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert variant="filled" severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default CustomerDashboardPage
