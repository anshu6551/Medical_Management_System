'use client';
import React from 'react';
import { Paper, Typography, Stack, Button } from '@mui/material';

interface QuickControlsProps {
  onOpenSchedule: () => void;
  onOpenBilling: () => void;
  onOpenFeedback: () => void;
}

export default function QuickControls({ onOpenSchedule, onOpenBilling, onOpenFeedback }: QuickControlsProps) {
  return (
    <Paper sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#FFFFFF' }}>
        Quick Controls
      </Typography>
      <Stack spacing={1.5}>
        <Button variant="outlined" fullWidth onClick={onOpenSchedule} sx={{ justifyContent: 'flex-start', py: 1.2, borderColor: '#334155', color: '#CBD5E1', borderRadius: '12px', textTransform: 'none', '&:hover': { borderColor: '#83C5BE', color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.03)' } }}>
          Manage Doctor Schedules
        </Button>
        <Button variant="outlined" fullWidth onClick={onOpenBilling} sx={{ justifyContent: 'flex-start', py: 1.2, borderColor: '#334155', color: '#CBD5E1', borderRadius: '12px', textTransform: 'none', '&:hover': { borderColor: '#83C5BE', color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.03)' } }}>
          Clinic Billing & Invoices
        </Button>
        <Button variant="outlined" fullWidth onClick={onOpenFeedback} sx={{ justifyContent: 'flex-start', py: 1.2, borderColor: '#334155', color: '#CBD5E1', borderRadius: '12px', textTransform: 'none', '&:hover': { borderColor: '#83C5BE', color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.03)' } }}>
          Patient Feedback Reports
        </Button>
      </Stack>
    </Paper>
  );
}