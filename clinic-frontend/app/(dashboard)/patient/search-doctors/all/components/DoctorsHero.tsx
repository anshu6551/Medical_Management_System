'use client';
import React from 'react';
import { Box, Typography, Container, Chip } from '@mui/material';

export default function DoctorsHero() {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundImage: `url('https://html.vikinglab.agency/medicax/assets/img/all-images/bg/bg3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        pt: { xs: 14, md: 18 },
        pb: { xs: 6, md: 8 },
        mb: 4,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
          <Chip
            label="Verified Medical Panel  |  Live OPD Slots →"
            size="small"
            sx={{
              bgcolor: '#FFFFFF',
              color: '#4F46E5',
              fontWeight: 800,
              fontSize: '0.85rem',
              px: 2,
              py: 2,
              mb: 2.5,
              borderRadius: '50px',
              boxShadow: '0 4px 20px rgba(79, 70, 229, 0.08)',
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: '#1E1B4B',
              letterSpacing: '-2px',
              fontSize: { xs: '2.4rem', md: '3.5rem' },
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Our Verified Specialists
          </Typography>
          <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.6 }}>
            Find experienced doctors, view real-time OPD availability, and book consultation slots instantly.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}