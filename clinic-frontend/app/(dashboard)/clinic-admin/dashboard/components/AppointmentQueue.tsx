'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { EventAvailableOutlined, MoreVertOutlined } from '@mui/icons-material';
import Link from 'next/link';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface QueueItem {
  _id: string;
  appointmentId?: string;
  patientId?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  doctorId?: {
    _id: string;
    userId?: {
      name: string;
    };
  };
  slotTime?: string;
  appointmentDate?: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string;
}

export default function AppointmentQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Action Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<QueueItem | null>(null);

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Fetch Dashboard Today's Queue
  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.CLINIC_ADMIN?.DASHBOARD || '/clinic/dashboard');
      if (res.data?.success && res.data?.data?.todayQueue) {
        setQueue(res.data.data.todayQueue);
      }
    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message || 'Failed to fetch appointment queue',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Menu Handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, apt: QueueItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(apt);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  // Update Status API Call
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedAppointment) return;

    try {
      const endpoint = API_ENDPOINTS.CLINIC_ADMIN?.UPDATE_APPOINTMENT_STATUS 
        ? API_ENDPOINTS.CLINIC_ADMIN.UPDATE_APPOINTMENT_STATUS(selectedAppointment._id)
        : `/clinic/appointments/${selectedAppointment._id}/status`;

      const res = await api.patch(endpoint, { status: newStatus });

      if (res.data?.success) {
        showSnackbar(`Appointment marked as ${newStatus}`, 'success');
        setQueue((prev) =>
          prev.map((item) =>
            item._id === selectedAppointment._id ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message || 'Failed to update status',
        'error'
      );
    } finally {
      handleCloseMenu();
    }
  };

  // Render Status Badge with Colors
  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return <Chip label="In Progress" size="small" color="warning" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'COMPLETED':
        return <Chip label="Completed" size="small" color="success" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'CANCELLED':
        return <Chip label="Cancelled" size="small" color="error" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'WAITING':
      default:
        return <Chip label="Waiting" size="small" color="info" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
    }
  };

  return (
    <Paper sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px', p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventAvailableOutlined sx={{ color: '#83C5BE' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
            Today&apos;s Appointment Queue
          </Typography>
        </Box>
        <Button
          size="small"
          component={Link}
          href="/clinic-admin/appointments"
          sx={{ color: '#83C5BE', textTransform: 'none', fontWeight: 600 }}
        >
          View All
        </Button>
      </Box>

      {/* Table Section */}
      <TableContainer>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow sx={{ '& th': { borderColor: '#334155', color: '#94A3B8', fontWeight: 700, fontSize: '0.8rem' } }}>
              <TableCell>PATIENT</TableCell>
              <TableCell>DOCTOR</TableCell>
              <TableCell>SLOT TIME</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="right">ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, borderColor: '#334155' }}>
                  <CircularProgress size={28} sx={{ color: '#83C5BE' }} />
                  <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
                    Loading today&apos;s queue...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : queue.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, borderColor: '#334155', color: '#94A3B8' }}>
                  No appointments scheduled for today yet.
                </TableCell>
              </TableRow>
            ) : (
              queue.map((row) => (
                <TableRow key={row._id} sx={{ '& td': { borderColor: '#334155', color: '#FFFFFF', py: 1.8 } }}>
                  {/* Patient Info */}
                  <TableCell sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                    {row.patientId?.name || 'Walk-in Patient'}
                    <Typography variant="caption" display="block" sx={{ color: '#94A3B8' }}>
                      {row.appointmentId || `APT-${row._id.slice(-4).toUpperCase()}`}
                    </Typography>
                  </TableCell>

                  {/* Doctor Info */}
                  <TableCell sx={{ color: '#CBD5E1' }}>
                    {row.doctorId?.userId?.name ? `Dr. ${row.doctorId.userId.name}` : 'Doctor Assigned'}
                  </TableCell>

                  {/* Slot Time */}
                  <TableCell sx={{ color: '#CBD5E1' }}>
                    {row.slotTime || '10:00 AM'}
                  </TableCell>

                  {/* Dynamic Status Chip */}
                  <TableCell>
                    {renderStatusBadge(row.status)}
                  </TableCell>

                  {/* Action Button */}
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, row)}
                      sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}
                    >
                      <MoreVertOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Action Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            border: '1px solid #334155',
            borderRadius: '10px',
          },
        }}
      >
        <MenuItem onClick={() => handleUpdateStatus('WAITING')} sx={{ fontSize: '0.85rem' }}>
          Mark as Waiting
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('IN_PROGRESS')} sx={{ fontSize: '0.85rem', color: '#F59E0B' }}>
          Mark In Progress
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('COMPLETED')} sx={{ fontSize: '0.85rem', color: '#10B981' }}>
          Mark as Completed
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('CANCELLED')} sx={{ fontSize: '0.85rem', color: '#EF4444' }}>
          Cancel Appointment
        </MenuItem>
      </Menu>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}