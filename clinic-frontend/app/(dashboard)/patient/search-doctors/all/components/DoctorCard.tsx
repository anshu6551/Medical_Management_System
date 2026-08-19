'use client';
import React from 'react';
import { Paper, Box, Typography, Button, Chip, Stack, Rating, Avatar, IconButton, Tooltip } from '@mui/material';
import {
  LocationOnOutlined,
  WorkOutlined,
  AccessTimeOutlined,
  VerifiedOutlined,
  CalendarMonthOutlined,
  RateReviewOutlined,
} from '@mui/icons-material';

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
  onGiveFeedback?: (doc: Doctor) => void;
}

export default function DoctorCard({ doctor, onBookSlot, onGiveFeedback }: DoctorCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: '#FFFFFF',
        borderRadius: '28px',
        border: '1.5px solid #CBD5E1',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 10px 25px rgba(30, 27, 75, 0.04)',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: '#4F46E5',
          boxShadow: '0 20px 40px rgba(79, 70, 229, 0.12)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #EEF2FF 100%)',
        },
      }}
    >
      <Box>
        {/* Top Header: Avatar & Availability Badge */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={doctor.img || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
              alt={doctor.name}
              sx={{
                width: 82,
                height: 82,
                border: '3px solid #4F46E5',
                boxShadow: '0 8px 18px rgba(79, 70, 229, 0.15)',
              }}
            />
            <VerifiedOutlined
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                color: '#4F46E5',
                bgcolor: '#FFFFFF',
                borderRadius: '50%',
                fontSize: 18,
              }}
            />
          </Box>

          <Chip
            icon={<AccessTimeOutlined sx={{ fontSize: '13px !important', color: '#059669 !important' }} />}
            label={doctor.availableSlot}
            size="small"
            sx={{
              bgcolor: '#ECFDF5',
              color: '#059669',
              fontWeight: 800,
              fontSize: '0.75rem',
              borderRadius: '50px',
              py: 1.6,
              px: 0.5,
              border: '1px solid #A7F3D0',
            }}
          />
        </Box>

        {/* Doctor Identity */}
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E1B4B', mb: 0.5, fontSize: '1.2rem' }}>
          {doctor.name}
        </Typography>

        <Chip
          label={doctor.specialty}
          size="small"
          sx={{
            bgcolor: '#4F46E5',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.72rem',
            mb: 2,
            px: 1,
          }}
        />

        {/* Info Rows */}
        <Stack spacing={1} sx={{ color: '#64748B', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnOutlined sx={{ fontSize: 18, color: '#4F46E5' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem' }}>
              {doctor.clinic}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkOutlined sx={{ fontSize: 18, color: '#4F46E5' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem' }}>
              {doctor.experience} Clinical Experience
            </Typography>
          </Box>
        </Stack>

        {/* Rating & Feedback Trigger */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            mb: 2.5,
            pt: 1.5,
            borderTop: '1.5px solid #F1F5F9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Rating value={doctor.rating} precision={0.1} readOnly size="small" />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E1B4B', fontSize: '0.85rem' }}>
              ({doctor.rating})
            </Typography>
          </Box>

          {onGiveFeedback && (
            <Tooltip title="Give Doctor Feedback" arrow placement="top">
              <IconButton
                size="small"
                onClick={() => onGiveFeedback(doctor)}
                sx={{
                  color: '#4F46E5',
                  bgcolor: '#EEF2FF',
                  p: 0.8,
                  border: '1px solid #C7D2FE',
                  '&:hover': { bgcolor: '#4F46E5', color: '#FFFFFF' },
                }}
              >
                <RateReviewOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Bottom Action Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          pt: 2,
          borderTop: '1.5px solid #CBD5E1',
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.7rem' }}>
            Consult Fee
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E1B4B', lineHeight: 1 }}>
            {doctor.fee}
          </Typography>
        </Box>

        <Button
          variant="contained"
          disableElevation
          onClick={() => onBookSlot(doctor)}
          startIcon={<CalendarMonthOutlined fontSize="small" />}
          sx={{
            bgcolor: '#4F46E5',
            '&:hover': { bgcolor: '#4338CA' },
            fontWeight: 800,
            borderRadius: '50px',
            px: 2.8,
            py: 1,
            textTransform: 'none',
            fontSize: '0.85rem',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.2)',
            ml:"20px"
          }}
        >
          Book Slot
        </Button>
      </Box>
    </Paper>
  );
}