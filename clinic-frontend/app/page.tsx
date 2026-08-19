'use client';
import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Chip,
  Stack,
  Paper,
  InputBase,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  AdminPanelSettings,
  LocalHospital,
  MedicalServices,
  Person,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import Link from 'next/link';

export default function Home() {
  const portals = [
    {
      title: 'Super Admin Portal',
      desc: 'Platform governance, SaaS subscriptions, clinic onboardings & global revenue analytics.',
      path: '/login?role=super-admin',
      icon: <AdminPanelSettings sx={{ fontSize: 26, color: '#83C5BE' }} />,
      badge: 'Platform',
      badgeColor: 'rgba(131, 197, 190, 0.2)',
      badgeText: '#83C5BE',
      accentColor: '#83C5BE',
    },
    {
      title: 'Clinic Admin Portal',
      desc: 'Doctor schedules, real-time appointment queues, patient records & clinic earnings.',
      path: '/login?role=clinic-admin',
      icon: <LocalHospital sx={{ fontSize: 26, color: '#2DD4BF' }} />,
      badge: 'Management',
      badgeColor: 'rgba(45, 212, 191, 0.2)',
      badgeText: '#2DD4BF',
      accentColor: '#2DD4BF',
    },
    {
      title: 'Doctor Portal',
      desc: 'Daily consultation queue, digital prescriptions, medical history & patient logs.',
      path: '/login?role=doctor',
      icon: <MedicalServices sx={{ fontSize: 26, color: '#FBBF24' }} />,
      badge: 'Clinical',
      badgeColor: 'rgba(251, 191, 36, 0.2)',
      badgeText: '#FBBF24',
      accentColor: '#FBBF24',
    },
    {
      title: 'Patient Portal',
      desc: 'Book instant doctor slots, pay consultation fees online & submit ratings.',
      path: '/login?role=patient',
      icon: <Person sx={{ fontSize: 26, color: '#60A5FA' }} />,
      badge: 'Self Service',
      badgeColor: 'rgba(96, 165, 250, 0.2)',
      badgeText: '#60A5FA',
      accentColor: '#60A5FA',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
      {/* Glassmorphism Navbar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '1350px' }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 68 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                fontSize: '1.45rem',
                color: '#FFFFFF',
                letterSpacing: '-0.5px',
              }}
            >
              Medi<span style={{ color: '#83C5BE' }}>Pulse</span>
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                component={Link}
                href="/login"
                sx={{
                  color: '#94A3B8',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#83C5BE', bgcolor: 'transparent' },
                }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="contained"
                disableElevation
                sx={{
                  bgcolor: '#006D77',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  px: 2.8,
                  py: 0.9,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 14px rgba(0, 109, 119, 0.4)',
                  '&:hover': { bgcolor: '#004D54' },
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Unified Hero & Portal Section */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 6, md: 8 },
          pb: { xs: 8, md: 10 },
          color: '#FFFFFF',
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(0, 77, 84, 0.88) 60%, rgba(15, 23, 42, 0.96) 100%), url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '1350px' }}>
          {/* Centered Top Content Section */}
          <Box textAlign="center" maxWidth="820px" mx="auto">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
                lineHeight: 1.15,
                mb: 2.5,
                letterSpacing: '-1px',
                textAlign: 'center',
              }}
            >
              Smart Clinic & <span style={{ color: '#83C5BE' }}>Healthcare Platform</span>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#94A3B8',
                mb: 4,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.6,
                maxWidth: '620px',
                mx: 'auto',
                textAlign: 'center',
              }}
            >
              Streamline clinic operations, real-time doctor slot booking, online payments, and patient feedback in one unified portal.
            </Typography>

            {/* Side-by-Side Checkmark Inline Strip */}
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ mb: '40px', justifyContent: 'center', display: 'flex', mt: '20px' }}>
              {['Multi-Tenant SaaS', 'Real-Time Slots', 'Online Payments', 'Automated Alerts'].map((item) => (
                <Box key={item} display="flex" alignItems="center" sx={{ display: 'flex', alignItems: 'center' }} gap={1}>
                  <CheckCircle sx={{ fontSize: 18, color: '#83C5BE', mr: '4px' }} />
                  <Typography variant="body2" sx={{ color: '#CBD5E1', fontWeight: 600, fontSize: '0.85rem' }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Centered Search Bar */}
            <Paper
              elevation={0}
              sx={{
                p: '12px 10px',
                display: 'flex',
                alignItems: 'center',
                maxWidth: 720,
                borderRadius: '22px',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 30px rgba(0,0,0,0.4)',
                mx: 'auto',
                mb: 3.5,
              }}
            >
              <InputBase
                sx={{ ml: 2, flex: 1, fontSize: '0.875rem', color: '#0F172A' }}
                placeholder="Search doctors, clinics, or departments..."
              />
              <IconButton
                sx={{
                  p: '8px',
                  bgcolor: '#006D77',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#004D54' },
                  borderRadius: '12px',
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Paper>
          </Box>

          {/* Integrated Workspace Portals Grid */}
          <Box sx={{ marginTop: '80px' }}>
            <Box textAlign="center" mb={4} sx={{ marginBottom: '40px' }}>
              <Chip
                label="WORKSPACE ACCESS"
                size="small"
                sx={{
                  bgcolor: 'rgba(131, 197, 190, 0.15)',
                  color: '#83C5BE',
                  fontWeight: 800,
                  fontSize: '0.675rem',
                  letterSpacing: '1.2px',
                  mb: 1,
                  px: 1,
                  border: '1px solid rgba(131, 197, 190, 0.3)',
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontSize: { xs: '1.6rem', md: '2.1rem' },
                  letterSpacing: '-0.5px',
                  mb: 1,
                }}
              >
                Select Workspace Portal
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                Choose your assigned role workspace to log into your dashboard.
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {portals.map((portal) => (
                <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={portal.title}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: '18px',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        borderColor: portal.accentColor,
                        boxShadow: `0 16px 30px -10px ${portal.accentColor}33`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.8, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <Box>
                        {/* Icon + Badge */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box
                            sx={{
                              width: 46,
                              height: 46,
                              borderRadius: '12px',
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {portal.icon}
                          </Box>
                          <Chip
                            label={portal.badge}
                            size="small"
                            sx={{
                              bgcolor: portal.badgeColor,
                              color: portal.badgeText,
                              fontWeight: 800,
                              fontSize: '0.65rem',
                              borderRadius: '6px',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                            }}
                          />
                        </Box>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#FFFFFF',
                            fontSize: '1.05rem',
                            mb: 1,
                          }}
                        >
                          {portal.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: '#94A3B8',
                            lineHeight: 1.5,
                            fontSize: '0.825rem',
                            mb: 2.5,
                          }}
                        >
                          {portal.desc}
                        </Typography>
                      </Box>

                      <Button
                        component={Link}
                        href={portal.path}
                        variant="outlined"
                        fullWidth
                        endIcon={<ArrowForward sx={{ fontSize: 16, transition: 'transform 0.2s' }} />}
                        sx={{
                          borderColor: portal.accentColor,
                          color: portal.accentColor,
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          py: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.02)',
                          '&:hover': {
                            bgcolor: portal.accentColor,
                            color: '#0F172A',
                            borderColor: portal.accentColor,
                            '& .MuiSvgIcon-root': {
                              transform: 'translateX(4px)',
                            },
                          },
                        }}
                      >
                        Enter Portal
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}