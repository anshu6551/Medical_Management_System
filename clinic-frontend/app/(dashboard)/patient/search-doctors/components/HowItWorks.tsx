'use client';
import React from 'react';
import { Box, Typography, Container, Paper, Stack, Chip } from '@mui/material';
import { SearchOutlined, EventAvailableOutlined, LocalHospitalOutlined } from '@mui/icons-material';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Find Doctor or Specialty',
      desc: 'Browse through our verified top-rated specialists and departments.',
      icon: <SearchOutlined sx={{ fontSize: 32, color: '#4F46E5' }} />,
    },
    {
      num: '02',
      title: 'Choose Convenient Slot',
      desc: 'Select an available date & time slot that fits your schedule.',
      icon: <EventAvailableOutlined sx={{ fontSize: 32, color: '#4F46E5' }} />,
    },
    {
      num: '03',
      title: 'Get Instant OPD Pass',
      desc: 'Receive confirmation receipt & visit the clinic hassle-free.',
      icon: <LocalHospitalOutlined sx={{ fontSize: 32, color: '#4F46E5' }} />,
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: '#FFFFFF' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="How It Works  |  Simple 3 Steps →"
            size="small"
            sx={{
              bgcolor: '#EEF2FF',
              color: '#4F46E5',
              fontWeight: 800,
              px: 1.5,
              py: 2,
              mb: 2,
              borderRadius: '50px',
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#1E1B4B', fontSize: { xs: '2rem', md: '3rem' } }}>
            Book Your OPD Appointment <br /> In 3 Easy Steps
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
          {steps.map((step) => (
            <Paper
              key={step.num}
              elevation={0}
              sx={{
                flex: 1,
                p: 4,
                bgcolor: '#F8FAFC',
                borderRadius: '28px',
                border: '1.5px solid #E2E8F0',
                position: 'relative',
                transition: '0.3s',
                '&:hover': {
                  borderColor: '#818CF8',
                  boxShadow: '0 15px 35px rgba(79, 70, 229, 0.08)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ p: 1.5, bgcolor: '#EEF2FF', borderRadius: '18px', display: 'flex' }}>
                  {step.icon}
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#CBD5E1' }}>
                  {step.num}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 1 }}>
                {step.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, fontWeight: 500 }}>
                {step.desc}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}