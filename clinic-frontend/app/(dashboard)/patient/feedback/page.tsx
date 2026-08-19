'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Rating,
  Stack,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { RateReviewOutlined, SendOutlined } from '@mui/icons-material';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api/axios';

interface CompletedVisit {
  _id: string;
  appointmentId?: string;
  doctorName: string;
  specialization: string;
  slotTime: string;
  appointmentDate: string;
}

export default function PatientFeedbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryAppointmentId = searchParams.get('appointmentId');

  const [rating, setRating] = useState<number | null>(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Completed Appointments for Selection
  const [completedVisits, setCompletedVisits] = useState<CompletedVisit[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(queryAppointmentId || '');

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 1. Fetch Patient's Completed Appointments
  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/patient/appointments');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const completed = res.data.data.filter(
            (apt: any) => (apt.status || '').toUpperCase() === 'COMPLETED'
          );
          setCompletedVisits(completed);

          if (!selectedAppointmentId && completed.length > 0) {
            setSelectedAppointmentId(completed[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load completed appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedAppointments();
  }, []);

  const activeVisit = completedVisits.find((v) => v._id === selectedAppointmentId);

  // 2. Submit Feedback API Call
  const handleSubmit = async () => {
    if (!selectedAppointmentId) {
      setSnackbar({
        open: true,
        message: 'Please select a completed appointment to review.',
        severity: 'error',
      });
      return;
    }

    if (!rating) {
      setSnackbar({
        open: true,
        message: 'Please provide a star rating.',
        severity: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.put(`/patient/appointments/${selectedAppointmentId}/feedback`, {
        rating,
        comment: feedback,
      });

      if (res.data?.success) {
        setSnackbar({
          open: true,
          message: 'Thank you! Your feedback has been submitted successfully.',
          severity: 'success',
        });
        setFeedback('');
        setTimeout(() => {
          router.push('/patient/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Submit Feedback Error:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to submit feedback. Try again.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
          Rate Your OPD Experience
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
          Your feedback helps doctors and clinics improve patient care quality.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#83C5BE' }} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Appointment Selector (if patient has multiple completed visits) */}
            {completedVisits.length > 1 && (
              <TextField
                select
                fullWidth
                label="Select Completed Consultation"
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                slotProps={{
                  inputLabel: { sx: { color: '#94A3B8' } },
                  input: { sx: { color: '#FFF', bgcolor: '#0F172A', borderRadius: '12px' } },
                }}
              >
                {completedVisits.map((visit) => (
                  <MenuItem key={visit._id} value={visit._id}>
                    {visit.doctorName} ({visit.specialization}) - {visit.slotTime}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFF', mb: 1 }}>
                How satisfied were you with {activeVisit ? activeVisit.doctorName : 'your Doctor'}?
              </Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Write your detailed experience"
              placeholder="Mention diagnosis accuracy, waiting time, and clinic hygiene..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              slotProps={{
                inputLabel: { sx: { color: '#94A3B8' } },
                input: { sx: { color: '#FFF', bgcolor: '#0F172A', borderRadius: '12px' } },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendOutlined />}
                sx={{
                  bgcolor: '#006D77',
                  '&:hover': { bgcolor: '#004D54' },
                  fontWeight: 700,
                  px: 4,
                  py: 1.2,
                  borderRadius: '12px',
                  textTransform: 'none',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </Box>
          </Stack>
        )}
      </Paper>

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
          sx={{ width: '100%', borderRadius: '12px', fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}