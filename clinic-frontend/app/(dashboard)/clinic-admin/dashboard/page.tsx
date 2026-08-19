'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Grid,
} from '@mui/material';
import {
  NotificationsNoneOutlined,
  PersonAddOutlined,
  AddOutlined,
} from '@mui/icons-material';

import KpiCards from './components/KpiCards';
import AppointmentQueue from './components/AppointmentQueue';
import QuickControls from './components/QuickControls';
import Modals from './components/Modals';

export default function ClinicAdminDashboard() {
  const [openDoctor, setOpenDoctor] = useState(false);
  const [openAppt, setOpenAppt] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openBilling, setOpenBilling] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Navbar */}
      

      {/* Main Content Container */}
      <Container maxWidth={false} sx={{ maxWidth: '1350px', py: 4 }}>
        {/* Header Title & Buttons */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
              Dashboard Overview
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              Real-time operations & appointment queues for today.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => setOpenDoctor(true)}
              startIcon={<PersonAddOutlined />}
              sx={{ borderColor: '#334155', color: '#FFFFFF', borderRadius: '10px', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#83C5BE' } }}
            >
              Add Doctor
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenAppt(true)}
              disableElevation
              startIcon={<AddOutlined />}
              sx={{ bgcolor: '#006D77', color: '#FFFFFF', borderRadius: '10px', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#004D54' } }}
            >
              New Appointment
            </Button>
          </Stack>
        </Box>

        {/* KPI Grid */}
        <KpiCards />

        {/* Queue Table & Quick Controls */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} size={{xs:12,md:8}}>
            <AppointmentQueue />
          </Grid>
          <Grid item xs={12} md={4} size={{xs:12,md:4}}>
            <QuickControls
              onOpenSchedule={() => setOpenSchedule(true)}
              onOpenBilling={() => setOpenBilling(true)}
              onOpenFeedback={() => setOpenFeedback(true)}
            />
          </Grid>
        </Grid>

        {/* Modals Handler */}
        <Modals
          openDoctor={openDoctor} setOpenDoctor={setOpenDoctor}
          openAppt={openAppt} setOpenAppt={setOpenAppt}
          openSchedule={openSchedule} setOpenSchedule={setOpenSchedule}
          openBilling={openBilling} setOpenBilling={setOpenBilling}
          openFeedback={openFeedback} setOpenFeedback={setOpenFeedback}
        />
      </Container>
    </Box>
  );
}