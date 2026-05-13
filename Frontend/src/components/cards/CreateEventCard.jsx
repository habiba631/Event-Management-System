import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { SITE_NAME } from '../../config/site'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function CreateEventCard({ currentUser, onEventCreated }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [location, setLocation] = useState('')
  const [city, setCity] = useState(currentUser?.city || '')
  const [country, setCountry] = useState(currentUser?.country || '')
  const [capacity, setCapacity] = useState('50')
  const [status, setStatus] = useState('draft')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    setCity(currentUser?.city || '')
    setCountry(currentUser?.country || '')
  }, [currentUser?.city, currentUser?.country])

  const organizerLabel =
    currentUser?.organizerProfile?.companyName ||
    currentUser?.name ||
    currentUser?.username ||
    'Organizer'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const organizerUserId = currentUser?._id
      if (!organizerUserId) {
        throw new Error('Missing organizer account id — please log out and sign in again.')
      }

      const payload = {
        title: title.trim(),
        category: category.trim(),
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        location: location.trim(),
        city: city.trim(),
        country: country.trim(),
        organizer: organizerLabel,
        organizerUser: organizerUserId,
        capacity: Number(capacity),
        status,
        description: description.trim(),
        registrations: 0,
        imageUrl: '',
      }

      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event')
      }

      setSnack({
        open: true,
        severity: 'success',
        message: `${SITE_NAME}: “${data.title || title}” saved (id: ${String(data._id).slice(0, 8)}…).`,
      })
      setTitle('')
      setCategory('')
      setStartsAt('')
      setEndsAt('')
      setLocation('')
      setDescription('')
      onEventCreated?.()
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card sx={{ border: 'none', background: 'linear-gradient(160deg, rgba(16,185,129,0.12) 0%, rgba(255,255,255,0.95) 60%)' }}>
        <CardContent>
          <Stack spacing={1.5} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" fontWeight={800}>
              Create event
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creates a real event on the server and links it to your organizer id.
            </Typography>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField label="Event title" size="small" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <TextField label="Category" size="small" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <TextField
              label="Starts"
              type="datetime-local"
              size="small"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Ends (optional)"
              type="datetime-local"
              size="small"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField label="Location" size="small" value={location} onChange={(e) => setLocation(e.target.value)} required />
            <TextField label="City" size="small" value={city} onChange={(e) => setCity(e.target.value)} />
            <TextField label="Country" size="small" value={country} onChange={(e) => setCountry(e.target.value)} />
            <TextField
              label="Capacity"
              type="number"
              size="small"
              inputProps={{ min: 1 }}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
            <TextField select label="Status" size="small" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="full">Full</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            <TextField label="Description" size="small" multiline minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button type="submit" variant="contained" color="secondary" disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Save to server'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default CreateEventCard
