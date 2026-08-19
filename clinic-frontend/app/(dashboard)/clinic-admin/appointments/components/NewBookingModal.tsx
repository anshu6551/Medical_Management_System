'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Stack,
  Typography,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface DoctorItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
  };
  specialization?: string;
}

interface NewBookingModalProps {
  open: boolean;
  onClose: () => void;
  onAddBooking: (bookingData?: any) => void;
}

export default function NewBookingModal({ open, onClose, onAddBooking }: NewBookingModalProps) {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [type, setType] = useState('General Checkup');

  const [doctorsList, setDoctorsList] = useState<DoctorItem[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Doctors for select dropdown
  const fetchDoctors = useCallback(async () => {
    try {
      setLoadingDoctors(true);
      const url = API_ENDPOINTS?.CLINIC_ADMIN?.DOCTORS || '/clinic/doctors';
      const res = await api.get(url);
      if (res.data?.success && res.data?.data) {
        setDoctorsList(res.data.data);
        if (res.data.data.length > 0 && !doctorId) {
          setDoctorId(res.data.data[0]._id);
        }
      }
    } catch {
      // Handled silently for dropdown population
    } finally {
      setLoadingDoctors(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (open) {
      fetchDoctors();
      setErrorMessage('');
    }
  }, [open, fetchDoctors]);

  const dialogSx = {
    bgcolor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #334155',
  };

  const inputStyle = {
    color: '#FFFFFF',
    bgcolor: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
  };

  // 2. Submit Booking via API
  const handleSubmit = async () => {
    if (!patientName.trim() || !doctorId) {
      setErrorMessage('Patient Name and Doctor selection are required');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      // Step A: Register / Find Patient
      const patientRes = await api.post(API_ENDPOINTS?.CLINIC_ADMIN?.PATIENTS || '/clinic/patients', {
        name: patientName.trim(),
        phone: patientPhone.trim() || '9876543210',
        email: `${Date.now()}@patient.com`,
      });

      const resolvedPatientId = patientRes.data?.data?._id;

      // Step B: Create Appointment
      const apptUrl = API_ENDPOINTS?.CLINIC_ADMIN?.APPOINTMENTS || '/clinic/appointments';
      const res = await api.post(apptUrl, {
        patientId: resolvedPatientId,
        doctorId: doctorId,
        appointmentDate: date,
        timeSlot: timeSlot,
        slotTime: timeSlot,
        type: type,
        status: 'WAITING',
      });

      if (res.data?.success || res.status === 201 || res.status === 200) {
        onAddBooking(res.data?.data);
        setPatientName('');
        setPatientPhone('');
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
          New Appointment Booking
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#334155', px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          {errorMessage && (
            <Typography variant="caption" sx={{ color: '#F87171', bgcolor: 'rgba(239, 68, 68, 0.1)', p: 1, borderRadius: '8px' }}>
              {errorMessage}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Patient Name *"
            placeholder="e.g. Ramesh Kumar"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          />

          <TextField
            fullWidth
            label="Patient Phone"
            placeholder="+91 98765 43210"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          />

          <TextField
            fullWidth
            select
            label="Select Doctor *"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          >
            {loadingDoctors ? (
              <MenuItem disabled value="">
                Loading doctors list...
              </MenuItem>
            ) : doctorsList.length === 0 ? (
              <MenuItem disabled value="">
                No active doctors available
              </MenuItem>
            ) : (
              doctorsList.map((doc) => (
                <MenuItem key={doc._id} value={doc._id}>
                  Dr. {doc.userId?.name || 'Doctor'} ({doc.specialization || 'General'})
                </MenuItem>
              ))
            )}
          </TextField>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="Booking Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true, sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />

            <TextField
              fullWidth
              select
              label="Time Slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            >
              <MenuItem value="09:30 AM">09:30 AM</MenuItem>
              <MenuItem value="10:00 AM">10:00 AM</MenuItem>
              <MenuItem value="10:30 AM">10:30 AM</MenuItem>
              <MenuItem value="11:00 AM">11:00 AM</MenuItem>
              <MenuItem value="11:30 AM">11:30 AM</MenuItem>
              <MenuItem value="02:00 PM">02:00 PM</MenuItem>
              <MenuItem value="03:30 PM">03:30 PM</MenuItem>
              <MenuItem value="04:30 PM">04:30 PM</MenuItem>
            </TextField>
          </Stack>

          <TextField
            fullWidth
            select
            label="Visit Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          >
            <MenuItem value="General Checkup">General Checkup</MenuItem>
            <MenuItem value="Follow Up">Follow Up</MenuItem>
            <MenuItem value="Emergency / OPD">Emergency / OPD</MenuItem>
            <MenuItem value="Consultation">Consultation</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: '#94A3B8' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ bgcolor: '#006D77', '&:hover': { bgcolor: '#004D54' }, fontWeight: 700, px: 3 }}
        >
          {submitting ? <CircularProgress size={22} sx={{ color: '#FFF' }} /> : 'Confirm Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}