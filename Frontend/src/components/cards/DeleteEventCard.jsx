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

function DeleteEventCard({ managedEvents = [], onDeleted }) {
  const [selectedId, setSelectedId] = useState(managedEvents[0]?.id || '')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!managedEvents.length) {
      setSelectedId('')
      return
    }
    setSelectedId((prev) => (managedEvents.some((e) => e.id === prev) ? prev : managedEvents[0].id))
  }, [managedEvents])
  const [errorMessage, setErrorMessage] = useState('')
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' })

  const selected = managedEvents.find((e) => e.id === selectedId)
  const eventTitle = selected?.title || 'Selected event'

  const handleDelete = async () => {
    if (!selectedId) return
    setErrorMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${selectedId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete event')
      }

      setSnack({
        open: true,
        severity: 'success',
        message: `${SITE_NAME}: “${eventTitle}” was removed from listings.`,
      })
      onDeleted?.()
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card sx={{ border: 'none', background: 'linear-gradient(160deg, rgba(244,63,94,0.12) 0%, rgba(255,255,255,0.95) 60%)' }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={800}>
              Delete event
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Permanently removes the event from the server for your account.
            </Typography>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {managedEvents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No events yet — create one first.
              </Typography>
            ) : (
              <TextField select label="Event" size="small" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {managedEvents.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.title}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <Button type="button" color="error" variant="contained" disabled={isLoading || !selectedId} onClick={handleDelete}>
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete event'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ open: false, message: '', severity: 'info' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack({ open: false, message: '', severity: 'info' })}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default DeleteEventCard
