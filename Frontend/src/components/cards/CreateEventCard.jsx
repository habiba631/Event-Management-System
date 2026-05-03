import { useState } from 'react'
import { Alert, Button, Card, CardContent, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { SITE_NAME } from '../../config/site'

function CreateEventCard() {
  const [snack, setSnack] = useState({ open: false, message: '' })

  return (
    <>
      <Card sx={{ border: 'none', background: 'linear-gradient(160deg, rgba(16,185,129,0.12) 0%, rgba(255,255,255,0.95) 60%)' }}>
        <CardContent>
          <Stack
            spacing={1.5}
            component="form"
            onSubmit={(event) => {
              event.preventDefault()
              setSnack({ open: true, message: `${SITE_NAME}: event draft saved — publish when you’re ready (demo).` })
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              Create event
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick draft — add details and go live when you are ready.
            </Typography>
            <TextField label="Event title" name="title" size="small" required />
            <TextField type="date" name="date" size="small" label="Date" InputLabelProps={{ shrink: true }} />
            <Button type="submit" variant="contained" color="secondary">
              Save draft
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ open: false, message: '' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSnack({ open: false, message: '' })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default CreateEventCard
