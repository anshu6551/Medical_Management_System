'use client';
import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import ClinicProfileForm from './components/ClinicProfileForm';
import ConsultationConfig from './components/ConsultationConfig';

export default function SettingsPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', color: '#FFFFFF', py: 2, fontFamily: 'Inter, sans-serif' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
            Clinic Settings
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Configure clinic workspace details, opening hours, and consultation rules.
          </Typography>
        </Box>

        {/* Forms */}
        <Stack spacing={4}>
          <ClinicProfileForm />
          <ConsultationConfig />
        </Stack>
      </Container>
    </Box>
  );
}