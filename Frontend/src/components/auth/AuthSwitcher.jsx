import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { SITE_NAME } from '../../config/site'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function AuthSwitcher({ onLogin, currentUser }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [city, setCity] = useState('')
  const [role, setRole] = useState('Customer')
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const isLogin = mode === 'login'
  const isOrganizer = role === 'EventOrganizer'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      if (isLogin) {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Login failed')
        }

        onLogin({
          ...data.user,
          name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.username,
        })
        return
      }

      const payload = {
        username,
        firstName,
        lastName,
        birthDate: birthDate || undefined,
        email,
        password,
        city,
        role,
      }

      if (isOrganizer) {
        payload.organizerProfile = {
          companyName,
          companyAddress,
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }

      onLogin({
        ...data.user,
        name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.username,
      })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
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
            Secure sign-in for guests and hosts across Egypt.
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
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {!isLogin && (
              <>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
                <TextField
                  label="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
                <TextField
                  label="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
                <TextField
                  label="Birth date"
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="City"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </>
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
                <MenuItem value="Customer">Customer</MenuItem>
                <MenuItem value="EventOrganizer">Event Organizer</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </TextField>
            )}
            {!isLogin && isOrganizer && (
              <>
                <TextField
                  label="Company name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  required
                />
                <TextField
                  label="Company address"
                  value={companyAddress}
                  onChange={(event) => setCompanyAddress(event.target.value)}
                  required
                />
              </>
            )}
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} color="inherit" /> : isLogin ? 'Login' : 'Create Account'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
export default AuthSwitcher