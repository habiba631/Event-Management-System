import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import ScrollRevealSection from '../components/layout/ScrollRevealSection'
import { adminDashboard, users } from '../data/sampleData'

const statLabels = {
  totalUsers: 'Total users',
  totalEvents: 'Total events',
  activeOrganizers: 'Active organizers',
  pendingReports: 'Pending reports',
}

function AdminDashboardPage({ currentUser }) {
  return (
    <Stack spacing={4}>
      <ScrollRevealSection threshold={0.06} rootMargin="0px 0px 0px 0px">
        <Box
          sx={{
            borderRadius: { xs: 3, md: 4 },
            p: { xs: 3, md: 5 },
            color: 'common.white',
            background: 'linear-gradient(120deg, #0f172a 0%, #4338ca 50%, #be123c 100%)',
            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.4)',
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: '0.18em' }}>
            NextTicket · Admin control
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
            Egypt marketplace pulse — hi {currentUser?.name?.split(' ')[0] || 'admin'}
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 640, opacity: 0.95 }}>
            Health metrics, people directory, and moderation tuned for Egyptian governorates, duplicate listings on the
            corniche, and payout anomalies.
          </Typography>
        </Box>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Grid container spacing={2}>
          {Object.entries(adminDashboard.stats).map(([key, value]) => (
            <Grid key={key} size={{ xs: 6, md: 3 }}>
              <Card sx={{ border: 'none', height: '100%', background: 'rgba(255,255,255,0.95)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {statLabels[key] || key}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          System users
        </Typography>
        <Stack spacing={1.5}>
          {users.map((user) => (
            <Card key={user.id} sx={{ border: 'none', background: 'rgba(248,250,252,0.95)' }}>
              <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}>
                  <Stack spacing={0.25}>
                    <Typography fontWeight={700}>{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Stack>
                  <Chip label={user.role} size="small" color="primary" variant="outlined" sx={{ textTransform: 'capitalize', width: 'fit-content' }} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Flagged items
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          {adminDashboard.flaggedItems.map((item) => (
            <Chip key={item} label={item} color="warning" variant="filled" sx={{ fontWeight: 600 }} />
          ))}
        </Stack>
      </ScrollRevealSection>
    </Stack>
  )
}

export default AdminDashboardPage
