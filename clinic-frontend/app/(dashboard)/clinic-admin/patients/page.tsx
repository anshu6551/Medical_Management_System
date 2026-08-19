'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { SearchOutlined, PersonAddOutlined, PersonSearchOutlined } from '@mui/icons-material';
import PatientTable, { PatientItem } from './components/PatientTable';
import PatientHistoryDrawer from './components/PatientHistoryDrawer';
import AddPatientModal from './components/AddPatientModal';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);

  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Snackbar Toast
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

  // 1. Fetch Patients Live API
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const url = API_ENDPOINTS?.CLINIC_ADMIN?.PATIENTS || '/clinic/patients';
      const res = await api.get(url);

      if (res.data?.success && Array.isArray(res.data?.data)) {
        const mapped: PatientItem[] = res.data.data.map((p: any) => ({
          id: p.patientId || `PAT-${p._id?.slice(-4)?.toUpperCase() || '1080'}`,
          _id: p._id,
          name: p.name || 'Walk-in Patient',
          age: p.age ? `${p.age} Yrs` : 'N/A',
          gender: p.gender || 'Male',
          phone: p.phone || 'N/A',
          bloodGroup: p.bloodGroup || 'O+',
          totalVisits: p.totalVisits || (p.appointments ? p.appointments.length : 1),
          lastVisit: p.lastVisit
            ? new Date(p.lastVisit).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Today',
        }));
        setPatients(mapped);
      }
    } catch {
      showAlert('Failed to load clinic patients', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

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
              Patient Records
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              Directory of registered clinic patients and medical histories.
            </Typography>
          </Box>

          <Button
            variant="contained"
            disableElevation
            onClick={() => setOpenAddModal(true)}
            startIcon={<PersonAddOutlined />}
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
            Register Patient
          </Button>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search patient name, ID, or phone number..."
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
        </Box>

        {/* Table View */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#83C5BE' }} />
          </Box>
        ) : filteredPatients.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: '#1E293B',
              borderRadius: '18px',
              border: '1px solid #334155',
            }}
          >
            <PersonSearchOutlined sx={{ fontSize: 52, color: '#94A3B8', mb: 1.5 }} />
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
              No Patients Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              Click &apos;Register Patient&apos; to add new clinic patients.
            </Typography>
          </Box>
        ) : (
          <PatientTable
            patients={filteredPatients}
            onViewHistory={(patient) => {
              setSelectedPatient(patient);
              setOpenDrawer(true);
            }}
          />
        )}

        {/* Add Modal */}
        <AddPatientModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onSuccess={(msg) => {
            showAlert(msg, 'success');
            fetchPatients();
          }}
          onError={(msg) => showAlert(msg, 'error')}
        />

        {/* Patient History Drawer */}
        <PatientHistoryDrawer
          open={openDrawer}
          patient={selectedPatient}
          onClose={() => {
            setOpenDrawer(false);
            setSelectedPatient(null);
          }}
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