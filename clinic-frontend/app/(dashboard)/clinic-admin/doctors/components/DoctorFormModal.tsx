'use client';
import React, { useState, useEffect } from 'react';
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

interface DoctorData {
  _id?: string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  specialization?: string;
  consultationFee?: number;
  experienceYears?: number;
}

interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  doctorToEdit?: DoctorData | null;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function DoctorFormModal({
  open,
  onClose,
  doctorToEdit,
  onSuccess,
  onError,
}: DoctorFormModalProps) {
  const isEdit = Boolean(doctorToEdit?._id);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'General Physician',
    experienceYears: '',
    consultationFee: '',
  });

  // Prefill form when editing or reset when adding
  useEffect(() => {
    if (doctorToEdit) {
      setForm({
        name: doctorToEdit.userId?.name || '',
        email: doctorToEdit.userId?.email || '',
        password: '',
        phone: doctorToEdit.userId?.phone || '',
        specialization: doctorToEdit.specialization || 'General Physician',
        experienceYears: doctorToEdit.experienceYears?.toString() || '5',
        consultationFee: doctorToEdit.consultationFee?.toString() || '500',
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: 'General Physician',
        experienceYears: '5',
        consultationFee: '500',
      });
    }
  }, [doctorToEdit, open]);

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

  // Submit Handler (Add or Update)
  const handleSubmit = async () => {
    if (!form.name || !form.email || (!isEdit && !form.password) || !form.specialization || !form.consultationFee) {
      if (onError) onError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const baseUrl = API_ENDPOINTS?.CLINIC_ADMIN?.DOCTORS || '/clinic/doctors';

      if (isEdit && doctorToEdit?._id) {
        // Edit Doctor API Call
        const payload = {
          name: form.name,
          phone: form.phone,
          specialization: form.specialization,
          consultationFee: Number(form.consultationFee),
          experienceYears: Number(form.experienceYears) || 1,
        };
        await api.put(`${baseUrl}/${doctorToEdit._id}`, payload);
        if (onSuccess) onSuccess('Doctor updated successfully!');
      } else {
        // Add Doctor API Call
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          specialization: form.specialization,
          experienceYears: Number(form.experienceYears) || 1,
          consultationFee: Number(form.consultationFee),
        };
        await api.post(baseUrl, payload);
        if (onSuccess) onSuccess('Doctor onboarded successfully!');
      }

      onClose();
    } catch (err: any) {
      if (onError) onError(err?.response?.data?.message || 'Failed to save doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: dialogSx }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
          {isEdit ? 'Edit Doctor Details' : 'Add New Doctor'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#334155', px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Doctor Name *"
            placeholder="Dr. John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          />

          <TextField
            fullWidth
            select
            label="Specialization *"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          >
            <MenuItem value="General Physician">General Physician</MenuItem>
            <MenuItem value="Dermatologist">Dermatologist</MenuItem>
            <MenuItem value="Cardiologist">Cardiologist</MenuItem>
            <MenuItem value="Pediatrician">Pediatrician</MenuItem>
            <MenuItem value="Orthopedic">Orthopedic</MenuItem>
            <MenuItem value="Neurologist">Neurologist</MenuItem>
            <MenuItem value="Dentist">Dentist</MenuItem>
          </TextField>

          <TextField
            fullWidth
            type="email"
            label="Email Address *"
            placeholder="doctor@medipulse.com"
            disabled={isEdit}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          />

          {!isEdit && (
            <TextField
              fullWidth
              type="password"
              label="Temporary Password *"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
          )}

          <TextField
            fullWidth
            label="Phone Number"
            placeholder="+91 98765 00000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          />

          <TextField
            fullWidth
            type="number"
            label="Experience (Years)"
            placeholder="5"
            value={form.experienceYears}
            onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          />

          <TextField
            fullWidth
            type="number"
            label="Consultation Fee (₹) *"
            placeholder="500"
            value={form.consultationFee}
            onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ color: '#94A3B8' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: '#006D77',
            '&:hover': { bgcolor: '#004D54' },
            fontWeight: 700,
            px: 3,
          }}
        >
          {loading ? (
            <CircularProgress size={22} sx={{ color: '#FFFFFF' }} />
          ) : isEdit ? (
            'Update Doctor'
          ) : (
            'Save Doctor'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}