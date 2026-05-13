import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Box, Chip, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material'
import RegisterEventCard from '../components/cards/RegisterEventCard'
import ScrollRevealSection from '../components/layout/ScrollRevealSection'
import { API_BASE_URL } from '../config/api'

function mapEventForListing(doc) {
  const id = doc._id != null ? String(doc._id) : String(doc.id)
  const startsAt = doc.startsAt ? new Date(doc.startsAt) : null
  const seatsLeft =
    typeof doc.seatsLeft === 'number'
      ? doc.seatsLeft
      : Math.max(0, Number(doc.capacity ?? 0) - Number(doc.registrations ?? 0))

  return {
    ...doc,
    id,
    date: startsAt
      ? startsAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : '',
    seatsLeft,
    status: doc.status || 'draft',
  }
}

function EventsPage({ currentUser, onNavigate }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [bookedByEventId, setBookedByEventId] = useState(() => new Map())

  const userId = currentUser?._id != null ? String(currentUser._id) : ''

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/events`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load events')
      }

      const list = Array.isArray(data) ? data : []
      setEvents(list.map(mapEventForListing))
    } catch (err) {
      setLoadError(err.message)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMyBookings = useCallback(async () => {
    if (!userId) {
      setBookedByEventId(new Map())
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings?user=${encodeURIComponent(userId)}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load bookings')
      }
      const list = Array.isArray(data) ? data : []
      const next = new Map()
      for (const b of list) {
        const evId = b.event?._id != null ? String(b.event._id) : b.event != null ? String(b.event) : ''
        if (evId) {
          next.set(evId, b)
        }
      }
      setBookedByEventId(next)
    } catch {
      setBookedByEventId(new Map())
    }
  }, [userId])

  useEffect(() => {
    let cancelled = false

    async function load() {
      await loadEvents()
      if (cancelled) return
      await loadMyBookings()
    }

    load()
    return () => {
      cancelled = true
    }
  }, [loadEvents, loadMyBookings])

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [events])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((e) => {
      const catOk = category === 'all' || e.category === category
      const text = `${e.title} ${e.location} ${e.organizer}`.toLowerCase()
      const qOk = !q || text.includes(q)
      return catOk && qOk
    })
  }, [query, category, events])

  return (
    <Stack spacing={4}>
      <ScrollRevealSection threshold={0.06} rootMargin="0px 0px 0px 0px">
        <Box
          sx={{
            position: 'relative',
            borderRadius: { xs: 3, md: 4 },
            overflow: 'hidden',
            p: { xs: 3, md: 5 },
            color: 'common.white',
            background: 'linear-gradient(120deg, #312e81 0%, #4338ca 40%, #0d9488 100%)',
            boxShadow: '0 20px 60px rgba(49, 46, 129, 0.35)',
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: '0.2em' }}>
            NextTicket · Egypt calendar
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ mt: 1, fontSize: { xs: '1.75rem', md: '2.4rem' } }}>
            Find your next experience in Egypt
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 560, opacity: 0.95 }}>
            Cairo workshops, Alexandria meetups, Delta seminars, and online sessions on Egypt time — search by city or
            host, then book or join the waitlist in one tap.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }} alignItems={{ sm: 'center' }}>
            <TextField
              placeholder="Search Cairo, Alex, host, or title…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 280 },
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.95)',
                  borderRadius: 999,
                },
              }}
            />
          </Stack>
        </Box>
      </ScrollRevealSection>

      {loadError && (
        <Alert severity="error" onClose={() => setLoadError('')}>
          {loadError}
        </Alert>
      )}

      <ScrollRevealSection>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat === 'all' ? 'All' : cat}
              onClick={() => setCategory(cat)}
              color={category === cat ? 'primary' : 'default'}
              variant={category === cat ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700 }}
            />
          ))}
        </Stack>
      </ScrollRevealSection>

      <ScrollRevealSection>
        {loading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map((event) => (
              <Grid key={event.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <RegisterEventCard
                  event={event}
                  currentUser={currentUser}
                  onNavigate={onNavigate}
                  existingBooking={bookedByEventId.get(event.id) || null}
                  onBooked={async () => {
                    await loadEvents()
                    await loadMyBookings()
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
        {!loading && filtered.length === 0 && (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No events match your filters — try another city, host, or category.
          </Typography>
        )}
      </ScrollRevealSection>
    </Stack>
  )
}

export default EventsPage
