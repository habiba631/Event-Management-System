import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { API_BASE_URL } from '../../config/api'
import { SITE_NAME } from '../../config/site'

function RegisterEventCard({ event, currentUser, onNavigate, existingBooking, onBooked }) {
  const isOpen = event.status === 'open'
  const isFull = event.status === 'full'
  const isCompleted = event.status === 'completed'
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    tickets: '1',
    note: '',
    rating: 4,
    review: '',
  })
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const [bookingLoading, setBookingLoading] = useState(false)

  const userId = currentUser?._id != null ? String(currentUser._id) : ''
  const seatsLeftNum = Math.max(0, Number(event.seatsLeft) || 0)
  const maxTickets = Math.min(10, seatsLeftNum)
  const hasActiveBooking =
    existingBooking && (existingBooking.status === 'confirmed' || existingBooking.status === 'pending')
  const canRebookAfterCancel = existingBooking && existingBooking.status === 'cancelled'

  const handleOpenDialog = () => {
    const cap = Math.max(1, maxTickets)
    setFormData((prev) => ({
      ...prev,
      tickets: String(Math.min(Math.max(1, Number(prev.tickets) || 1), cap)),
    }))
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleChange = (field) => (eventValue) => {
    const value = eventValue?.target ? eventValue.target.value : eventValue
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity })
  }

  const handleApiBookOrRebook = async () => {
    setBookingLoading(true)
    try {
      if (canRebookAfterCancel && existingBooking._id) {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${existingBooking._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'confirmed',
            notes: formData.note || '',
          }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data.message || 'Could not restore booking')
        }
        showSnack(`You’re back in for “${event.title}”.`)
        await onBooked?.()
        setDialogOpen(false)
        return
      }

      const n = Math.min(maxTickets, Math.max(1, parseInt(String(formData.tickets), 10) || 1))
      if (maxTickets < 1 || n > seatsLeftNum) {
        showSnack('Not enough seats left for this event.', 'error')
        setBookingLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userId,
          event: event.id,
          ticketCount: n,
          status: 'confirmed',
          notes: formData.note || '',
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || 'Booking failed')
      }
      showSnack(`Booking confirmed for “${event.title}”.`)
      await onBooked?.()
      setDialogOpen(false)
    } catch (err) {
      showSnack(err.message || 'Something went wrong', 'error')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!existingBooking?._id) return
    setBookingLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${existingBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || 'Could not cancel booking')
      }
      showSnack('Booking cancelled. You can book again if seats open up.', 'info')
      await onBooked?.()
      setDialogOpen(false)
    } catch (err) {
      showSnack(err.message || 'Cancel failed', 'error')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleSubmit = (eventObj) => {
    eventObj.preventDefault()
    if (isOpen) {
      if (!userId) {
        return
      }
      void handleApiBookOrRebook()
      return
    }
    if (isFull) {
      setSnack({
        open: true,
        severity: 'info',
        message: `${SITE_NAME}: ${formData.fullName || 'You'} joined the waitlist for “${event.title}” (demo).`,
      })
    } else {
      setSnack({
        open: true,
        severity: 'success',
        message: `${SITE_NAME}: thanks for your ${formData.rating}-star review on “${event.title}” (demo).`,
      })
    }
    setDialogOpen(false)
  }

  const label = isOpen
    ? hasActiveBooking
      ? 'View booking'
      : 'Reserve a spot'
    : isFull
      ? 'Join waitlist'
      : 'Leave review'
  const dialogTitle = isOpen
    ? hasActiveBooking
      ? 'Your booking'
      : 'Book event'
    : isFull
      ? 'Join Waitlist'
      : 'Leave a Review'

  return (
    <>
      <Card
        sx={{
          height: '100%',
          border: 'none',
          background:
            isOpen
              ? 'linear-gradient(160deg, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0.95) 55%)'
              : isFull
                ? 'linear-gradient(160deg, rgba(14,165,233,0.1) 0%, rgba(255,255,255,0.95) 55%)'
                : 'linear-gradient(160deg, rgba(148,163,184,0.15) 0%, rgba(255,255,255,0.95) 55%)',
        }}
      >
        <Box sx={{ height: 5, background: isOpen ? 'success.main' : isFull ? 'info.main' : 'grey.400' }} />
        <CardContent>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={800}>
                {event.title}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip label={event.status} color={isOpen ? 'success' : isFull ? 'info' : 'default'} size="small" />
                {hasActiveBooking && (
                  <Chip label="Booked" color="secondary" size="small" variant="outlined" />
                )}
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {event.category}
            </Typography>
            <Typography variant="body2">
              <strong>Date:</strong> {event.date}
            </Typography>
            <Typography variant="body2">
              <strong>Location:</strong> {event.location}
            </Typography>
            <Typography variant="body2">
              <strong>Seats left:</strong> {event.seatsLeft}
            </Typography>
            <Typography variant="body2">
              <strong>Organizer:</strong> {event.organizer}
            </Typography>
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button variant="contained" fullWidth onClick={handleOpenDialog}>
            {label}
          </Button>
        </CardActions>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'grid', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Event: {event.title}
            </Typography>

            {isOpen && !userId && (
              <Alert severity="info">
                Sign in with your NextTicket account to book this event. Your booking is tied to your profile.
              </Alert>
            )}

            {isOpen && userId && hasActiveBooking && (
              <>
                <Alert severity="success">
                  Status: <strong>{existingBooking.status}</strong>
                  {existingBooking.ticketCount != null && (
                    <>
                      {' '}
                      · Tickets: <strong>{existingBooking.ticketCount}</strong>
                    </>
                  )}
                </Alert>
                {existingBooking.notes ? (
                  <Typography variant="body2" color="text.secondary">
                    Your note: {existingBooking.notes}
                  </Typography>
                ) : null}
              </>
            )}

            {isOpen && userId && canRebookAfterCancel && (
              <>
                <Alert severity="warning">
                  This booking was cancelled. You can confirm again with the same number of tickets (
                  {existingBooking.ticketCount ?? 1}) if seats are available.
                </Alert>
                <TextField
                  label="Note to organizer (optional)"
                  multiline
                  minRows={2}
                  value={formData.note}
                  onChange={handleChange('note')}
                />
              </>
            )}

            {isOpen && userId && !existingBooking && (
              <>
                <TextField
                  label="Tickets"
                  type="number"
                  inputProps={{ min: 1, max: Math.max(1, maxTickets) }}
                  value={formData.tickets}
                  onChange={handleChange('tickets')}
                  required
                  helperText={maxTickets < 1 ? 'No seats available.' : `Up to ${maxTickets} for this event.`}
                />
                <TextField
                  label="Note to organizer (optional)"
                  multiline
                  minRows={2}
                  value={formData.note}
                  onChange={handleChange('note')}
                />
              </>
            )}

            {isFull && (
              <>
                <TextField
                  label="Full name"
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                />
                <TextField
                  label="Anything we should know? (optional)"
                  multiline
                  minRows={2}
                  value={formData.note}
                  onChange={handleChange('note')}
                />
              </>
            )}

            {isCompleted && (
              <>
                <TextField
                  label="Full name"
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Rating</Typography>
                  <Rating
                    value={Number(formData.rating)}
                    onChange={(_, value) => handleChange('rating')(value || 1)}
                  />
                </Stack>
                <TextField
                  label="Write your review"
                  multiline
                  minRows={3}
                  value={formData.review}
                  onChange={handleChange('review')}
                  required
                />
              </>
            )}
            {!isOpen && (
              <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
                {SITE_NAME} · Egypt — waitlist and reviews here are demo only.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Button onClick={handleCloseDialog} variant="text">
              Close
            </Button>
            {isOpen && !userId && (
              <Button
                variant="contained"
                onClick={() => {
                  onNavigate?.('auth')
                  handleCloseDialog()
                }}
              >
                Sign in to book
              </Button>
            )}
            {isOpen && userId && hasActiveBooking && (
              <Button
                variant="outlined"
                color="error"
                disabled={bookingLoading}
                onClick={() => void handleCancelBooking()}
              >
                {bookingLoading ? <CircularProgress size={20} /> : 'Cancel booking'}
              </Button>
            )}
            {isOpen && userId && canRebookAfterCancel && (
              <Button type="submit" variant="contained" disabled={bookingLoading || seatsLeftNum < 1}>
                {bookingLoading ? <CircularProgress size={20} color="inherit" /> : 'Book again'}
              </Button>
            )}
            {isOpen && userId && !existingBooking && (
              <Button type="submit" variant="contained" disabled={bookingLoading || maxTickets < 1}>
                {bookingLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm booking'}
              </Button>
            )}
            {!isOpen && (
              <Button type="submit" variant="contained">
                {isFull ? 'Join Waitlist' : 'Submit Review'}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>

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
    </>
  )
}

export default RegisterEventCard
