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
} from '@mui/material';
import {
  AccessTimeOutlined,
  LocationOnOutlined,
  AccountBalanceWalletOutlined,
} from '@mui/icons-material';
import api from '@/lib/api/axios';

declare let window: any;

interface BookingModalProps {
  open: boolean;
  doctor: any | null;
  onClose: () => void;
  onConfirmBooking: (appointmentData?: any) => void;
}

// Razorpay SDK Script Loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BookingModal({
  open,
  doctor,
  onClose,
  onConfirmBooking,
}: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [loading, setLoading] = useState(false);

  if (!doctor) return null;

  const consultFee = typeof doctor.fee === 'string'
    ? Number(doctor.fee.replace(/[^0-9]/g, ''))
    : (doctor.fee || doctor.consultationFee || 500);

  const handlePayAndBook = async () => {
    try {
      setLoading(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 1. Backend se Order create karwayein
      const orderRes = await api.post('/patient/create-razorpay-order', {
        amount: consultFee,
      });

      if (!orderRes.data?.success) {
        alert(orderRes.data?.message || 'Could not initiate payment order.');
        setLoading(false);
        return;
      }

      const { order } = orderRes.data;

      let storedUser: any = {};
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('user');
        if (u) {
          try {
            storedUser = JSON.parse(u);
          } catch (e) {}
        }
      }

      // 2. Razorpay Popup Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'MediPulse Healthcare',
        description: `Consultation Slot with ${doctor.name}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Payment Verify & Appointment Confirm
            const verifyRes = await api.post('/patient/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
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
              onConfirmBooking(verifyRes.data.data);
              onClose();
            }
          } catch (err: any) {
            alert(err?.response?.data?.message || 'Payment verification failed on server.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: storedUser.name || 'Patient',
          email: storedUser.email || 'patient@medipulse.com',
          contact: storedUser.phone || '9999999999',
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

      razorpayInstance.on('payment.failed', function (resp: any) {
        alert(`Payment Failed: ${resp.error.description}`);
        setLoading(false);
      });
    } catch (error: any) {
      console.error('Booking Payment Error:', error);
      alert(error?.response?.data?.message || 'Failed to open Razorpay gateway.');
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
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
      <DialogTitle sx={{ fontWeight: 900, color: '#1E1B4B', pb: 0.5 }}>
        Confirm OPD Consultation
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5 }}>
          Review slot details and proceed to secure online checkout.
        </Typography>

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
                <Radio size="small" checked={selectedSlot === slot} value={slot} sx={{ color: '#4F46E5', '&.Mui-checked': { color: '#4F46E5' } }} />
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
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={loading}
          onClick={handlePayAndBook}
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
          {loading ? 'Opening Payment...' : `Pay ₹${consultFee} & Confirm`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}