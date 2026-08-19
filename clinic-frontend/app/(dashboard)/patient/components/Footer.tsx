'use client';
import React from 'react';
import { Box, Container, Typography, TextField, Button, Stack, Grid, IconButton } from '@mui/material';
import {
  ArrowForwardOutlined,
  FavoriteOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  MailOutlined,
  Facebook,
  LinkedIn,
  Instagram,
  YouTube,
} from '@mui/icons-material';

export default function Footer() {
  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#F5F3FF',
        backgroundImage: `url('https://html.vikinglab.agency/medicax/assets/img/all-images/bg/bg3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'bottom center',
        backgroundRepeat: 'no-repeat',
        pt: { xs: 8, md: 10 },
        pb: 4,
        mt: 0,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Left Column: Brand & Newsletter */}
          <Grid item xs={12} md={4.5} size={{xs:12,sm:4,md:4.5}}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <Box sx={{ p: 0.8, bgcolor: '#4F46E5', borderRadius: '12px', color: '#FFF', display: 'flex' }}>
                <FavoriteOutlined fontSize="small" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E1B4B', letterSpacing: '-0.5px' }}>
                Medi<span style={{ color: '#4F46E5' }}>Pulse</span>
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: '#64748B', mb: 3.5, maxWidth: '380px', lineHeight: 1.2, fontSize: '20px' }}>
              Our mission is simple yet profound: to empower individuals and families in our community to live healthier, happier lives.
            </Typography>

            {/* Pill Newsletter Input */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#FFFFFF',
                p: 0.8,
                pl: 2.5,
                borderRadius: '50px',
                border: '1px solid #E0E7FF',
                maxWidth: '420px',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.05)',
              }}
            >
              <TextField
                fullWidth
                placeholder="Enter Your Email"
                variant="standard"
                slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.9rem', color: '#1E1B4B' } } }}
              />
              <Button
                variant="contained"
                disableElevation
                endIcon={
                  <Box sx={{ p: 0.4, bgcolor: '#FFF', borderRadius: '50%', color: '#4F46E5', display: 'flex' }}>
                    <ArrowForwardOutlined sx={{ fontSize: 12 }} />
                  </Box>
                }
                sx={{
                  bgcolor: '#4F46E5',
                  '&:hover': { bgcolor: '#4338CA' },
                  borderRadius: '50px',
                  px: 5,
                  py: 1.2,
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                Subscribe Now
              </Button>
            </Box>
          </Grid>

          {/* Column 2: Quick Links */}
          <Grid item xs={6} sm={4} md={2.2} size={{xs:6,sm:4,md:2.2}}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 2.5, fontSize: '1.2rem' }}>
              Quick Links
            </Typography>
            <Stack spacing={1.5} sx={{ '& a': { color: '#64748B', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, transition: '0.2s', '&:hover': { color: '#4F46E5' } } }}>
              <a href="#">About Us</a>
              <a href="#">Our Services</a>
              <a href="#">Our Team</a>
              <a href="#">Pricing Plan</a>
              <a href="#">Contact Us</a>
            </Stack>
          </Grid>

          {/* Column 3: Popular Service */}
          <Grid item xs={6} sm={4} md={2.3} size={{xs:6,sm:4,md:2.3}}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 2.5, fontSize: '1.2rem' }}>
              Popular Service
            </Typography>
            <Stack spacing={1.5} sx={{ '& a': { color: '#64748B', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, transition: '0.2s', '&:hover': { color: '#4F46E5' } } }}>
              <a href="#">Cardiology</a>
              <a href="#">Pediatrics</a>
              <a href="#">Gynaecology</a>
              <a href="#">Dermatology</a>
              <a href="#">Orthopedics</a>
              <a href="#">Psychology</a>
              <a href="#">Neurology</a>
            </Stack>
          </Grid>

          {/* Column 4: Contact Us */}
          <Grid item xs={12} sm={4} md={3} size={{xs:12,sm:4,md:3}}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 2.5, fontSize: '1.2rem' }}>
              Contact Us
            </Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#64748B' }}>
                <PhoneOutlined sx={{ color: '#4F46E5', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  +91 1800-123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#64748B' }}>
                <LocationOnOutlined sx={{ color: '#4F46E5', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Park Street Medical Hub, Kolkata
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#64748B' }}>
                <MailOutlined sx={{ color: '#4F46E5', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  contact@medipulse.com
                </Typography>
              </Box>
            </Stack>

            {/* Social Icons */}
            <Stack direction="row" spacing={1}>
              {[<Facebook key="fb" />, <LinkedIn key="in" />, <Instagram key="ig" />, <YouTube key="yt" />].map((icon, idx) => (
                <IconButton
                  key={idx}
                  size="small"
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: '#b84f6e',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    p: 1,
                    '&:hover': { bgcolor: '#4F46E5', color: '#FFFFFF' },
                  }}
                >
                  {React.cloneElement(icon, { fontSize: 'small' })}
                </IconButton>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            pt: 4,
            borderTop: '2px solid #fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
            © Copyright 2026 MediPulse. All Right Reserved
          </Typography>
          <Stack direction="row" spacing={3} sx={{ '& a': { color: '#64748B', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 } }}>
            <a href="#">Privacy Policy</a>
            <Typography component="span" sx={{ color: '#CBD5E1' }}>|</Typography>
            <a href="#">Terms Of Condition</a>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}