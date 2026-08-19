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
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface PlanData {
  id?: string;
  _id?: string;
  name: string;
  price: string | number;
  period: string;
  features: string[];
  highlight: boolean;
}

interface PlanModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: PlanData) => void;
  initialData?: PlanData | null;
  onSuccess?: () => void;
}

export default function PlanModal({ open, onClose, onSave, initialData, onSuccess }: PlanModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: 'per Month / Clinic',
    featuresText: '',
    highlight: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: String(initialData.price ?? ''),
        period: initialData.period || 'per Month / Clinic',
        featuresText: Array.isArray(initialData.features) ? initialData.features.join('\n') : '',
        highlight: Boolean(initialData.highlight),
      });
    } else {
      setFormData({
        name: '',
        price: '',
        period: 'per Month / Clinic',
        featuresText: '',
        highlight: false,
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedFeatures = formData.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      name: formData.name,
      price: formData.price,
      period: formData.period,
      features: parsedFeatures.length > 0 ? parsedFeatures : ['Standard Support'],
      highlight: formData.highlight,
    };

    try {
      setLoading(true);

      const planId = initialData?.id || initialData?._id;

      if (planId) {
        // UPDATE API Call
        const updateUrl = API_ENDPOINTS.SUBSCRIPTIONS?.UPDATE
          ? API_ENDPOINTS.SUBSCRIPTIONS.UPDATE(planId)
          : `/subscriptions/${planId}`;

        await api.put(updateUrl, payload).catch(() => api.patch(updateUrl, payload));
      } else {
        // CREATE API Call
        const createUrl = API_ENDPOINTS.SUBSCRIPTIONS?.CREATE || '/subscriptions';
        await api.post(createUrl, payload);
      }

      if (onSave) {
        onSave({ id: planId, ...payload });
      }

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error('Subscription Plan API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1E293B !important',
          backgroundImage: 'none !important',
          color: '#FFFFFF !important',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
          p: 1,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, color: '#FFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
            {initialData ? 'Edit Tier Features' : 'Create New Subscription Plan'}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <DialogContent sx={{ py: 3, bgcolor: '#1E293B' }}>
          <Box display="flex" flexDirection="column" gap={2.5}>
            <Box>
              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}>
                Plan Name
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="e.g. Pro Monthly Tier"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: '#83C5BE' },
                    '&.Mui-focused fieldset': { borderColor: '#83C5BE' },
                  },
                }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6} size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}>
                  Price (INR)
                </Typography>
                <TextField
                  fullWidth
                  required
                  placeholder="₹4,999"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#FFF',
                      borderRadius: '12px',
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: '#83C5BE' },
                      '&.Mui-focused fieldset': { borderColor: '#83C5BE' },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={6} size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}>
                  Billing Cycle
                </Typography>
                <TextField
                  fullWidth
                  required
                  placeholder="per Month"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#FFF',
                      borderRadius: '12px',
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: '#83C5BE' },
                      '&.Mui-focused fieldset': { borderColor: '#83C5BE' },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}>
                Plan Features (1 per line)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Up to 10 Doctors&#10;Unlimited Appointments&#10;Razorpay Gateway"
                value={formData.featuresText}
                onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: '#83C5BE' },
                    '&.Mui-focused fieldset': { borderColor: '#83C5BE' },
                  },
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.highlight}
                  onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#83C5BE' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#006D77' },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#CBD5E1' }}>
                  Highlight as "Most Popular"
                </Typography>
              }
            />
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <DialogActions sx={{ p: 2, bgcolor: '#1E293B' }}>
          <Button onClick={onClose} disabled={loading} sx={{ color: '#94A3B8', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={loading}
            sx={{
              bgcolor: '#006D77',
              '&:hover': { bgcolor: '#004D54' },
              color: '#FFF',
              fontWeight: 800,
              borderRadius: '10px',
              px: 3,
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#FFF' }} /> : initialData ? 'Update Plan' : 'Save Plan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}