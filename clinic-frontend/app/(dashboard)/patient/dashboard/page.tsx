'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Avatar,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  CalendarMonthOutlined,
  AccessTimeOutlined,
  LocationOnOutlined,
  DownloadOutlined,
  CancelOutlined,
  CheckCircleOutlined,
  QrCode2Outlined,
  ReceiptLongOutlined,
  EventAvailableOutlined,
  TaskAltOutlined,
  PersonOutlined,
  SupportAgentOutlined,
  AddOutlined,
} from '@mui/icons-material';
import Link from 'next/link';
import api from '@/lib/api/axios';

interface Booking {
  id: string;
  passNo: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  doctorImg: string;
  date: string;
  timeSlot: string;
  fee: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
}

export default function MyBookingsPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);
  const [openPassModal, setOpenPassModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Logged-in Patient Profile
  const [patientInfo, setPatientInfo] = useState({
    name: 'Rahul Sharma',
    patientId: 'PAT-1082',
    phone: '+91 98765 43210',
    bloodGroup: 'O +ve',
    initial: 'R',
  });

  const [bookings, setBookings] = useState<Booking[]>([]);

  // 1. Fetch Patient Info & Live Appointments from API
  const fetchMyBookings = async () => {
    try {
      setLoading(true);

      // Load Profile from LocalStorage
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setPatientInfo({
              name: parsed.name || 'Rahul Sharma',
              patientId: parsed.patientId || parsed.customId || `PAT-${(parsed._id || '1082').slice(-4).toUpperCase()}`,
              phone: parsed.phone || '+91 98765 43210',
              bloodGroup: parsed.bloodGroup || 'O +ve',
              initial: (parsed.name || 'R').charAt(0).toUpperCase(),
            });
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }
      }

      // API Call: GET /patient/appointments
      const res = await api.get('/patient/appointments');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const mappedBookings: Booking[] = res.data.data.map((item: any) => {
          const rawStatus = (item.status || 'WAITING').toUpperCase();
          let formattedStatus: 'Confirmed' | 'Completed' | 'Cancelled' = 'Confirmed';

          if (rawStatus === 'COMPLETED') {
            formattedStatus = 'Completed';
          } else if (rawStatus === 'CANCELLED' || rawStatus === 'REJECTED') {
            formattedStatus = 'Cancelled';
          } else {
            formattedStatus = 'Confirmed'; // WAITING / IN_PROGRESS / CONFIRMED
          }

          const rawDate = item.appointmentDate ? new Date(item.appointmentDate) : new Date();
          const formattedDate = rawDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          return {
            id: item._id,
            passNo: item.appointmentId ? `OPD-PASS-${item.appointmentId.replace('APT-', '')}` : `OPD-PASS-${item._id.slice(-4)}`,
            doctorName: item.doctorName || 'Dr. Specialist',
            specialty: item.specialization || 'General Physician',
            clinic: item.clinicName || 'City Health Clinic, Park Street',
            doctorImg:
              item.doctorImg ||
              'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
            date: formattedDate,
            timeSlot: item.slotTime || '10:30 AM',
            fee: item.fee ? `₹${item.fee}` : '₹500',
            status: formattedStatus,
          };
        });

        setBookings(mappedBookings);
      }
    } catch (err: any) {
      console.error('Failed to load patient bookings:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to load bookings from server',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // 2. Cancel Appointment API
  const handleCancelBooking = async (id: string) => {
    if (confirm('Are you sure you want to cancel this OPD appointment?')) {
      try {
        // Optimistic UI update
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b))
        );

        await api.put(`/doctor/appointments/${id}/status`, { status: 'CANCELLED' });

        setSnackbar({
          open: true,
          message: 'Appointment has been cancelled successfully.',
          severity: 'success',
        });
        fetchMyBookings();
      } catch (error: any) {
        console.error('Failed to cancel appointment:', error);
        setSnackbar({
          open: true,
          message: error?.response?.data?.message || 'Failed to cancel slot. Try again.',
          severity: 'error',
        });
        fetchMyBookings();
      }
    }
  };

  // 3. Download Pass Receipt
  const handleDownloadPass = () => {
    setSnackbar({
      open: true,
      message: `OPD Pass receipt (${selectedPass?.passNo}) downloaded successfully!`,
      severity: 'success',
    });
    setOpenPassModal(false);
  };

  const filteredBookings = bookings.filter((b) => {
    if (tabIndex === 1) return b.status === 'Confirmed';
    if (tabIndex === 2) return b.status === 'Completed';
    if (tabIndex === 3) return b.status === 'Cancelled';
    return true;
  });

  const totalCount = bookings.length;
  const upcomingCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed').length;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      {/* Top Gradient Banner Header */}
      <Box
        sx={{
          width: '100%',
          backgroundImage: `url('https://html.vikinglab.agency/medicax/assets/img/all-images/bg/bg3.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          pt: { xs: 14, md: 18 },
          pb: { xs: 6, md: 8 },
          mb: 4,
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <Chip
              label="Patient Portal | Live OPD Passes →"
              size="small"
              sx={{
                bgcolor: '#FFFFFF',
                color: '#4F46E5',
                fontWeight: 800,
                fontSize: '0.85rem',
                px: 2,
                py: 2,
                mb: 2,
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.08)',
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                color: '#1E1B4B',
                letterSpacing: '-2px',
                fontSize: { xs: '2.4rem', md: '3.4rem' },
                lineHeight: 1.15,
                mb: 1,
              }}
            >
              My Appointments & OPD Passes
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.1rem', fontWeight: 500 }}>
              Manage your booked doctor consultations, view live pass receipts, or download OPD tickets.
            </Typography>
          </Box>

          {/* Elevated Stat Widgets */}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1.5px solid #CBD5E1',
                  borderLeft: '6px solid #4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 10px 25px rgba(30, 27, 75, 0.04)',
                }}
              >
                <Box sx={{ p: 1.5, bgcolor: '#EEF2FF', borderRadius: '16px', color: '#4F46E5', display: 'flex' }}>
                  <ReceiptLongOutlined fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    Total Appointments
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E1B4B', lineHeight: 1.1 }}>
                    {totalCount}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1.5px solid #CBD5E1',
                  borderLeft: '6px solid #059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 10px 25px rgba(30, 27, 75, 0.04)',
                }}
              >
                <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: '16px', color: '#059669', display: 'flex' }}>
                  <EventAvailableOutlined fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    Upcoming OPD Slots
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>
                    {upcomingCount}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1.5px solid #CBD5E1',
                  borderLeft: '6px solid #818CF8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 10px 25px rgba(30, 27, 75, 0.04)',
                }}
              >
                <Box sx={{ p: 1.5, bgcolor: '#EEF2FF', borderRadius: '16px', color: '#4F46E5', display: 'flex' }}>
                  <TaskAltOutlined fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    Completed Visits
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E1B4B', lineHeight: 1.1 }}>
                    {completedCount}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Grid: Bookings List + Side Panel */}
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          {/* Left Column (70%): Filter Tabs & Pass Cards */}
          <Grid item xs={12} lg={8} size={{ xs: 12, lg: 8 }}>
            {/* Filter Tabs */}
            <Paper
              elevation={0}
              sx={{
                p: 0.8,
                bgcolor: '#FFFFFF',
                borderRadius: '50px',
                border: '1.5px solid #CBD5E1',
                mb: 4,
                display: 'inline-block',
                boxShadow: '0 10px 25px rgba(30, 27, 75, 0.04)',
              }}
            >
              <Tabs
                value={tabIndex}
                onChange={(_, val) => setTabIndex(val)}
                sx={{
                  minHeight: '44px',
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    borderRadius: '50px',
                    minHeight: '40px',
                    px: 2.8,
                    color: '#64748B',
                    '&.Mui-selected': {
                      bgcolor: '#4F46E5',
                      color: '#FFFFFF',
                    },
                  },
                }}
              >
                <Tab label={`All Passes (${totalCount})`} />
                <Tab label="Upcoming" />
                <Tab label="Completed" />
                <Tab label="Cancelled" />
              </Tabs>
            </Paper>

            {/* Passes List */}
            <Stack spacing={3}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#4F46E5' }} />
                </Box>
              ) : filteredBookings.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{ p: 6, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: '32px', border: '1.5px solid #CBD5E1' }}
                >
                  <ReceiptLongOutlined sx={{ fontSize: 52, color: '#94A3B8', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1B4B' }}>
                    No appointments found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    There are no OPD bookings available under this category.
                  </Typography>
                </Paper>
              ) : (
                filteredBookings.map((item) => {
                  const isConfirmed = item.status === 'Confirmed';
                  const isCompleted = item.status === 'Completed';

                  return (
                    <Paper
                      key={item.id}
                      elevation={0}
                      sx={{
                        p: 3,
                        bgcolor: '#FFFFFF',
                        borderRadius: '28px',
                        border: '1.5px solid #CBD5E1',
                        boxShadow: '0 12px 30px rgba(30, 27, 75, 0.05)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: '#4F46E5',
                          boxShadow: '0 20px 40px rgba(79, 70, 229, 0.12)',
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
                          gap: 2.5,
                        }}
                      >
                        {/* Doctor Profile */}
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={item.doctorImg}
                            alt={item.doctorName}
                            sx={{
                              width: 72,
                              height: 72,
                              border: '3px solid #4F46E5',
                              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.15)',
                            }}
                          />
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E1B4B', fontSize: '1.15rem' }}>
                                {item.doctorName}
                              </Typography>
                              <Chip
                                label={item.specialty}
                                size="small"
                                sx={{
                                  bgcolor: '#4F46E5',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  height: '22px',
                                }}
                              />
                            </Stack>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748B', mb: 0.8 }}>
                              <LocationOnOutlined sx={{ fontSize: 16, color: '#4F46E5' }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>
                                {item.clinic}
                              </Typography>
                            </Box>

                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                              Pass ID: <span style={{ color: '#1E1B4B', fontWeight: 900 }}>{item.passNo}</span>
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Status Chip */}
                        <Chip
                          icon={
                            isConfirmed ? (
                              <CheckCircleOutlined sx={{ fontSize: '15px !important' }} />
                            ) : isCompleted ? (
                              <CheckCircleOutlined sx={{ fontSize: '15px !important' }} />
                            ) : (
                              <CancelOutlined sx={{ fontSize: '15px !important' }} />
                            )
                          }
                          label={item.status}
                          sx={{
                            bgcolor: isConfirmed ? '#ECFDF5' : isCompleted ? '#EEF2FF' : '#FEF2F2',
                            color: isConfirmed ? '#059669' : isCompleted ? '#4F46E5' : '#DC2626',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            px: 1,
                            py: 1.6,
                            borderRadius: '50px',
                            border: '1px solid',
                            borderColor: isConfirmed ? '#A7F3D0' : isCompleted ? '#C7D2FE' : '#FECACA',
                          }}
                        />
                      </Box>

                      {/* Middle Schedule Bar & Action */}
                      <Box
                        sx={{
                          mt: 2.5,
                          pt: 2,
                          borderTop: '1.5px solid #F1F5F9',
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: 'space-between',
                          gap: 2,
                        }}
                      >
                        <Stack direction="row" spacing={3} alignItems="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <CalendarMonthOutlined sx={{ fontSize: 18, color: '#4F46E5' }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E1B4B' }}>
                              {item.date}
                            </Typography>
                          </Box>

                          <Box sx={{ borderLeft: '1.5px solid #CBD5E1', pl: 3, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <AccessTimeOutlined sx={{ fontSize: 18, color: '#059669' }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E1B4B' }}>
                              {item.timeSlot}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.5}>
                          <Button
                            variant="contained"
                            disableElevation
                            size="small"
                            onClick={() => {
                              setSelectedPass(item);
                              setOpenPassModal(true);
                            }}
                            startIcon={<QrCode2Outlined />}
                            sx={{
                              bgcolor: '#4F46E5',
                              '&:hover': { bgcolor: '#4338CA' },
                              fontWeight: 800,
                              borderRadius: '50px',
                              textTransform: 'none',
                              px: 2.5,
                              py: 0.8,
                              fontSize: '0.82rem',
                              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.2)',
                            }}
                          >
                            View OPD Pass
                          </Button>

                          {isConfirmed && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleCancelBooking(item.id)}
                              sx={{
                                borderColor: '#FCA5A5',
                                color: '#DC2626',
                                fontWeight: 800,
                                borderRadius: '50px',
                                textTransform: 'none',
                                px: 2,
                                '&:hover': { bgcolor: '#FEF2F2', borderColor: '#DC2626' },
                              }}
                            >
                              Cancel Slot
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </Grid>

          {/* Right Column (30%): Dynamic Patient Profile & Quick Actions */}
          <Grid item xs={12} lg={4} size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              {/* Patient Profile Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: '#FFFFFF',
                  borderRadius: '28px',
                  border: '1.5px solid #CBD5E1',
                  boxShadow: '0 10px 25px rgba(30, 27, 75, 0.04)',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: '#64748B',
                    mb: 2,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  Registered Patient Profile
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <Avatar sx={{ bgcolor: '#4F46E5', width: 56, height: 56, fontSize: '1.4rem', fontWeight: 900 }}>
                    {patientInfo.initial}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E1B4B', lineHeight: 1.2 }}>
                      {patientInfo.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Patient ID: {patientInfo.patientId}
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={1.2} sx={{ pt: 2, borderTop: '1.5px solid #F1F5F9', fontSize: '0.88rem' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Phone:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1E1B4B', fontWeight: 800 }}>
                      {patientInfo.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Blood Group:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1E1B4B', fontWeight: 800 }}>
                      {patientInfo.bloodGroup}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  disableElevation
                  component={Link}
                  href="/patient/search-doctors/all"
                  startIcon={<AddOutlined />}
                  sx={{
                    mt: 3,
                    bgcolor: '#4F46E5',
                    '&:hover': { bgcolor: '#4338CA' },
                    fontWeight: 800,
                    borderRadius: '50px',
                    py: 1.2,
                    textTransform: 'none',
                    fontSize: '0.88rem',
                  }}
                >
                  Book New OPD Slot
                </Button>
              </Paper>

              {/* Need Assistance Desk */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
                  borderRadius: '28px',
                  border: '1.5px solid #C7D2FE',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ p: 1, bgcolor: '#4F46E5', borderRadius: '12px', color: '#FFF', display: 'flex' }}>
                    <SupportAgentOutlined />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1E1B4B' }}>
                    Need Desk Support?
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.6, fontSize: '0.85rem' }}>
                  Facing issues with slot rescheduling or hospital OPD counter verification?
                </Typography>
                <Button
                  component={Link}
                  href="/patient/search-doctors#contact-desk"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#4F46E5',
                    color: '#4F46E5',
                    fontWeight: 800,
                    borderRadius: '50px',
                    textTransform: 'none',
                    bgcolor: '#FFF',
                  }}
                >
                  Contact Health Desk
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Digital OPD Pass Dialog */}
        <Dialog
          open={openPassModal}
          onClose={() => setOpenPassModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: '32px', p: 1 } }}
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E1B4B' }}>
              MediPulse OPD Pass
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Show this QR code at hospital reception counter
            </Typography>
          </DialogTitle>

          <DialogContent>
            {selectedPass && (
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: '#F8FAFC',
                    borderRadius: '24px',
                    border: '2px dashed #C7D2FE',
                    mb: 3,
                    display: 'inline-block',
                  }}
                >
                  <QrCode2Outlined sx={{ fontSize: 130, color: '#1E1B4B' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#4F46E5', mt: 1 }}>
                    {selectedPass.passNo}
                  </Typography>
                </Box>

                <Stack spacing={1.2} textAlign="left" sx={{ bgcolor: '#EEF2FF', p: 2.5, borderRadius: '20px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Doctor:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1E1B4B', fontWeight: 900 }}>
                      {selectedPass.doctorName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Specialty:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1E1B4B', fontWeight: 900 }}>
                      {selectedPass.specialty}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Date & Slot:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 900 }}>
                      {selectedPass.date} ({selectedPass.timeSlot})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Consultation Fee:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1E1B4B', fontWeight: 900 }}>
                      {selectedPass.fee} (Paid)
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
            <Button
              variant="contained"
              disableElevation
              fullWidth
              onClick={handleDownloadPass}
              startIcon={<DownloadOutlined />}
              sx={{
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' },
                fontWeight: 800,
                borderRadius: '50px',
                py: 1.4,
                textTransform: 'none',
              }}
            >
              Download PDF Pass
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Dynamic Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '12px', fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}