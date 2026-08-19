'use client';
import React from 'react';
import { Paper, Box, Typography, Button, Chip, Stack, Rating, Avatar } from '@mui/material';
import { AccessTimeOutlined, LocationOnOutlined, WorkOutlined } from '@mui/icons-material';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  experience: string;
  fee: string;
  rating: number;
  availableSlot: string;
  img?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onBookSlot: (doc: Doctor) => void;
}

export default function DoctorCard({ doctor, onBookSlot }: DoctorCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E2E8F0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 8px 25px rgba(30, 27, 75, 0.04)',
        '&:hover': {
          borderColor: '#818CF8',
          boxShadow: '0 16px 35px rgba(79, 70, 229, 0.12)',
          transform: 'translateY(-3px)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        {/* Doctor Info Left */}
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Avatar
            src={
              doctor.img ||
              'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'
            }
            alt={doctor.name}
            sx={{
              width: 76,
              height: 76,
              borderRadius: '20px',
              border: '2.5px solid #EEF2FF',
              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.1)',
            }}
          />

          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E1B4B', fontSize: '1.15rem' }}>
                {doctor.name}
              </Typography>
              <Chip
                label={doctor.specialty}
                size="small"
                sx={{
                  bgcolor: '#EEF2FF',
                  color: '#4F46E5',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '50px',
                  px: 0.8,
                }}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ color: '#64748B', mb: 1, fontSize: '0.88rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnOutlined sx={{ fontSize: 16, color: '#4F46E5' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                  {doctor.clinic}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WorkOutlined sx={{ fontSize: 16, color: '#4F46E5' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                  {doctor.experience} Exp
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={doctor.rating} precision={0.1} readOnly size="small" />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E1B4B', fontSize: '0.85rem' }}>
                {doctor.rating}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Slot Info & Fee Right */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: { xs: 'center', sm: 'flex-end' },
            justifyContent: 'space-between',
            width: { xs: '100%', sm: 'auto' },
            pt: { xs: 2, sm: 0 },
            borderTop: { xs: '1px solid #F1F5F9', sm: 'none' },
            gap: 1.5,
          }}
        >
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600, fontSize: '0.72rem' }}>
              Consultation Fee
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E1B4B', lineHeight: 1 }}>
              {doctor.fee}
            </Typography>
            <Chip
              icon={<AccessTimeOutlined sx={{ fontSize: '14px !important', color: '#059669 !important' }} />}
              label={`Next Slot: ${doctor.availableSlot || '10:30 AM'}`}
              size="small"
              sx={{
                bgcolor: '#ECFDF5',
                color: '#059669',
                fontWeight: 800,
                fontSize: '0.72rem',
                mt: 0.8,
                borderRadius: '50px',
              }}
            />
          </Box>

          <Button
            variant="contained"
            disableElevation
            onClick={() => onBookSlot(doctor)}
            sx={{
              bgcolor: '#4F46E5',
              '&:hover': { bgcolor: '#4338CA' },
              borderRadius: '50px',
              px: 3.5,
              py: 1.1,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.88rem',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.2)',
            }}
          >
            Book Slot
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}