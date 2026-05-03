import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { SITE_NAME } from '../../config/site'
import { users } from '../../data/sampleData'

function AuthSwitcher({ onLogin, currentUser }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('customer')
  const isLogin = mode === 'login'

  const handleSubmit = (event) => {
    event.preventDefault()

    if (isLogin) {
      const foundUser = users.find((user) => user.email === email)
      if (foundUser) {
        onLogin(foundUser)
      }
      return
    }

    onLogin({
      id: 'mock-new',
      name: fullName || 'New User',
      role,
      email: email || 'newuser@email.com',
    })
  }

  return (
    <Card
      variant="outlined"
      sx={{
        border: '1px solid rgba(148, 163, 184, 0.28)',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.06)',
        background: 'rgba(255,255,255,0.96)',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={800}>
            {SITE_NAME} access
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Secure sign-in for guests and hosts across Egypt (demo mode).
          </Typography>
          {currentUser && (
            <Typography color="secondary.main" fontWeight={600}>
              Logged in as {currentUser.name} ({currentUser.role})
            </Typography>
          )}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, value) => value && setMode(value)}
            color="primary"
          >
            <ToggleButton value="login">Login</ToggleButton>
            <ToggleButton value="register">Register</ToggleButton>
          </ToggleButtonGroup>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 1.5 }}>
            {!isLogin && (
              <TextField
                label="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            )}
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {!isLogin && (
              <TextField
                select
                label="Role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="organizer">Event Organizer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            )}
            <Button type="submit" variant="contained">
              {isLogin ? 'Login' : 'Create Account'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default AuthSwitcher
