import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
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
import { SITE_NAME } from '../../config/site'

function RegisterEventCard({ event }) {
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

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleChange = (field) => (eventValue) => {
    const value = eventValue?.target ? eventValue.target.value : eventValue
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (eventObj) => {
    eventObj.preventDefault()
    if (isOpen) {
      setSnack({
        open: true,
        severity: 'success',
        message: `${SITE_NAME}: booking confirmed for ${formData.fullName || 'guest'} on “${event.title}” (demo).`,
      })
    } else if (isFull) {
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

  const label = isOpen ? 'Reserve a spot' : isFull ? 'Join waitlist' : 'Leave review'
  const dialogTitle = isOpen ? 'Book Event' : isFull ? 'Join Waitlist' : 'Leave a Review'

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
              <Chip label={event.status} color={isOpen ? 'success' : isFull ? 'info' : 'default'} size="small" />
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

            {isOpen && (
              <>
                <TextField
                  label="Tickets"
                  type="number"
                  inputProps={{ min: 1, max: 10 }}
                  value={formData.tickets}
                  onChange={handleChange('tickets')}
                  required
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
              <TextField
                label="Anything we should know? (optional)"
                multiline
                minRows={2}
                value={formData.note}
                onChange={handleChange('note')}
              />
            )}

            {isCompleted && (
              <>
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
            <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
              {SITE_NAME} · Egypt — demo only, no real charges or payouts.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} variant="text">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {isOpen ? 'Confirm Booking' : isFull ? 'Join Waitlist' : 'Submit Review'}
            </Button>
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
