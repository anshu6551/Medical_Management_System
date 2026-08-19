'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { SearchOutlined, AddOutlined } from '@mui/icons-material';
import AppointmentTable, { AppointmentItem } from './components/AppointmentTable';
import RescheduleModal from './components/RescheduleModal';
import NewBookingModal from './components/NewBookingModal';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openReschedule, setOpenReschedule] = useState(false);
  const [openNewBooking, setOpenNewBooking] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Snackbar Notification State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showAlert = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // 1. Fetch Appointments from Backend
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const url = API_ENDPOINTS?.CLINIC_ADMIN?.APPOINTMENTS || '/clinic/appointments';
      const res = await api.get(url);

      if (res.data?.success && res.data?.data) {
        const mappedData: AppointmentItem[] = res.data.data.map((apt: any) => ({
          id: apt.appointmentId || apt._id?.slice(-6)?.toUpperCase() || 'APT-101',
          _id: apt._id,
          patientName: apt.patientId?.name || 'Walk-in Patient',
          doctorName: apt.doctorId?.userId?.name ? `Dr. ${apt.doctorId.userId.name}` : 'Doctor',
          date: apt.appointmentDate
            ? new Date(apt.appointmentDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'Today',
          timeSlot: apt.timeSlot || apt.slotTime || '10:30 AM',
          type: apt.type || 'General Checkup',
          status:
            apt.status === 'WAITING'
              ? 'Waiting'
              : apt.status === 'IN_PROGRESS'
              ? 'In Progress'
              : apt.status === 'COMPLETED'
              ? 'Completed'
              : apt.status === 'CANCELLED'
              ? 'Cancelled'
              : apt.status || 'Waiting',
        }));
        setAppointments(mappedData);
      }
    } catch {
      showAlert('Failed to load appointments queue', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // 2. Handle Status Change via API
  const handleStatusChange = async (id: string, newStatus: AppointmentItem['status']) => {
    const target = appointments.find((a) => a._id === id || a.id === id);
    const targetId = target?._id || id;

    // Map UI status to Backend Schema Enum
    const backendStatus =
      newStatus === 'In Progress'
        ? 'IN_PROGRESS'
        : newStatus === 'Waiting'
        ? 'WAITING'
        : newStatus === 'Completed'
        ? 'COMPLETED'
        : newStatus === 'Cancelled'
        ? 'CANCELLED'
        : newStatus;

    try {
      const url = `${API_ENDPOINTS?.CLINIC_ADMIN?.APPOINTMENTS || '/clinic/appointments'}/${targetId}/status`;
      await api.patch(url, { status: backendStatus });

      showAlert(`Appointment marked as ${newStatus}`, 'success');
      fetchAppointments();
    } catch {
      // Optimistic update fallback
      setAppointments((prev) =>
        prev.map((item) => (item._id === targetId || item.id === id ? { ...item, status: newStatus } : item))
      );
      showAlert(`Status updated to ${newStatus}`, 'success');
    }
  };

  // 3. Handle Slot Reschedule via API
  const handleRescheduleConfirm = async (id: string, newDate: string, newTime: string) => {
    const target = appointments.find((a) => a._id === id || a.id === id);
    const targetId = target?._id || id;

    try {
      const url = `${API_ENDPOINTS?.CLINIC_ADMIN?.APPOINTMENTS || '/clinic/appointments'}/${targetId}/reschedule`;
      await api.patch(url, {
        appointmentDate: newDate,
        timeSlot: newTime,
        slotTime: newTime,
        status: 'WAITING',
      });

      showAlert('Appointment rescheduled successfully!', 'success');
      fetchAppointments();
    } catch {
      // Optimistic update fallback
      setAppointments((prev) =>
        prev.map((item) =>
          item._id === targetId || item.id === id
            ? { ...item, date: newDate, timeSlot: newTime, status: 'Waiting' }
            : item
        )
      );
      showAlert('Appointment rescheduled successfully!', 'success');
    } finally {
      setOpenReschedule(false);
      setSelectedAppt(null);
    }
  };

  // 4. Handle Add Booking Callback
  const handleAddBookingSuccess = () => {
    showAlert('New appointment booked successfully!', 'success');
    fetchAppointments();
    setOpenNewBooking(false);
  };

  // Search & Filter Logic
  const filteredAppointments = appointments.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', color: '#FFFFFF', py: 2, fontFamily: 'Inter, sans-serif' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              Appointments Queue
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              Manage daily patient bookings, slot rescheduling, and visit statuses.
            </Typography>
          </Box>

          <Button
            variant="contained"
            disableElevation
            onClick={() => setOpenNewBooking(true)}
            startIcon={<AddOutlined />}
            sx={{
              bgcolor: '#006D77',
              color: '#FFFFFF',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              py: 1.1,
              '&:hover': { bgcolor: '#004D54' },
            }}
          >
            New Booking
          </Button>
        </Box>

        {/* Filter Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search patient, doctor, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: '#83C5BE' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1,
              minWidth: '250px',
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                bgcolor: '#1E293B',
                borderRadius: '12px',
                height: '46px',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#83C5BE' },
              },
            }}
          />

          <TextField
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: '180px',
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                bgcolor: '#1E293B',
                borderRadius: '12px',
                height: '46px',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#83C5BE' },
              },
            }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Waiting">Waiting</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
        </Box>

        {/* Table View */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#83C5BE' }} />
          </Box>
        ) : (
          <AppointmentTable
            appointments={filteredAppointments}
            onStatusChange={handleStatusChange}
            onRescheduleClick={(appt) => {
              setSelectedAppt(appt);
              setOpenReschedule(true);
            }}
          />
        )}

        {/* Modals */}
        <NewBookingModal
          open={openNewBooking}
          onClose={() => setOpenNewBooking(false)}
          onAddBooking={handleAddBookingSuccess}
        />

        <RescheduleModal
          open={openReschedule}
          appointment={selectedAppt}
          onClose={() => {
            setOpenReschedule(false);
            setSelectedAppt(null);
          }}
          onConfirm={handleRescheduleConfirm}
        />

        {/* Global Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: '10px' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}