'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  TextField,
  IconButton,
  Divider,
  MenuItem,
  Grid,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  CloseOutlined,
  LocalHospitalOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function OnboardClinicModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Snackbar State
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'error', // 'error' | 'success' | 'info' | 'warning'
  });

  const initialFormState = {
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    address: '',
    subscriptionPlan: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    address: '',
    subscriptionPlan: '',
  })

  const handleToastClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Regex Patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Password Regex: min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  // Phone Regex: 10-digit phone number
  const phoneRegex = /^[0-9]{10}$/;

  const validateForm = (formData) => {
    let isValid = true;

    // Temporary object to collect errors
    const errors = {
      name: '',
      ownerName: '',
      email: '',
      phone: '',
      password: '',
      city: '',
      address: '',
      subscriptionPlan: '',
    };

    // 1. Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    // 2. Owner Name validation
    if (!formData.ownerName.trim()) {
      errors.ownerName = 'Owner name is required';
      isValid = false;
    }

    // 3. Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // 4. Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    // 5. Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character';
      isValid = false;
    }

    // 6. City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
      isValid = false;
    }

    // 7. Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    }

    // 8. Subscription Plan validation
    if (!formData.subscriptionPlan) {
      errors.subscriptionPlan = 'Please select a subscription plan';
      isValid = false;
    }

    // Update state with errors (or cleared errors if valid)
    setError(errors);

    return isValid;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const res = await api.get(API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL);
        const fetchedData = res.data?.data || res.data || [];
        setPlans(fetchedData);
        if (fetchedData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            subscriptionPlan: fetchedData[0]._id,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setPlansLoading(false);
      }
    };

    if (open) {
      fetchPlans();
    } else {
      setFormData(initialFormState);
      setShowPassword(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!validateForm(formData)){
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        adminName: formData.ownerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        city: formData.city.trim(),
        address: formData.address.trim(),
        subscriptionPlan: formData.subscriptionPlan,
      };

      await api.post(API_ENDPOINTS.SUPER_ADMIN.ONBOARD_CLINIC, payload);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to onboard clinic:', err);
      setToast({
        open: true,
        message:
          err.response?.data?.message ||
          'Failed to onboard clinic tenant. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      color: '#FFF',
      borderRadius: '12px',
      bgcolor: 'rgba(255, 255, 255, 0.06)',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
      '&:hover fieldset': { borderColor: '#83C5BE' },
    },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1E293B',
            color: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
            p: 1,
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: 'rgba(131, 197, 190, 0.15)',
                  color: '#83C5BE',
                  borderRadius: '12px',
                  display: 'flex',
                }}
              >
                <LocalHospitalOutlined />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
                Onboard New Clinic Tenant
              </Typography>
            </Box>
            <IconButton onClick={onClose} disabled={loading} sx={{ color: '#94A3B8' }}>
              <CloseOutlined fontSize="small" />
            </IconButton>
          </DialogTitle>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

          <DialogContent sx={{ py: 3, bgcolor: '#1E293B' }}>
            <Grid container spacing={2}>
              {/* Clinic Name */}
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}
                >
                  Clinic Name
                </Typography>
                <TextField
                  fullWidth
                  required
                  placeholder="e.g. Apollo Care Specialty"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={inputStyles}
                />
              </Grid>

              {/* Admin / Owner Name */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}
                >
                  Clinic Admin / Owner Name
                </Typography>
                <TextField
                  fullWidth
                  required
                  placeholder="Dr. Rajesh Sharma"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  error={!!error.ownerName}
                  helperText = {error.ownerName}
                  sx={inputStyles}
                />
              </Grid>

              {/* Contact Phone */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}
                >
                  Phone Number
                </Typography>
                <TextField
                  fullWidth
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={!!error.phone}
                  helperText = {error.phone}
                  sx={inputStyles}
                />
              </Grid>

              {/* Admin Email */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}
                >
                  Admin Login Email
                </Typography>
                <TextField
                  fullWidth
                  required
                  type="email"
                  placeholder="admin@apollocare.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!error.email}
                  helperText = {error.email}
                  sx={inputStyles}
                />
              </Grid>

              {/* Admin Password */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}
                >
                  Initial Login Password
                </Typography>
                <TextField
                  fullWidth
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set secure password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  error={!!error.password}
                  helperText = {error.password}
                  sx={inputStyles}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#94A3B8' }}
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}
                >
                  City
                </Typography>
                <TextField
                  fullWidth
                  required
                  placeholder="Kolkata"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  error={!!error.city}
                  helperText = {error.city}
                  sx={inputStyles}
                />
              </Grid>

              {/* Subscription Plan */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}
                >
                  Assigned SaaS Tier
                </Typography>
                <TextField
                  select
                  fullWidth
                  required
                  disabled={plansLoading}
                  value={formData.subscriptionPlan}
                  onChange={(e) =>
                    setFormData({ ...formData, subscriptionPlan: e.target.value })
                  }
                  error={!!error.subscriptionPlan}
                  helperText = {error.subscriptionPlan}
                  sx={{
                    ...inputStyles,
                    '& .MuiSvgIcon-root': { color: '#83C5BE' },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          bgcolor: '#1E293B',
                          color: '#FFF',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        },
                      },
                    },
                  }}
                >
                  {plans.length === 0 ? (
                    <MenuItem value="" disabled>
                      {plansLoading ? 'Loading plans...' : 'No plans available'}
                    </MenuItem>
                  ) : (
                    plans.map((plan) => (
                      <MenuItem key={plan._id} value={plan._id}>
                        {plan.name} {plan.price > 0 ? `(₹${plan.price})` : '(Free Trial)'}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              {/* Full Address */}
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}
                >
                  Full Address
                </Typography>
                <TextField
                  fullWidth
                  required
                  placeholder="Salt Lake Sector V, Kolkata"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                   error={!!error.address}
                  helperText = {error.address}
                  sx={inputStyles}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

          <DialogActions sx={{ p: 2, bgcolor: '#1E293B' }}>
            <Button
              onClick={onClose}
              disabled={loading}
              sx={{ color: '#94A3B8', fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || plansLoading}
              variant="contained"
              disableElevation
              sx={{
                bgcolor: '#006D77',
                '&:hover': { bgcolor: '#004D54' },
                color: '#FFF',
                fontWeight: 800,
                borderRadius: '10px',
                px: 3,
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: '#FFF' }} />
              ) : (
                'Confirm & Onboard'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modern Feedback Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: '12px',
            fontWeight: 600,
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}