
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  ArrowForward,
} from '@mui/icons-material';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    email: '',
    password: '',
  });

  // Snackbar Notification States
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Exact Query Param Cleaner
  const parseRole = (param: string | null) => {
    if (!param) return 'clinic-admin';
    const clean = decodeURIComponent(param)
      .trim()
      .toLowerCase()
      .replace(/_/g, '-')
      .replace(/\s+/g, '-');
    if (['super-admin', 'clinic-admin', 'doctor', 'patient'].includes(clean)) {
      return clean;
    }
    return 'clinic-admin';
  };

  const [role, setRole] = useState(() => parseRole(searchParams.get('role')));
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Sync state whenever URL role query param changes
  useEffect(() => {
    const currentParam = searchParams.get('role');
    if (currentParam) {
      setRole(parseRole(currentParam));
    }
  }, [searchParams]);

  // Form Validation
  const formValidation = (data = formData): boolean => {
    let emailerr = '';
    let passworderr = '';

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!data.email || !emailRegex.test(data.email)) {
      emailerr = 'Please enter a valid email address';
    }
    if (!data.password || !passwordRegex.test(data.password)) {
      passworderr =
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
    }

    setError({ email: emailerr, password: passworderr });
    return !emailerr && !passworderr;
  };

  // Handle Token Verification (Fixed double-execution with useRef)
  const verified = searchParams.get('verified');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (verified === 'true') {
      setSnackbar({
        open: true,
        message: 'Email verified successfully! You can now log in.',
        severity: 'success',
      });
    } else if (errorParam) {
      setSnackbar({
        open: true,
        message: 'Verification link expired or invalid.',
        severity: 'error',
      });
    }
  }, [verified, errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValidation(formData)) {
      return;
    }

    setLoading(true);

    try {
      // 1. API Call
      const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      // 2. Response Destructuring
      const token = res.data.token || res.data.data?.token;
      const user = res.data.data?.user || res.data.data || res.data.user;

      if (!token || !user) {
        throw new Error('Invalid response structure from server');
      }

      // 3. Role Validation Check
      const formattedSelectedRole = role.replace(/-/g, '_').toUpperCase();
      if (user.role !== formattedSelectedRole) {
        setSnackbar({
          open: true,
          message: `Unauthorized: Your account does not have access to the ${role.replace(
            /-/g,
            ' '
          )} portal.`,
          severity: 'error',
        });
        setLoading(false);
        return;
      }

      // 4. LocalStorage & Cookies Sync
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(
        JSON.stringify(user)
      )}; path=/; max-age=86400; SameSite=Lax`;

      setSnackbar({
        open: true,
        message: 'Login successful! Redirecting...',
        severity: 'success',
      });

      // 5. Dynamic Redirect
      setTimeout(() => {
        router.refresh();

        switch (user.role) {
          case 'SUPER_ADMIN':
            router.push('/super-admin/dashboard');
            break;
          case 'CLINIC_ADMIN':
            router.push('/clinic-admin/dashboard');
            break;
          case 'DOCTOR':
            router.push('/doctor/dashboard');
            break;
          case 'PATIENT':
            router.push('/patient/search-doctors');
            break;
          default:
            router.push('/');
        }
      }, 300);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password. Please try again.';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error',
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Top Accent Bar */}
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #006D77 0%, #83C5BE 100%)',
          }}
        />

        <CardContent sx={{ p: { xs: 3.5, sm: 4 } }}>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Typography
              component={Link}
              href="/"
              variant="h5"
              sx={{
                fontWeight: 900,
                fontSize: '1.65rem',
                color: '#FFFFFF',
                textDecoration: 'none',
                letterSpacing: '-0.5px',
                display: 'inline-block',
                mb: 0.5,
              }}
            >
              Life<span style={{ color: '#4F46E5' }}>Spire</span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#CBD5E1', fontSize: '0.875rem', mb: '20px' }}
            >
              Sign in to access your dashboard
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {/* Role Dropdown */}
              <Box display="flex" flexDirection="column" gap={0.8}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, fontSize: '0.825rem' }}
                >
                  Select Access Role
                </Typography>
                <Box
                  component="select"
                  value={role}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setRole(e.target.value)
                  }
                  sx={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    px: 1.5,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    '& option': {
                      bgcolor: '#0F172A',
                      color: '#FFFFFF',
                      px: 2,
                    },
                    '&:focus': {
                      borderColor: '#83C5BE',
                    },
                  }}
                >
                  <option value="super-admin">Super Admin Portal</option>
                  <option value="clinic-admin">Clinic Admin Portal</option>
                  <option value="doctor">Doctor Portal</option>
                  <option value="patient">Patient Portal</option>
                </Box>
              </Box>

              {/* Email Address */}
              <Box display="flex" flexDirection="column" gap={0.8}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, fontSize: '0.825rem' }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={!!error.email}
                  helperText={error.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined
                          sx={{ color: '#83C5BE', fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      height: '46px',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': { borderColor: '#83C5BE' },
                      '&.Mui-focused fieldset': { borderColor: '#83C5BE' },
                    },
                  }}
                />
              </Box>

              {/* Password */}
              <Box display="flex" flexDirection="column" gap={0.8}>
                <Typography
                  variant="caption"
                  sx={{ color: '#CBD5E1', fontWeight: 600, fontSize: '0.825rem' }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  error={!!error.password}
                  helperText={error.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#83C5BE', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#CBD5E1' }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      height: '46px',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': { borderColor: '#83C5BE' },
                      '&.Mui-focused fieldset': { borderColor: '#83C5BE' },
                    },
                  }}
                />
              </Box>

              {/* Forgot Password */}
              <Box display="flex" justifyContent="flex-end">
                <Typography
                  component={Link}
                  href="/forgot-password"
                  variant="caption"
                  sx={{
                    color: '#83C5BE',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Forgot Password?
                </Typography>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                disabled={loading}
                variant="contained"
                disableElevation
                endIcon={!loading && <ArrowForward sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#006D77',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  py: 1.3,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 20px rgba(0, 109, 119, 0.4)',
                  '&:hover': { bgcolor: '#004D54' },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#FFF' }} />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </Box>

          {/* Bottom Switch */}
          <Box
            textAlign="center"
            mt="25px"
            pt="10px"
            sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}
          >
            <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
              Don't have an account?{' '}
              <Typography
                component={Link}
                href="/register"
                variant="body2"
                sx={{
                  color: '#83C5BE',
                  textDecoration: 'none',
                  fontWeight: 700,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Create Account
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(0, 77, 84, 0.88) 100%), url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Suspense
          fallback={<Typography sx={{ color: '#FFF' }}>Loading...</Typography>}
        >
          <LoginForm />
        </Suspense>
      </Container>
    </Box>
  );
}