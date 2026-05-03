import { useState } from 'react'
import { Alert, Button, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material'
import { SITE_NAME } from '../../config/site'

function DeleteEventCard({ eventTitle = 'Selected Event' }) {
  const [snack, setSnack] = useState({ open: false, message: '' })

  return (
    <>
      <Card sx={{ border: 'none', background: 'linear-gradient(160deg, rgba(244,63,94,0.12) 0%, rgba(255,255,255,0.95) 60%)' }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={800}>
              Delete event
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This removes <strong>{eventTitle}</strong> from public listings (demo only).
            </Typography>
            <Button
              type="button"
              color="error"
              variant="contained"
              onClick={() =>
                setSnack({ open: true, message: `${SITE_NAME}: “${eventTitle}” was removed from listings (demo).` })
              }
            >
              Delete event
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ open: false, message: '' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setSnack({ open: false, message: '' })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default DeleteEventCard
