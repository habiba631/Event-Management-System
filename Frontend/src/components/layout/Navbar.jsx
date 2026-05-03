import { AppBar, Avatar, Box, Button, Chip, Stack, Toolbar, Typography } from '@mui/material'
import { getInitials } from '../../utils/getInitials'
import { roleAvatarGradients } from '../../theme/appTheme'
import { SITE_NAME, SITE_TAGLINE } from '../../config/site'

function Navbar({ activePage, onNavigate, currentUser }) {
  const navItems = [
    { key: 'hero', label: 'Home' },
    { key: 'events', label: 'Events' },
    { key: 'contact', label: 'Contact' },
    { key: 'auth', label: currentUser ? 'Account' : 'Login' },
    ...(currentUser ? [{ key: 'dashboard', label: 'My dashboard' }] : []),
  ]

  const isDashboardActive =
    activePage === 'customer' || activePage === 'organizer' || activePage === 'admin'

  const avatarBg =
    currentUser && roleAvatarGradients[currentUser.role]
      ? roleAvatarGradients[currentUser.role]
      : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'

  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.82) 100%)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <Toolbar sx={{ flexWrap: 'wrap', gap: 2, px: { xs: 2, md: 3 }, py: 2, alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1, minWidth: 200 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(92deg, #1e3a5f 0%, #4f46e5 40%, #0d9488 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {SITE_NAME}
            </Typography>
            <Chip
              label="Egypt"
              size="small"
              sx={{
                height: 22,
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: 'rgba(217, 119, 6, 0.12)',
                color: 'warning.dark',
                border: '1px solid rgba(217, 119, 6, 0.35)',
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35 }}>
            {SITE_TAGLINE}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            order: { xs: 3, md: 2 },
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {navItems.map((item) => {
            const isActive =
              item.key === 'dashboard' ? isDashboardActive : activePage === item.key
            return (
              <Button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                variant="text"
                sx={{
                  borderRadius: 999,
                  px: 2,
                  py: 0.75,
                  fontWeight: 600,
                  color: isActive ? 'common.white' : 'text.secondary',
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  boxShadow: isActive ? '0 10px 28px rgba(79, 70, 229, 0.32)' : 'none',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'rgba(79, 70, 229, 0.08)',
                    color: isActive ? 'common.white' : 'text.primary',
                  },
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ order: { xs: 2, md: 3 } }}>
          {currentUser ? (
            <>
              <Avatar
                alt={currentUser.name}
                sx={{
                  width: 44,
                  height: 44,
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: 'common.white',
                  background: avatarBg,
                  boxShadow: '0 8px 22px rgba(15, 23, 42, 0.12)',
                  border: '2px solid rgba(255,255,255,0.95)',
                }}
              >
                {getInitials(currentUser.name)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                  {currentUser.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {currentUser.role}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: 'rgba(148, 163, 184, 0.28)',
                  color: 'text.secondary',
                  fontWeight: 700,
                  border: '2px dashed rgba(148, 163, 184, 0.55)',
                }}
              >
                ?
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Guest
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Sign in for your NextTicket
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
