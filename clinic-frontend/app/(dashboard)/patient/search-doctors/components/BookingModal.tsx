


'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Avatar,
  Divider,
  Stack,
  CircularProgress,
  RadioGroup,
  Radio,
  Alert,
} from '@mui/material';
import {
  AccessTimeOutlined,
  LocationOnOutlined,
  AccountBalanceWalletOutlined,
  ArrowBack,
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface BookingModalProps {
  open: boolean;
  doctor: any | null;
  onClose: () => void;
  onConfirmBooking: (appointmentData?: any) => void;
}


// Child Component: Stripe Form

function StripePaymentForm({
  consultFee,
  doctor,
  selectedSlot,
  onSuccess,
  onBack,
}: {
  consultFee: number;
  doctor: any;
  selectedSlot: string;
  onSuccess: (data: any) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/patient/appointments`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setErrorMessage(result.error.message || 'Payment confirmation failed');
        setSubmitting(false);
        return;
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        let storedUser: any = {};
        if (typeof window !== 'undefined') {
          const u = localStorage.getItem('user');
          if (u) {
            try {
              storedUser = JSON.parse(u);
            } catch (err) {}
          }
        }

        const endpoint = API_ENDPOINTS?.PATIENT?.CONFIRM_STRIPE_BOOKING || '/patient/confirm-stripe-booking';
        const verifyRes = await api.post(endpoint, {
          paymentIntentId: result.paymentIntent.id,
          bookingData: {
            doctorId: doctor._id || doctor.id,
            clinicId: doctor.clinicId,
            patientId: storedUser._id || storedUser.id,
            appointmentDate: new Date(),
            timeSlot: selectedSlot,
            type: 'General Checkup',
          },
        });

        if (verifyRes.data?.success) {
          onSuccess(verifyRes.data.data);
        } else {
          setErrorMessage(verifyRes.data?.message || 'Failed to confirm booking on server.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Server error confirming appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <Box sx={{ my: 2 }}>
        <PaymentElement />
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Button
          onClick={onBack}
          disabled={submitting}
          startIcon={<ArrowBack />}
          sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          disableElevation
          disabled={!stripe || submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AccountBalanceWalletOutlined />}
          sx={{
            bgcolor: '#4F46E5',
            '&:hover': { bgcolor: '#4338CA' },
            fontWeight: 800,
            borderRadius: '50px',
            px: 3,
            py: 1,
            textTransform: 'none',
          }}
        >
          {submitting ? 'Processing...' : `Pay ₹${consultFee} & Confirm`}
        </Button>
      </Box>
    </form>
  );
}


// Main Booking Modal Component

export default function BookingModal({
  open,
  doctor,
  onClose,
  onConfirmBooking,
}: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  if (!doctor) return null;

  const consultFee = typeof doctor.fee === 'string'
    ? Number(doctor.fee.replace(/[^0-9]/g, ''))
    : (doctor.fee || doctor.consultationFee || 500);

  const handleProceedToPayment = async () => {
    try {
      setLoading(true);
      const endpoint = API_ENDPOINTS?.PATIENT?.CREATE_STRIPE_INTENT || '/patient/create-stripe-intent';
      const res = await api.post(endpoint, {
        doctorId: doctor._id || doctor.id,
        timeSlot: selectedSlot,
      });

      if (res.data?.success && res.data?.clientSecret) {
        setClientSecret(res.data.clientSecret);
      } else {
        alert(res.data?.message || 'Could not initiate payment.');
      }
    } catch (err: any) {
      console.error('Stripe Intent Init Error:', err);
      alert(err?.response?.data?.message || 'Failed to initialize payment gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setClientSecret(null);
    setBookingSuccessData(null);
    onClose();
  };

  const handleSuccessFinish = () => {
    if (bookingSuccessData) {
      onConfirmBooking(bookingSuccessData);
    }
    handleModalClose();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleModalClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '28px',
          p: 1.5,
          border: '1.5px solid #E0E7FF',
        },
      }}
    >
      {!bookingSuccessData && (
        <DialogTitle sx={{ fontWeight: 900, color: '#1E1B4B', pb: 0.5 }}>
          Confirm OPD Consultation
        </DialogTitle>
      )}

      <DialogContent sx={{ pt: bookingSuccessData ? 3 : 1.5 }}>
        {bookingSuccessData ? (
          /* Zero-dependency Inline Success Card */
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 65,
                height: 65,
                borderRadius: '50%',
                bgcolor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 900,
                mx: 'auto',
                mb: 2,
              }}
            >
              ✓
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E1B4B', mb: 0.5 }}>
              Payment Successful!
            </Typography>

            <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
              Your appointment with <strong>{doctor.name}</strong> is confirmed.
            </Typography>

            <Box
              sx={{
                bgcolor: '#F8FAFC',
                p: 1.5,
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                mb: 3,
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Slot Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#4F46E5' }}>
                  {selectedSlot}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Amount Paid
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#16A34A' }}>
                  ₹{consultFee}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              disableElevation
              onClick={handleSuccessFinish}
              sx={{
                bgcolor: '#16A34A',
                '&:hover': { bgcolor: '#15803D' },
                borderRadius: '50px',
                fontWeight: 800,
                py: 1.2,
                textTransform: 'none',
              }}
            >
              Done
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5 }}>
              {clientSecret
                ? 'Complete your card details below to confirm the appointment.'
                : 'Review slot details and proceed to secure online checkout.'}
            </Typography>

            {/* Doctor Summary Card */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                bgcolor: '#F8FAFC',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                mb: 3,
              }}
            >
              <Avatar
                src={doctor.img || doctor.profileImage}
                sx={{ width: 54, height: 54, border: '2px solid #4F46E5' }}
              >
                {doctor.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E1B4B' }}>
                  {doctor.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#4F46E5', fontWeight: 700, display: 'block' }}>
                  {doctor.specialty || doctor.specialization}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', mt: 0.3 }}>
                  <LocationOnOutlined sx={{ fontSize: 13 }} />
                  <Typography variant="caption">{doctor.clinic || doctor.clinicName || 'MediPulse Hub'}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Dynamic View: Slot Selection vs Stripe Elements Form */}
            {!clientSecret ? (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 1 }}>
                  Select Preferred Slot
                </Typography>
                <RadioGroup value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {['10:30 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map((slot) => (
                      <Box
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 2,
                          py: 1,
                          borderRadius: '14px',
                          border: selectedSlot === slot ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                          bgcolor: selectedSlot === slot ? '#EEF2FF' : '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeOutlined sx={{ fontSize: 18, color: selectedSlot === slot ? '#4F46E5' : '#64748B' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: selectedSlot === slot ? '#4F46E5' : '#1E1B4B' }}>
                            {slot}
                          </Typography>
                        </Box>
                        <Radio
                          size="small"
                          checked={selectedSlot === slot}
                          value={slot}
                          sx={{ color: '#4F46E5', '&.Mui-checked': { color: '#4F46E5' } }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Consultation Fee:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E1B4B' }}>
                    ₹{consultFee}
                  </Typography>
                </Box>
              </>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#4F46E5',
                      borderRadius: '12px',
                    },
                  },
                }}
              >
                <StripePaymentForm
                  consultFee={consultFee}
                  doctor={doctor}
                  selectedSlot={selectedSlot}
                  onSuccess={(data) => {
                    setBookingSuccessData(data);
                  }}
                  onBack={() => setClientSecret(null)}
                />
              </Elements>
            )}
          </>
        )}
      </DialogContent>

      {!clientSecret && !bookingSuccessData && (
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleModalClose}
            disabled={loading}
            sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={loading}
            onClick={handleProceedToPayment}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AccountBalanceWalletOutlined />}
            sx={{
              bgcolor: '#4F46E5',
              '&:hover': { bgcolor: '#4338CA' },
              fontWeight: 800,
              borderRadius: '50px',
              px: 3,
              py: 1,
              textTransform: 'none',
            }}
          >
            {loading ? 'Initializing...' : `Proceed to Pay ₹${consultFee}`}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}