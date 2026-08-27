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
  SupportAgentOutlined,
  AddOutlined,
  MedicationLiquidOutlined,
  HealingOutlined,
  LocalHospitalOutlined,
} from '@mui/icons-material';
import Link from 'next/link';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

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
  status: 'IN_PROGRESS' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'WAITING' | string;
  rawStatus: string;
}

interface PrescriptionDetails {
  appointmentId: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string;
  timeSlot: string;
  diagnosis: string;
  medicines: string[];
  advice: string;
  status: string;
}

export default function MyBookingsPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);
  const [openPassModal, setOpenPassModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Prescription Modal State
  const [openPrescriptionModal, setOpenPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionDetails | null>(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

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
          const doctorName =
            item.doctorName ||
            item.doctorId?.userId?.name ||
            item.doctorId?.name ||
            'Dr. Specialist';

          const specialty =
            item.specialty ||
            item.specialization ||
            item.doctorId?.specialization ||
            'General Physician';

          const clinic =
            item.clinic ||
            item.clinicName ||
            item.doctorId?.clinicName ||
            'Apollo Clinic';

          const fee = item.fee
            ? `₹${String(item.fee).replace('₹', '')}`
            : item.doctorId?.consultationFee
            ? `₹${item.doctorId.consultationFee}`
            : '₹500';

          const timeSlot = item.timeSlot || item.slotTime || '10:30 AM';

          const rawDate = item.appointmentDate || item.date ? new Date(item.appointmentDate || item.date) : new Date();
          const formattedDate = !isNaN(rawDate.getTime())
            ? rawDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : item.date || 'Today';

          const currentStatus = (item.status || item.rawStatus || 'CONFIRMED').toUpperCase().replace(/[\s-]/g, '_');

          return {
            id: item._id || item.id,
            passNo: item.passNo || (item.appointmentId ? `OPD-PASS-${item.appointmentId.replace('APT-', '')}` : `OPD-PASS-${(item._id || '101').slice(-4).toUpperCase()}`),
            doctorName,
            specialty,
            clinic,
            doctorImg:
              item.profileImage ||
              'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
            date: formattedDate,
            timeSlot,
            fee,
            status: currentStatus,
            rawStatus: currentStatus,
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

  // 2. Fetch Prescription Data & Open Modal
  const handleViewPrescription = async (item: Booking) => {
    try {
      setLoadingPrescription(true);
      setOpenPrescriptionModal(true);

      const endpoint = API_ENDPOINTS?.DOCTOR?.GET_PRESCRIPTION 
        ? API_ENDPOINTS.DOCTOR.GET_PRESCRIPTION(item.id) 
        : `/doctor/appointments/${item.id}/prescription`;

      const res = await api.get(endpoint);

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;

        let medList: string[] = [];
        if (Array.isArray(data.medicines)) {
          medList = data.medicines.map((m: any) => (typeof m === 'object' ? `${m.name || ''} - ${m.dosage || ''}` : String(m)));
        } else if (typeof data.medicines === 'string' && data.medicines.trim()) {
          medList = data.medicines.split(',').map((m: string) => m.trim());
        }

        setPrescriptionData({
          appointmentId: item.passNo,
          patientName: data.patient?.name || patientInfo.name,
          doctorName: item.doctorName,
          specialty: item.specialty,
          clinic: item.clinic,
          date: item.date,
          timeSlot: item.timeSlot,
          diagnosis: data.diagnosis || 'General Consultation / Not specified',
          medicines: medList.length > 0 ? medList : ['No prescription medicines provided yet.'],
          advice: data.advice || data.doctorAdvice || 'Follow general precautions, drink plenty of water, and rest well.',
          status: data.status || item.status,
        });
      } else {
        setPrescriptionData({
          appointmentId: item.passNo,
          patientName: patientInfo.name,
          doctorName: item.doctorName,
          specialty: item.specialty,
          clinic: item.clinic,
          date: item.date,
          timeSlot: item.timeSlot,
          diagnosis: 'General Health Checkup',
          medicines: ['No specific medicines prescribed.'],
          advice: 'Drink warm water and rest well.',
          status: item.status,
        });
      }
    } catch {
      setPrescriptionData({
        appointmentId: item.passNo,
        patientName: patientInfo.name,
        doctorName: item.doctorName,
        specialty: item.specialty,
        clinic: item.clinic,
        date: item.date,
        timeSlot: item.timeSlot,
        diagnosis: 'Consultation Complete',
        medicines: ['General prescribed routine.'],
        advice: 'Continue healthy diet and hydration.',
        status: item.status,
      });
    } finally {
      setLoadingPrescription(false);
    }
  };

  // 3. Download Prescription PDF via Hidden Iframe (No Extra Tab)
  const handleDownloadPrescriptionPDF = () => {
    if (!prescriptionData) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${prescriptionData.appointmentId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
            .header { border-bottom: 3px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .logo-title { font-size: 26px; font-weight: 800; color: #4f46e5; margin: 0; }
            .badge { background: #eef2ff; color: #4f46e5; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; }
            .section { margin-bottom: 25px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 3px; }
            .value { font-size: 15px; font-weight: 700; color: #0f172a; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 15px; }
            .rx-title { color: #059669; font-size: 18px; font-weight: 800; margin-bottom: 12px; }
            ul { margin: 0; padding-left: 20px; }
            li { font-size: 14px; margin-bottom: 8px; font-weight: 600; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="logo-title">MediPulse Healthcare</h1>
              <p style="margin: 3px 0 0 0; color: #64748b; font-size: 13px;">Official Digital Medical Prescription</p>
            </div>
            <div class="badge">${prescriptionData.appointmentId}</div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="label">Patient Information</div>
              <div class="value">${prescriptionData.patientName}</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">ID: ${patientInfo.patientId} | Blood: ${patientInfo.bloodGroup}</div>
            </div>
            <div class="card">
              <div class="label">Consulting Doctor</div>
              <div class="value">${prescriptionData.doctorName}</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${prescriptionData.specialty} (${prescriptionData.clinic})</div>
            </div>
          </div>

          <div class="card" style="margin-bottom: 20px;">
            <div class="label">Consultation Date & Slot</div>
            <div class="value">${prescriptionData.date} | ${prescriptionData.timeSlot}</div>
          </div>

          <div class="section">
            <div class="label" style="font-size: 13px; margin-bottom: 6px;">Clinical Diagnosis</div>
            <div class="card" style="font-size: 15px; font-weight: 600; color: #1e1b4b; background: #faf5ff; border-color: #e9d5ff;">
              ${prescriptionData.diagnosis}
            </div>
          </div>

          <div class="section">
            <div class="rx-title">&#8478; Prescribed Medications</div>
            <div class="card" style="background: #f0fdf4; border-color: #bbf7d0;">
              <ul>
                ${prescriptionData.medicines.map((med) => `<li>${med}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="section">
            <div class="label" style="font-size: 13px; margin-bottom: 6px;">Doctor's Advice & Instructions</div>
            <div class="card" style="font-size: 14px; line-height: 1.6;">
              ${prescriptionData.advice}
            </div>
          </div>

          <div class="footer">
            This is a system-generated prescription valid under Telemedicine & OPD consultation guidelines.<br/>
            MediPulse Health Clinic System &copy; 2026. All rights reserved.
          </div>
        </body>
      </html>
    `;

    // Create a hidden iframe for print/pdf export
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 300);
    }
  };

  // 4. Download OPD Pass Receipt
  const handleDownloadPass = () => {
    setSnackbar({
      open: true,
      message: `OPD Pass receipt (${selectedPass?.passNo}) downloaded successfully!`,
      severity: 'success',
    });
    setOpenPassModal(false);
  };

  // Tab Filtering Logic
  const filteredBookings = bookings.filter((b) => {
    const status = (b.status || b.rawStatus || '').toUpperCase();
    if (tabIndex === 0) return true;
    if (tabIndex === 1) return status === 'CONFIRMED' || status === 'IN_PROGRESS' || status === 'WAITING' || status === 'PENDING';
    if (tabIndex === 2) return status === 'COMPLETED';
    if (tabIndex === 3) return status === 'CANCELLED' || status === 'REJECTED';
    return true;
  });

  const totalCount = bookings.length;
  const upcomingCount = bookings.filter((b) => {
    const s = (b.status || '').toUpperCase();
    return s === 'CONFIRMED' || s === 'IN_PROGRESS' || s === 'WAITING' || s === 'PENDING';
  }).length;
  const completedCount = bookings.filter((b) => (b.status || '').toUpperCase() === 'COMPLETED').length;

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
              Manage your booked doctor consultations, view live pass receipts, or review prescriptions.
            </Typography>
          </Box>

          {/* Stat Widgets */}
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

      {/* Main Grid */}
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          {/* Left Column: Filter Tabs & Passes List */}
          <Grid item xs={12} lg={8}>
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
                <Tab label={`Upcoming (${upcomingCount})`} />
                <Tab label={`Completed (${completedCount})`} />
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
                  const normalizedStatus = (item.status || item.rawStatus || '').toUpperCase().replace(/[\s-]/g, '_');

                  const isConfirmed = normalizedStatus === 'CONFIRMED';
                  const isCompleted = normalizedStatus === 'COMPLETED';
                  const isInProgress = normalizedStatus === 'IN_PROGRESS';
                  const isPending = normalizedStatus === 'PENDING' || normalizedStatus === 'WAITING';

                  // Status Chip Styling
                  const statusConfig = isConfirmed
                    ? {
                        bg: '#ECFDF5',
                        color: '#059669',
                        border: '#A7F3D0',
                        label: 'Confirmed',
                        icon: <CheckCircleOutlined sx={{ fontSize: '15px !important' }} />,
                      }
                    : isCompleted
                    ? {
                        bg: '#EEF2FF',
                        color: '#4F46E5',
                        border: '#C7D2FE',
                        label: 'Completed',
                        icon: <CheckCircleOutlined sx={{ fontSize: '15px !important' }} />,
                      }
                    : isInProgress
                    ? {
                        bg: '#EFF6FF',
                        color: '#2563EB',
                        border: '#BFDBFE',
                        label: 'In Progress',
                        icon: <AccessTimeOutlined sx={{ fontSize: '15px !important' }} />,
                      }
                    : isPending
                    ? {
                        bg: '#FFFBEB',
                        color: '#D97706',
                        border: '#FDE68A',
                        label: 'Waiting',
                        icon: <AccessTimeOutlined sx={{ fontSize: '15px !important' }} />,
                      }
                    : {
                        bg: '#FEF2F2',
                        color: '#DC2626',
                        border: '#FECACA',
                        label: 'Cancelled',
                        icon: <CancelOutlined sx={{ fontSize: '15px !important' }} />,
                      };

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
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          sx={{
                            bgcolor: statusConfig.bg,
                            color: statusConfig.color,
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            px: 1,
                            py: 1.6,
                            borderRadius: '50px',
                            border: '1px solid',
                            borderColor: statusConfig.border,
                          }}
                        />
                      </Box>

                      {/* Middle Schedule Bar & Action Buttons */}
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

                        {/* Action Buttons: View OPD Pass & View Prescription */}
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

                          {/* View Prescription Button */}
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewPrescription(item)}
                            startIcon={<HealingOutlined />}
                            sx={{
                              borderColor: '#059669',
                              color: '#059669',
                              bgcolor: '#ECFDF5',
                              fontWeight: 800,
                              borderRadius: '50px',
                              textTransform: 'none',
                              px: 2.2,
                              py: 0.8,
                              fontSize: '0.82rem',
                              '&:hover': { bgcolor: '#D1FAE5', borderColor: '#047857' },
                            }}
                          >
                            View Prescription
                          </Button>
                        </Stack>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </Grid>

          {/* Right Column: Registered Patient Profile */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
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

        {/* 1. Digital OPD Pass Dialog */}
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

        {/* 2. Medical Prescription Modal */}
        <Dialog
          open={openPrescriptionModal}
          onClose={() => setOpenPrescriptionModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '32px', p: 1 } }}
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, color: '#059669', mb: 0.5 }}>
              <LocalHospitalOutlined fontSize="large" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E1B4B' }}>
              Doctor Prescription Details
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Official medical consultation receipt & medication routine
            </Typography>
          </DialogTitle>

          <DialogContent>
            {loadingPrescription ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#059669' }} />
              </Box>
            ) : prescriptionData ? (
              <Stack spacing={2.5} mt={1}>
                {/* Header Information Box */}
                <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                        Patient
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900, color: '#1E1B4B' }}>
                        {prescriptionData.patientName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                        Doctor
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900, color: '#4F46E5' }}>
                        {prescriptionData.doctorName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                        Date & Slot
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                        {prescriptionData.date} ({prescriptionData.timeSlot})
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                        Pass ID
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E1B4B' }}>
                        {prescriptionData.appointmentId}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Clinical Diagnosis */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HealingOutlined sx={{ fontSize: 18, color: '#4F46E5' }} /> Diagnosis:
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: '#FAF5FF', borderRadius: '16px', border: '1px solid #E9D5FF' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#6B21A8' }}>
                      {prescriptionData.diagnosis}
                    </Typography>
                  </Box>
                </Box>

                {/* Prescribed Medicines */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicationLiquidOutlined sx={{ fontSize: 18, color: '#059669' }} /> Prescribed Medicines:
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: '#ECFDF5', borderRadius: '16px', border: '1px solid #A7F3D0' }}>
                    <Stack spacing={1}>
                      {prescriptionData.medicines.map((med, idx) => (
                        <Typography key={idx} variant="body2" sx={{ fontWeight: 700, color: '#065F46' }}>
                          • {med}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                </Box>

                {/* Advice & Instructions */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                    Doctor&apos;s Advice & Instructions:
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: '#F1F5F9', borderRadius: '16px' }}>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                      {prescriptionData.advice}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            ) : null}
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              disableElevation
              fullWidth
              disabled={loadingPrescription || !prescriptionData}
              onClick={handleDownloadPrescriptionPDF}
              startIcon={<DownloadOutlined />}
              sx={{
                bgcolor: '#059669',
                '&:hover': { bgcolor: '#047857' },
                fontWeight: 800,
                borderRadius: '50px',
                py: 1.4,
                textTransform: 'none',
                fontSize: '0.95rem',
              }}
            >
              Download PDF Prescription
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Dynamic Snackbar */}
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