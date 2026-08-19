'use client';
import React, { useState } from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import StatsCards from './components/StatsCards';
import RevenueChart from './components/RevenueChart';
import SubscriptionSplit from './components/SubscriptionSplit';
import RecentClinicsTable from './components/RecentClinicsTable';
import OnboardClinicModal from './components/OnboardClinicModal';

export default function SuperAdminDashboard() {
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);

  const handleOnboardSave = (data: { name: string; ownerName: string; email: string; city: string; plan: string }) => {
    alert(`Clinic "${data.name}" onboarded successfully with ${data.plan} plan!`);
    setOnboardModalOpen(false);
  };

  return (
    <Box sx={{ color: '#FFFFFF' }}>
      {/* Top Banner Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
            System Governance Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5, fontWeight: 500 }}>
            Real-time overview of onboarded clinic tenants, SaaS subscriptions & platform traffic.
          </Typography>
        </Box>

        <Button
          variant="contained"
          disableElevation
          onClick={() => setOnboardModalOpen(true)}
          startIcon={<AddOutlined />}
          sx={{
            bgcolor: '#006D77',
            '&:hover': { bgcolor: '#004D54' },
            fontWeight: 800,
            borderRadius: '12px',
            px: 3,
            py: 1.1,
            textTransform: 'none',
            fontSize: '0.88rem',
            boxShadow: '0 4px 14px rgba(0, 109, 119, 0.4)',
          }}
        >
          Onboard New Clinic
        </Button>
      </Box>

      {/* KPI Cards Component */}
      <StatsCards />

      {/* Analytics Charts Component */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8} size={{ xs: 12, md: 8 }}>
          <RevenueChart />
        </Grid>
        <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
          <SubscriptionSplit />
        </Grid>
      </Grid>

      {/* Table Component */}
      <RecentClinicsTable />

      {/* Onboard New Clinic Modal */}
      <OnboardClinicModal
        open={onboardModalOpen}
        onClose={() => setOnboardModalOpen(false)}
        onSave={handleOnboardSave}
      />
    </Box>
  );
}