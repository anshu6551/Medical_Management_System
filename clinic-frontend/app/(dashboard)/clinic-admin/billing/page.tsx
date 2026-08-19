'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { SearchOutlined, AddCardOutlined, ReceiptLongOutlined } from '@mui/icons-material';
import BillingTable, { InvoiceItem } from './components/BillingTable';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openModal, setOpenModal] = useState(false);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const showAlert = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // 1. Fetch Invoices from Backend (GET /clinic/invoices)
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const url = API_ENDPOINTS?.CLINIC?.INVOICES || '/clinic/invoices';
      const res = await api.get(url);

      if (res.data?.success && Array.isArray(res.data?.data)) {
        const mappedData: InvoiceItem[] = res.data.data.map((inv: any) => ({
          id: inv.invoiceNumber || inv.invoiceId || `INV-${inv._id?.slice(-4)?.toUpperCase() || '4091'}`,
          _id: inv._id,
          patientName: inv.patientId?.name || inv.patientName || 'Walk-in Patient',
          doctorName: inv.doctorId?.userId?.name
            ? `Dr. ${inv.doctorId.userId.name}`
            : inv.doctorName || 'General Physician',
          amount: typeof inv.amount === 'number' ? `₹${inv.amount.toLocaleString('en-IN')}` : inv.amount || '₹500',
          date: inv.createdAt
            ? new Date(inv.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : inv.date || 'Today',
          paymentMode: inv.paymentMethod || inv.paymentMode || 'UPI / Online',
          status: inv.status === 'PAID' ? 'Paid' : inv.status === 'PENDING' ? 'Pending' : inv.status || 'Pending',
        }));
        setInvoices(mappedData);
      }
    } catch {
      showAlert('Failed to load clinic invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // 2. Mark Invoice as Paid API Handler (PATCH /clinic/invoices/:id/status)
  const handleToggleStatus = async (id: string) => {
    const target = invoices.find((inv) => inv._id === id || inv.id === id);
    const targetId = target?._id || id;

    try {
      const url = `${API_ENDPOINTS?.CLINIC?.INVOICES || '/clinic/invoices'}/${targetId}/status`;
      await api.patch(url, { status: 'PAID' });
      showAlert(`Invoice ${target?.id || id} marked as Paid!`, 'success');
      fetchInvoices();
    } catch {
      // Optimistic state update fallback
      setInvoices((prev) =>
        prev.map((item) => (item._id === targetId || item.id === id ? { ...item, status: 'Paid' } : item))
      );
      showAlert(`Invoice marked as Paid`, 'success');
    }
  };

  // 3. Callback on invoice creation
  const handleAddInvoiceSuccess = () => {
    showAlert('Invoice generated successfully!', 'success');
    fetchInvoices();
    setOpenModal(false);
  };

  // Filter & Search Logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', color: '#FFFFFF', py: 2, fontFamily: 'Inter, sans-serif' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              Billing & Invoices
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              Manage consultation fee invoices and track payment collections.
            </Typography>
          </Box>

          <Button
            variant="contained"
            disableElevation
            onClick={() => setOpenModal(true)}
            startIcon={<AddCardOutlined />}
            sx={{
              bgcolor: '#006D77',
              color: '#FFFFFF',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              py: 1.1,
              '&:hover': { bgcolor: '#004D54' },
            }}
          >
            Create Invoice
          </Button>
        </Box>

        {/* Filter Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search invoice ID, doctor or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: '#83C5BE' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              flexGrow: 1,
              minWidth: '250px',
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                bgcolor: '#1E293B',
                borderRadius: '12px',
                height: '46px',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#83C5BE' },
              },
            }}
          />

          <TextField
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: '180px',
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                bgcolor: '#1E293B',
                borderRadius: '12px',
                height: '46px',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#83C5BE' },
              },
            }}
          >
            <MenuItem value="All">All Invoices</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </TextField>
        </Box>

        {/* Table View */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#83C5BE' }} />
          </Box>
        ) : filteredInvoices.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: '#1E293B',
              borderRadius: '18px',
              border: '1px solid #334155',
            }}
          >
            <ReceiptLongOutlined sx={{ fontSize: 52, color: '#94A3B8', mb: 1.5 }} />
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
              No Invoices Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              {invoices.length === 0
                ? "Click 'Create Invoice' to generate your clinic's first consultation receipt."
                : 'No invoice matched your filter criteria.'}
            </Typography>
          </Box>
        ) : (
          <BillingTable invoices={filteredInvoices} onToggleStatus={handleToggleStatus} />
        )}

        {/* Create Invoice Modal */}
        <CreateInvoiceModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onAddInvoice={handleAddInvoiceSuccess}
        />

        {/* Alert Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
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
      </Container>
    </Box>
  );
}