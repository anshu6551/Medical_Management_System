'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  Box,
  Rating,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Close, Star } from '@mui/icons-material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface ModalsProps {
  openDoctor: boolean;
  setOpenDoctor: (val: boolean) => void;
  openAppt: boolean;
  setOpenAppt: (val: boolean) => void;
  openSchedule: boolean;
  setOpenSchedule: (val: boolean) => void;
  openBilling: boolean;
  setOpenBilling: (val: boolean) => void;
  openFeedback: boolean;
  setOpenFeedback: (val: boolean) => void;
  onSuccess?: () => void;
}

interface DoctorItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
  };
  specialization?: string;
  consultationFee?: number;
  availableDays?: string[];
}

interface InvoiceItem {
  invoiceId: string;
  patientName: string;
  doctorName: string;
  amount: number;
  mode: string;
  status: string;
}

interface DoctorFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialization: string;
  consultationFee: string;
  experienceYears: string;
  profileImage: File | null;
}

export default function Modals({
  openDoctor,
  setOpenDoctor,
  openAppt,
  setOpenAppt,
  openSchedule,
  setOpenSchedule,
  openBilling,
  setOpenBilling,
  openFeedback,
  setOpenFeedback,
  onSuccess,
}: ModalsProps) {
  const dialogSx = {
    bgcolor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #334155',
    minWidth: { xs: '90%', sm: '550px' },
  };

  const inputStyle = {
    color: '#FFFFFF',
    bgcolor: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
  };

  // Common State
  const [loading, setLoading] = useState(false);
  const [doctorsList, setDoctorsList] = useState<DoctorItem[]>([]);
  const [invoicesList, setInvoicesList] = useState<InvoiceItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

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

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // Form States
  const [doctorForm, setDoctorForm] = useState<DoctorFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    consultationFee: '',
    experienceYears: '',
    profileImage: null,
  });

  const [apptForm, setApptForm] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    slotTime: '10:30 AM',
    type: 'General Checkup',
  });

  // Form Error States
  const [doctorErrors, setDoctorErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    consultationFee: '',
    profileImage: '',
  });

  const [apptErrors, setApptErrors] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    doctorId: '',
    slotTime: '',
  });

  // Validation Patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  const validateDoctorForm = (form: DoctorFormData) => {
    const errors = {
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      consultationFee: '',
      profileImage: '',
    };

    if (!form.name || !form.name.trim()) {
      errors.name = 'Doctor name is required';
    }

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (!form.phone || !form.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!form.email || !form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      errors.password = 'Password is required';
    } else if (!passwordRegex.test(form.password)) {
      errors.password =
        'Must be 8+ chars with uppercase, lowercase, number & special char';
    }

    if (!form.specialization || !form.specialization.trim()) {
      errors.specialization = 'Specialization is required';
    }

    if (!form.profileImage) {
      errors.profileImage = 'Profile image is required';
    }

    const feeNumber = Number(form.consultationFee);
    if (!form.consultationFee || isNaN(feeNumber) || feeNumber <= 0) {
      errors.consultationFee = 'Please enter a valid fee amount';
    }

    setDoctorErrors(errors);
    return Object.values(errors).every((err) => err === '');
  };

  const validateApptForm = () => {
    let isValid = true;
    const errors = {
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      doctorId: '',
      slotTime: '',
    };

    if (!apptForm.patientName.trim()) {
      errors.patientName = 'Patient name is required';
      isValid = false;
    }

    if (
      apptForm.patientEmail &&
      !emailRegex.test(apptForm.patientEmail.trim())
    ) {
      errors.patientEmail = 'Please enter a valid email address';
      isValid = false;
    }

    const cleanPhone = apptForm.patientPhone.replace(/\D/g, '');
    if (apptForm.patientPhone && !phoneRegex.test(cleanPhone)) {
      errors.patientPhone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    if (!apptForm.doctorId) {
      errors.doctorId = 'Please select a doctor';
      isValid = false;
    }

    if (!apptForm.slotTime.trim()) {
      errors.slotTime = 'Time slot is required';
      isValid = false;
    }

    setApptErrors(errors);
    return isValid;
  };

  const [scheduleForm, setScheduleForm] = useState({
    doctorId: '',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '10:00',
    endTime: '17:00',
    slotDuration: '15',
  });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setScheduleForm((prev) => {
      const exists = prev.availableDays.includes(day);
      return {
        ...prev,
        availableDays: exists
          ? prev.availableDays.filter((d) => d !== day)
          : [...prev.availableDays, day],
      };
    });
  };

  // Fetch Doctors for Dropdowns
  const fetchDoctors = useCallback(async () => {
    try {
      setLoadingData(true);
      const url = API_ENDPOINTS?.CLINIC_ADMIN?.DOCTORS || '/clinic/doctors';
      const res = await api.get(url);
      if (res.data?.success && res.data?.data) {
        setDoctorsList(res.data.data);
      }
    } catch {
      // Handled silently
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Fetch Invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoadingData(true);
      const url = API_ENDPOINTS?.CLINIC_ADMIN?.INVOICES || '/clinic/invoices';
      const res = await api.get(url);
      if (res.data?.success && res.data?.data) {
        setInvoicesList(res.data.data);
      }
    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message || 'Failed to fetch invoices',
        'error'
      );
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (openDoctor || openAppt || openSchedule) {
      fetchDoctors();
    }
    if (openBilling) {
      fetchInvoices();
    }
  }, [
    openDoctor,
    openAppt,
    openSchedule,
    openBilling,
    fetchDoctors,
    fetchInvoices,
  ]);

  // Handle Save Doctor
  const handleSaveDoctor = async () => {
    if (!validateDoctorForm(doctorForm)) {
      showSnackbar('Please fix the errors in the form', 'warning');
      return;
    }

    try {
      setLoading(true);
      const url = API_ENDPOINTS?.CLINIC_ADMIN?.DOCTORS || '/clinic/doctors';

      const formData = new FormData();
      formData.append('name', doctorForm.name.trim());
      formData.append('email', doctorForm.email.trim());
      formData.append('password', doctorForm.password);
      formData.append('phone', doctorForm.phone.trim());
      formData.append('specialization', doctorForm.specialization.trim());
      formData.append('experienceYears', doctorForm.experienceYears || '1');
      formData.append('consultationFee', doctorForm.consultationFee);

      if (doctorForm.profileImage) {
        formData.append('profileImage', doctorForm.profileImage);
      }

      const res = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        showSnackbar('Doctor onboarded successfully!', 'success');
        setOpenDoctor(false);
        setDoctorForm({
          name: '',
          email: '',
          password: '',
          phone: '',
          specialization: '',
          consultationFee: '',
          experienceYears: '',
          profileImage: null,
        });
        setDoctorErrors({
          name: '',
          email: '',
          password: '',
          phone: '',
          specialization: '',
          consultationFee: '',
          profileImage: '',
        });
        fetchDoctors();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message || 'Failed to add doctor',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Book Appointment
  const handleBookAppointment = async () => {
    if (!validateApptForm()) {
      showSnackbar('Please fix the errors in the form', 'warning');
      return;
    }

    try {
      setLoading(true);
      const patientRes = await api.post(
        API_ENDPOINTS?.CLINIC_ADMIN?.PATIENTS || '/clinic/patients',
        {
          name: apptForm.patientName.trim(),
          email: apptForm.patientEmail.trim() || `${Date.now()}@patient.com`,
          phone: apptForm.patientPhone.trim() || '9876543210',
        }
      );

      const patientId = patientRes.data?.data?._id;

      const url =
        API_ENDPOINTS?.CLINIC_ADMIN?.APPOINTMENTS || '/clinic/appointments';
      const res = await api.post(url, {
        patientId,
        doctorId: apptForm.doctorId,
        appointmentDate: apptForm.appointmentDate,
        timeSlot: apptForm.slotTime,
        slotTime: apptForm.slotTime,
        type: apptForm.type,
      });

      if (res.data?.success) {
        showSnackbar('Walk-in appointment booked successfully!', 'success');
        setOpenAppt(false);
        setApptForm({
          patientName: '',
          patientEmail: '',
          patientPhone: '',
          doctorId: '',
          appointmentDate: new Date().toISOString().split('T')[0],
          slotTime: '10:30 AM',
          type: 'General Checkup',
        });
        setApptErrors({
          patientName: '',
          patientEmail: '',
          patientPhone: '',
          doctorId: '',
          slotTime: '',
        });
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message || 'Failed to book appointment',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Schedule
  const handleUpdateSchedule = async () => {
    if (!scheduleForm.doctorId) {
      showSnackbar('Please select a doctor', 'warning');
      return;
    }
    if (scheduleForm.availableDays.length === 0) {
      showSnackbar('Please select at least one working day', 'warning');
      return;
    }

    try {
      setLoading(true);
      const url = `${API_ENDPOINTS?.CLINIC_ADMIN?.DOCTORS || '/clinic/doctors'}/${scheduleForm.doctorId}/schedule`;
      await api.patch(url, {
        availableDays: scheduleForm.availableDays,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        slotDuration: Number(scheduleForm.slotDuration),
      });

      showSnackbar('Doctor schedule & slots updated successfully!', 'success');
      setOpenSchedule(false);
    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message || 'Failed to update doctor schedule',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. Add Doctor Modal */}
      <Dialog
        open={openDoctor}
        onClose={() => {
          setOpenDoctor(false);
          setDoctorErrors({
            name: '',
            email: '',
            password: '',
            phone: '',
            specialization: '',
            consultationFee: '',
            profileImage: '',
          });
        }}
        PaperProps={{ sx: dialogSx }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Add New Doctor{' '}
          <IconButton
            onClick={() => setOpenDoctor(false)}
            sx={{ color: '#94A3B8' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#334155' }}>
          <Stack spacing={2} mt={1}>
            <TextField
              fullWidth
              label="Doctor Name *"
              placeholder="Dr. John Doe"
              value={doctorForm.name}
              error={!!doctorErrors.name}
              helperText={doctorErrors.name}
              onChange={(e) => {
                setDoctorForm({ ...doctorForm, name: e.target.value });
                if (doctorErrors.name)
                  setDoctorErrors({ ...doctorErrors, name: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              type="email"
              label="Doctor Email *"
              placeholder="doctor@clinic.com"
              value={doctorForm.email}
              error={!!doctorErrors.email}
              helperText={doctorErrors.email}
              onChange={(e) => {
                setDoctorForm({ ...doctorForm, email: e.target.value });
                if (doctorErrors.email)
                  setDoctorErrors({ ...doctorErrors, email: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              type="password"
              label="Initial Password *"
              placeholder="••••••••"
              value={doctorForm.password}
              error={!!doctorErrors.password}
              helperText={doctorErrors.password}
              onChange={(e) => {
                setDoctorForm({ ...doctorForm, password: e.target.value });
                if (doctorErrors.password)
                  setDoctorErrors({ ...doctorErrors, password: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              label="Phone Number *"
              placeholder="9876543210"
              value={doctorForm.phone}
              error={!!doctorErrors.phone}
              helperText={doctorErrors.phone}
              onChange={(e) => {
                setDoctorForm({ ...doctorForm, phone: e.target.value });
                if (doctorErrors.phone)
                  setDoctorErrors({ ...doctorErrors, phone: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              label="Specialization *"
              placeholder="e.g. General Physician, Cardiologist"
              value={doctorForm.specialization}
              error={!!doctorErrors.specialization}
              helperText={doctorErrors.specialization}
              onChange={(e) => {
                setDoctorForm({
                  ...doctorForm,
                  specialization: e.target.value,
                });
                if (doctorErrors.specialization)
                  setDoctorErrors({ ...doctorErrors, specialization: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              type="number"
              label="Experience (Years)"
              placeholder="5"
              value={doctorForm.experienceYears}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  experienceYears: e.target.value,
                })
              }
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              type="number"
              label="Consultation Fee (₹) *"
              placeholder="500"
              value={doctorForm.consultationFee}
              error={!!doctorErrors.consultationFee}
              helperText={doctorErrors.consultationFee}
              onChange={(e) => {
                setDoctorForm({
                  ...doctorForm,
                  consultationFee: e.target.value,
                });
                if (doctorErrors.consultationFee)
                  setDoctorErrors({ ...doctorErrors, consultationFee: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              type="file"
              error={!!doctorErrors.profileImage}
              helperText={doctorErrors.profileImage}
              inputProps={{ accept: 'image/*' }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0] || null;
                setDoctorForm({ ...doctorForm, profileImage: file });
                if (doctorErrors.profileImage) {
                  setDoctorErrors({ ...doctorErrors, profileImage: '' });
                }
              }}
              InputLabelProps={{ shrink: true, sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDoctor(false)}
            sx={{ color: '#94A3B8' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveDoctor}
            disabled={loading}
            sx={{ bgcolor: '#006D77', '&:hover': { bgcolor: '#004D54' } }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: '#FFF' }} />
            ) : (
              'Save Doctor'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Book Walk-in Appointment Modal */}
      <Dialog
        open={openAppt}
        onClose={() => {
          setOpenAppt(false);
          setApptErrors({
            patientName: '',
            patientEmail: '',
            patientPhone: '',
            doctorId: '',
            slotTime: '',
          });
        }}
        PaperProps={{ sx: dialogSx }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Book Walk-In Appointment{' '}
          <IconButton
            onClick={() => setOpenAppt(false)}
            sx={{ color: '#94A3B8' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#334155' }}>
          <Stack spacing={2} mt={1}>
            <TextField
              fullWidth
              label="Patient Name *"
              placeholder="Rahul Sharma"
              value={apptForm.patientName}
              error={Boolean(apptErrors.patientName)}
              helperText={apptErrors.patientName}
              onChange={(e) => {
                setApptForm({ ...apptForm, patientName: e.target.value });
                if (apptErrors.patientName)
                  setApptErrors({ ...apptErrors, patientName: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              type="email"
              label="Patient Email"
              placeholder="patient@example.com"
              value={apptForm.patientEmail}
              error={Boolean(apptErrors.patientEmail)}
              helperText={apptErrors.patientEmail}
              onChange={(e) => {
                setApptForm({ ...apptForm, patientEmail: e.target.value });
                if (apptErrors.patientEmail)
                  setApptErrors({ ...apptErrors, patientEmail: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              label="Patient Phone"
              placeholder="+91 98765 43210"
              value={apptForm.patientPhone}
              error={Boolean(apptErrors.patientPhone)}
              helperText={apptErrors.patientPhone}
              onChange={(e) => {
                setApptForm({ ...apptForm, patientPhone: e.target.value });
                if (apptErrors.patientPhone)
                  setApptErrors({ ...apptErrors, patientPhone: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
            <TextField
              fullWidth
              select
              label="Assign Doctor *"
              value={apptForm.doctorId}
              error={Boolean(apptErrors.doctorId)}
              helperText={apptErrors.doctorId}
              onChange={(e) => {
                setApptForm({ ...apptForm, doctorId: e.target.value });
                if (apptErrors.doctorId)
                  setApptErrors({ ...apptErrors, doctorId: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            >
              <MenuItem value="" disabled>
                <em>Select a Doctor</em>
              </MenuItem>
              {doctorsList.map((doc) => (
                <MenuItem key={doc._id} value={doc._id}>
                  Dr. {doc.userId?.name || 'Doctor'} (
                  {doc.specialization || 'General'})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Time Slot *"
              placeholder="10:30 AM"
              value={apptForm.slotTime}
              error={Boolean(apptErrors.slotTime)}
              helperText={apptErrors.slotTime}
              onChange={(e) => {
                setApptForm({ ...apptForm, slotTime: e.target.value });
                if (apptErrors.slotTime)
                  setApptErrors({ ...apptErrors, slotTime: '' });
              }}
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenAppt(false)}
            sx={{ color: '#94A3B8' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBookAppointment}
            disabled={loading}
            sx={{ bgcolor: '#006D77', '&:hover': { bgcolor: '#004D54' } }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: '#FFF' }} />
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. Manage Doctor Schedule & Slots Modal */}
      <Dialog
        open={openSchedule}
        onClose={() => setOpenSchedule(false)}
        PaperProps={{ sx: dialogSx }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Manage Doctor Schedule & Slots
          <IconButton
            onClick={() => setOpenSchedule(false)}
            sx={{ color: '#94A3B8' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#334155' }}>
          <Stack spacing={2.5} mt={1}>
            <TextField
              fullWidth
              select
              label="Select Doctor *"
              value={scheduleForm.doctorId}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  doctorId: e.target.value,
                })
              }
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            >
              <MenuItem value="" disabled>
                <em>Select a Doctor</em>
              </MenuItem>
              {doctorsList.map((doc) => (
                <MenuItem key={doc._id} value={doc._id}>
                  Dr. {doc.userId?.name || 'Doctor'} (
                  {doc.specialization || 'General'})
                </MenuItem>
              ))}
            </TextField>

            <Box>
              <Typography
                variant="body2"
                sx={{ color: '#94A3B8', mb: 1, fontWeight: 600 }}
              >
                Available Working Days
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {weekDays.map((day) => {
                  const isSelected = scheduleForm.availableDays.includes(day);
                  return (
                    <Button
                      key={day}
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => toggleDay(day)}
                      sx={{
                        borderRadius: '8px',
                        minWidth: '45px',
                        bgcolor: isSelected ? '#006D77' : 'transparent',
                        borderColor: isSelected ? '#006D77' : '#334155',
                        color: isSelected ? '#FFFFFF' : '#94A3B8',
                        '&:hover': {
                          bgcolor: isSelected
                            ? '#004D54'
                            : 'rgba(255,255,255,0.05)',
                        },
                      }}
                    >
                      {day}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                type="time"
                label="Shift Start Time"
                value={scheduleForm.startTime}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    startTime: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true, sx: { color: '#94A3B8' } }}
                InputProps={{ sx: inputStyle }}
              />
              <TextField
                fullWidth
                type="time"
                label="Shift End Time"
                value={scheduleForm.endTime}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    endTime: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true, sx: { color: '#94A3B8' } }}
                InputProps={{ sx: inputStyle }}
              />
            </Box>

            <TextField
              fullWidth
              select
              label="Consultation Slot Duration"
              value={scheduleForm.slotDuration}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  slotDuration: e.target.value,
                })
              }
              InputLabelProps={{ sx: { color: '#94A3B8' } }}
              InputProps={{ sx: inputStyle }}
            >
              <MenuItem value="10">10 Minutes per Patient</MenuItem>
              <MenuItem value="15">
                15 Minutes per Patient (Recommended)
              </MenuItem>
              <MenuItem value="20">20 Minutes per Patient</MenuItem>
              <MenuItem value="30">30 Minutes per Patient</MenuItem>
              <MenuItem value="45">45 Minutes per Patient</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenSchedule(false)}
            sx={{ color: '#94A3B8' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateSchedule}
            disabled={loading}
            sx={{ bgcolor: '#006D77', '&:hover': { bgcolor: '#004D54' } }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: '#FFF' }} />
            ) : (
              'Update Schedule'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. Billing Summary Modal */}
      <Dialog
        open={openBilling}
        onClose={() => setOpenBilling(false)}
        PaperProps={{
          sx: { ...dialogSx, minWidth: { xs: '90%', sm: '500px' } },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Clinic Invoices Summary{' '}
          <IconButton
            onClick={() => setOpenBilling(false)}
            sx={{ color: '#94A3B8' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#334155' }}>
          {loadingData ? (
            <Box textAlign="center" py={3}>
              <CircularProgress size={24} sx={{ color: '#83C5BE' }} />
            </Box>
          ) : invoicesList.length === 0 ? (
            <Typography color="#94A3B8" textAlign="center" py={2}>
              No invoices generated yet.
            </Typography>
          ) : (
            <List>
              {invoicesList.slice(0, 5).map((inv, idx) => (
                <ListItem key={idx} sx={{ borderBottom: '1px solid #334155' }}>
                  <ListItemText
                    primary={`${inv.patientName} - ${inv.doctorName}`}
                    secondary={`₹${inv.amount} | ${inv.status} (${inv.mode})`}
                    primaryTypographyProps={{ color: '#FFF', fontWeight: 600 }}
                    secondaryTypographyProps={{
                      color:
                        inv.status?.toLowerCase() === 'paid'
                          ? '#4ADE80'
                          : '#FBBF24',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenBilling(false)}
            sx={{ bgcolor: '#006D77', '&:hover': { bgcolor: '#004D54' } }}
          >
            Close Summary
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. Patient Feedback Modal */}
      <Dialog
        open={openFeedback}
        onClose={() => setOpenFeedback(false)}
        PaperProps={{
          sx: { ...dialogSx, minWidth: { xs: '90%', sm: '500px' } },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Recent Patient Feedback{' '}
          <IconButton
            onClick={() => setOpenFeedback(false)}
            sx={{ color: '#94A3B8' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#334155' }}>
          <Stack spacing={2} mt={1}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.04)',
                borderRadius: '10px',
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={700}>Amitav Ghosh</Typography>
                <Rating
                  value={5}
                  readOnly
                  size="small"
                  emptyIcon={<Star style={{ color: '#334155' }} />}
                />
              </Box>
              <Typography variant="body2" color="#CBD5E1" mt={1}>
                &quot;Excellent service, Dr. Roy was very detailed and
                friendly!&quot;
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.04)',
                borderRadius: '10px',
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={700}>Priya Verma</Typography>
                <Rating
                  value={4}
                  readOnly
                  size="small"
                  emptyIcon={<Star style={{ color: '#334155' }} />}
                />
              </Box>
              <Typography variant="body2" color="#CBD5E1" mt={1}>
                &quot;Waiting time was slightly long, but consultation was
                great.&quot;
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenFeedback(false)}
            sx={{ bgcolor: '#006D77', '&:hover': { bgcolor: '#004D54' } }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
    </>
  );
}