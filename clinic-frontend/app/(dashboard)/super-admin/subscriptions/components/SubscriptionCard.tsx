'use client';
import React from 'react';
import { Paper, Box, Typography, Chip, Stack, Button } from '@mui/material';
import { CheckOutlined, EditOutlined } from '@mui/icons-material';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  clinics: string;
  features: string[];
  highlight: boolean;
}

interface CardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
}

export default function SubscriptionCard({ plan, onEdit }: CardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        bgcolor: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: plan.highlight ? '2px solid #83C5BE' : '1px solid rgba(255, 255, 255, 0.12)',
        position: 'relative',
        boxShadow: plan.highlight ? '0 15px 35px rgba(0, 109, 119, 0.25)' : 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
      }}
    >
      {plan.highlight && (
        <Chip
          label="MOST POPULAR"
          size="small"
          sx={{
            position: 'absolute',
            top: -14,
            right: 24,
            bgcolor: '#006D77',
            color: '#83C5BE',
            fontWeight: 900,
            fontSize: '0.65rem',
            border: '1px solid #83C5BE',
          }}
        />
      )}

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF', mb: 0.5 }}>
          {plan.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#83C5BE', fontWeight: 800, display: 'block', mb: 3 }}>
          {plan.clinics}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', display: 'inline' }}>
            {plan.price}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', ml: 1, fontWeight: 700 }}>
            {plan.period}
          </Typography>
        </Box>

        <Stack spacing={1.5} sx={{ mb: 4 }}>
          {plan.features.map((feat) => (
            <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <CheckOutlined sx={{ fontSize: 18, color: '#34D399' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#CBD5E1' }}>
                {feat}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Button
        fullWidth
        variant={plan.highlight ? 'contained' : 'outlined'}
        disableElevation
        onClick={() => onEdit(plan)}
        startIcon={<EditOutlined />}
        sx={{
          bgcolor: plan.highlight ? '#006D77' : 'rgba(255, 255, 255, 0.03)',
          borderColor: '#83C5BE',
          color: '#83C5BE',
          fontWeight: 800,
          borderRadius: '12px',
          py: 1.1,
          textTransform: 'none',
          '&:hover': {
            bgcolor: plan.highlight ? '#004D54' : 'rgba(131, 197, 190, 0.15)',
            borderColor: '#83C5BE',
          },
        }}
      >
        Edit Tier Features
      </Button>
    </Paper>
  );
}