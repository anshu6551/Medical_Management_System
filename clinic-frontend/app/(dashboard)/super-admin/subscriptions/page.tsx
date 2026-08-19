'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Button, CircularProgress } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import SubscriptionCard from './components/SubscriptionCard';
import PlanModal, { PlanData } from './components/PlanModal';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);

  // 1. Fetch live subscription plans from Backend API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const endpoint = API_ENDPOINTS.SUBSCRIPTIONS?.GET_ALL || '/subscriptions';
      const res: any = await api.get(endpoint);
      const payload = res?.data?.data || res?.data || res;

      if (Array.isArray(payload)) {
        const formatted = payload.map((item: any) => ({
          id: item._id || item.id,
          _id: item._id || item.id,
          name: item.name || '',
          price: item.price ?? 0,
          period: item.period || 'per Month / Clinic',
          clinics: item.clinics || `${item.activeClinicsCount || 0} Active Clinics`,
          features: Array.isArray(item.features) ? item.features : [],
          highlight: Boolean(item.highlight),
        }));
        setPlans(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreateOpen = () => {
    setSelectedPlan(null);
    setModalOpen(true);
  };

  const handleEditOpen = (plan: PlanData) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  // Re-fetch list on successful API save from Modal
  const handleSaveSuccess = () => {
    fetchPlans();
    setModalOpen(false);
  };

  const handleSavePlan = (planData: PlanData) => {
    // Fallback UI update
    if (planData.id || planData._id) {
      setPlans((prev) =>
        prev.map((p) => ((p.id === planData.id || p._id === planData._id) ? { ...p, ...planData } : p))
      );
    } else {
      setPlans((prev) => [
        ...prev,
        { ...planData, id: `plan-${Date.now()}`, clinics: '0 Active Clinics' },
      ]);
    }
    fetchPlans();
    setModalOpen(false);
  };

  return (
    <Box sx={{ color: '#FFFFFF' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
            SaaS Subscription Plans Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5, fontWeight: 500 }}>
            Configure multi-tenant subscription tiers, trial periods, and billing capabilities.
          </Typography>
        </Box>

        <Button
          variant="contained"
          disableElevation
          onClick={handleCreateOpen}
          startIcon={<AddOutlined />}
          sx={{
            bgcolor: '#006D77',
            '&:hover': { bgcolor: '#004D54' },
            fontWeight: 800,
            borderRadius: '12px',
            px: 3,
            py: 1.1,
            textTransform: 'none',
            fontSize: '0.88rem',
            boxShadow: '0 4px 14px rgba(0, 109, 119, 0.4)',
          }}
        >
          Create New Plan
        </Button>
      </Box>

      {/* Plans Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#83C5BE' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }} key={plan.id || plan._id}>
              <SubscriptionCard plan={plan} onEdit={handleEditOpen} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Plan Form Modal Component */}
      <PlanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePlan}
        onSuccess={handleSaveSuccess}
        initialData={selectedPlan}
      />
    </Box>
  );
}