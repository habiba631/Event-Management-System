import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Grid, Snackbar, Stack, Typography } from '@mui/material'
import ScrollRevealSection from '../components/layout/ScrollRevealSection'
import {
  OFFICE_ADDRESS,
  OFFICE_LABEL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
  SUPPORT_PHONE,
} from '../config/site'

const contactCards = [
  {
    title: 'Email',
    body: SUPPORT_EMAIL,
    hint: `We reply within one business day · ${SUPPORT_HOURS}`,
  },
  {
    title: 'Phone & WhatsApp',
    body: SUPPORT_PHONE,
    hint: 'Text us on WhatsApp for fastest help with bookings in Egypt.',
  },
  {
    title: OFFICE_LABEL,
    body: OFFICE_ADDRESS,
    hint: 'Visits by appointment — ask for directions to Nile City Towers lobby.',
  },
]

function ContactInfoPage() {
  const [snackOpen, setSnackOpen] = useState(false)

  return (
    <Stack spacing={4}>
      <ScrollRevealSection threshold={0.06} rootMargin="0px 0px 0px 0px">
        <Box
          sx={{
            borderRadius: { xs: 3, md: 4 },
            overflow: 'hidden',
            p: { xs: 3, md: 5 },
            color: 'common.white',
            background: 'linear-gradient(125deg, #0c4a6e 0%, #7c3aed 42%, #ea580c 100%)',
            boxShadow: '0 24px 70px rgba(12, 74, 110, 0.28)',
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.92, letterSpacing: '0.2em' }}>
            Contact {SITE_NAME}
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ mt: 1, fontSize: { xs: '1.75rem', md: '2.35rem' } }}>
            We’re based in Egypt — and built for Egyptian organizers & guests
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 640, opacity: 0.96, lineHeight: 1.65 }}>
            {SITE_DESCRIPTION}
          </Typography>
        </Box>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Grid container spacing={2.5}>
          {contactCards.map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.94)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="overline" color="primary" fontWeight={800}>
                    {item.title}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>
                    {item.body}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    {item.hint}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <Box
          sx={{
            borderRadius: { xs: 3, md: 4 },
            p: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(124,58,237,0.08) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.22)',
          }}
        >
          <Typography variant="h5" fontWeight={800}>
            Help center — Egypt
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720, lineHeight: 1.65 }}>
            Questions about InstaPay / Vodafone Cash payouts to hosts, VAT invoices for companies in Egypt, or
            verifying a venue in Cairo, Giza, or Alexandria? Include your event link and governorate — we route it to
            the right specialist.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => setSnackOpen(true)}>
            Open support form (demo)
          </Button>
        </Box>
      </ScrollRevealSection>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setSnackOpen(false)}>
          Support form would open here — this is a demo for {SITE_NAME}.
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default ContactInfoPage
