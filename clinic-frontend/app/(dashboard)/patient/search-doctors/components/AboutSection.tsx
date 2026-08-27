'use client';
import React from 'react';
import { Box, Typography, Chip, Grid, Container } from '@mui/material';

export default function AboutSection() {
  return (
    <Box sx={{ py: { xs: 6, md: 4 }, bgcolor: '#FFFFFF' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          {/* Left Maternity Hospital Image */}
          <Grid item xs={12} md={6} size={{xs:12,md:6}}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
              }}
            >
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
                alt="About LifeSpire"
                sx={{
                  width: '100%',
                  height: { xs: '350px', md: '480px' },
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          </Grid>

          {/* Right Text Content */}
          <Grid item xs={12} md={6} size={{xs:12,md:6}}>
            <Chip
              label="LifeSpire  |  About Us →"
              size="small"
              sx={{
                bgcolor: '#EEF2FF',
                color: '#4F46E5',
                fontWeight: 800,
                fontSize: '0.85rem',
                px: 1.5,
                py: 2,
                mb: 3,
                borderRadius: '50px',
              }}
            />

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: '#1E1B4B',
                letterSpacing: '-1.5px',
                fontSize: { xs: '2.2rem', md: '3.2rem' },
                lineHeight: 1.15,
                mb: 3,
              }}
            >
              Your health and happiness are our top priorities.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#64748B',
                fontSize: '1.05rem',
                lineHeight: 1.8,
                fontWeight: 500,
              }}
            >
              At LifeSpire, we go beyond just treating symptoms — we focus on addressing the underlying causes of illness and promoting holistic well-being. Whether you're seeking preventive care, managing a chronic condition, or in need of specialized treatment, you can trust that you're in good hands with our team.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}