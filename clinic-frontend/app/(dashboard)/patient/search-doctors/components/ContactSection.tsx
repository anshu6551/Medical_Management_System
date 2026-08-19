'use client';
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Container,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { MailOutlined, PhoneOutlined, LocationOnOutlined, SendOutlined } from '@mui/icons-material';
import api from '@/lib/api/axios';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields (Name, Phone, Message).',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/patient/contact', formData);

      if (res.data?.success || res.status === 201) {
        setSnackbar({
          open: true,
          message: 'Message sent to healthcare support team! We will reply within 15 minutes.',
          severity: 'success',
        });
        setFormData({ name: '', phone: '', message: '' });
      }
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to submit inquiry. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        pt: { xs: 8, md: 10 },
        pb: { xs: 8, md: 10 },
        mt: 6,
        mb: -8, // Footer ke sath seamless chipkaane ke liye zero-gap negative margin
        // Soft Pinkish-Purple Pastel Gradient + Light Overlay
        backgroundImage: `linear-gradient(135deg, rgba(245, 243, 255, 0.92) 0%, rgba(238, 242, 255, 0.95) 100%), url('https://html.vikinglab.agency/medicax/assets/img/all-images/bg/bg3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      id="contact-desk"
    >
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 5, md: 8 },
            alignItems: 'center',
          }}
        >
          {/* Left Text Content */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: '#1E1B4B',
                letterSpacing: '-1.5px',
                mb: 2,
                fontSize: { xs: '2.2rem', md: '3.2rem' },
                lineHeight: 1.15,
              }}
            >
              Need Urgent Help? <br />
              <span style={{ color: '#4F46E5' }}>Contact Our Health Desk</span>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#475569',
                mb: 4,
                lineHeight: 1.8,
                fontSize: '1.1rem',
                fontWeight: 500,
                maxWidth: '520px',
              }}
            >
              Have questions regarding doctor availability, OPD slot cancellation, or medical receipts? Our care team is available 24/7.
            </Typography>

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: '#FFFFFF',
                    borderRadius: '16px',
                    color: '#4F46E5',
                    display: 'flex',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.08)',
                  }}
                >
                  <PhoneOutlined />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Helpline 24/7
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1E1B4B', fontWeight: 800 }}>
                    +91 1800-123-4567
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: '#FFFFFF',
                    borderRadius: '16px',
                    color: '#4F46E5',
                    display: 'flex',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.08)',
                  }}
                >
                  <MailOutlined />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Support Email
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1E1B4B', fontWeight: 800 }}>
                    support@medipulse.com
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: '#FFFFFF',
                    borderRadius: '16px',
                    color: '#4F46E5',
                    display: 'flex',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.08)',
                  }}
                >
                  <LocationOnOutlined />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Location
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1E1B4B', fontWeight: 800 }}>
                     Medical Hub, Kolkata, WB
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Right Floating Form */}
          <Box sx={{ flex: 1, width: '100%', maxWidth: { md: '540px' } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3.5, md: 5 },
                bgcolor: '#FFFFFF',
                borderRadius: '32px',
                border: '1.5px solid #E0E7FF',
                boxShadow: '0 20px 45px rgba(79, 70, 229, 0.08)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E1B4B', mb: 1 }}>
                Send Direct Message
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3.5, fontWeight: 500 }}>
                Fill in your details and our desk agent will reply within 15 minutes.
              </Typography>

              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    placeholder="Your Full Name"
                    variant="outlined"
                    value={formData.name}
                    onChange={handleChange('name')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#F8FAFC',
                        borderRadius: '16px',
                        height: '52px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#4F46E5' },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    placeholder="Phone Number"
                    variant="outlined"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#F8FAFC',
                        borderRadius: '16px',
                        height: '52px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#4F46E5' },
                      },
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="How can we assist you today?"
                  variant="outlined"
                  value={formData.message}
                  onChange={handleChange('message')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#F8FAFC',
                      borderRadius: '16px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#4F46E5' },
                    },
                  }}
                />

                <Button
                  variant="contained"
                  disableElevation
                  disabled={loading}
                  onClick={handleSubmit}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendOutlined />}
                  sx={{
                    bgcolor: '#4F46E5',
                    '&:hover': { bgcolor: '#4338CA' },
                    fontWeight: 800,
                    borderRadius: '50px',
                    py: 1.6,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 10px 25px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Floating Material-UI Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '14px', fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}