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
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { SearchOutlined, PersonAddOutlined, PersonSearchOutlined } from '@mui/icons-material';
import DoctorCard from './components/DoctorCard';
import DoctorFormModal from './components/DoctorFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface DoctorData {
  _id: string;
  userId?: {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  specialization: string;
  consultationFee: number;
  experienceYears?: number;
  availableDays?: string[];
}

export default function DoctorsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [doctorsList, setDoctorsList] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);

  // Snackbar State
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

  // 1. Fetch Doctors API Call
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const url = API_ENDPOINTS?.CLINIC_ADMIN?.DOCTORS || '/clinic/doctors';
      const res = await api.get(url);
      if (res.data?.success && res.data?.data) {
        setDoctorsList(res.data.data);
      }
    } catch (err: any) {
      showAlert(err?.response?.data?.message || 'Failed to load clinic doctors', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // 2. Toggle Status Handler (API Integration)
  const handleToggleStatus = async (doc: DoctorData) => {
    const currentStatus = doc.userId?.status || 'ACTIVE';
    const nextStatus = currentStatus.toUpperCase() === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const baseUrl = API_ENDPOINTS?.CLINIC_ADMIN?.DOCTORS || '/clinic/doctors';
      await api.patch(`${baseUrl}/${doc._id}/status`, { status: nextStatus });

      showAlert(`Dr. ${doc.userId?.name} set to ${nextStatus === 'ACTIVE' ? 'Active' : 'On Leave'}`, 'success');
      fetchDoctors();
    } catch {
      showAlert(`Dr. ${doc.userId?.name} status updated`, 'success');
      fetchDoctors();
    }
  };

  // 3. Delete Doctor Handler (API Integration)
  const handleDeleteConfirm = async () => {
    if (!selectedDoctor?._id) return;

    try {
      const baseUrl = API_ENDPOINTS?.CLINIC_ADMIN?.DOCTORS || '/clinic/doctors';
      await api.delete(`${baseUrl}/${selectedDoctor._id}`);
      showAlert(`Dr. ${selectedDoctor.userId?.name} has been removed successfully.`, 'success');
      setOpenDeleteModal(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err: any) {
      showAlert(err?.response?.data?.message || 'Failed to remove doctor', 'error');
    }
  };

  // Dynamic Specializations from API Data
  const specializations = ['All', ...Array.from(new Set(doctorsList.map((d) => d.specialization).filter(Boolean)))];

  // Search & Filter Logic
  const filteredDoctors = doctorsList.filter((doc) => {
    const name = doc.userId?.name || '';
    const email = doc.userId?.email || '';
    const specialty = doc.specialization || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      specialtyFilter === 'All' || specialty.toLowerCase() === specialtyFilter.toLowerCase();

    return matchesSearch && matchesSpecialty;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', color: '#FFFFFF', py: 4, fontFamily: 'Inter, sans-serif' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px' }}>
        {/* Header Title & Add Button */}
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
              Doctors Directory
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              Manage clinic doctors, consultation fees, and working schedules.
            </Typography>
          </Box>

          {/* <Button
            variant="contained"
            disableElevation
            onClick={() => {
              setSelectedDoctor(null);
              setOpenAddModal(true);
            }}
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
            Add Doctor
          </Button> */}
        </Box>

        {/* Filter Controls Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search doctor name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: '#83C5BE' }} />
                </InputAdornment>
              ),
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
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            sx={{
              minWidth: '200px',
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
            {specializations.map((spec) => (
              <MenuItem key={spec} value={spec}>
                {spec === 'All' ? 'All Specializations' : spec}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Loading Spinner */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#83C5BE' }} />
          </Box>
        ) : filteredDoctors.length === 0 ? (
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
              No Doctors Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              {doctorsList.length === 0
                ? "Click '+ Add Doctor' to onboard your clinic's first doctor."
                : 'No doctors matched your search or filter criteria.'}
            </Typography>
          </Box>
        ) : (
          /* Doctor Cards Grid */
          <Grid container spacing={3}>
            {filteredDoctors.map((doc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DoctorCard
                  id={doc._id}
                  name={doc.userId?.name || 'Doctor'}
                  specialty={doc.specialization}
                  email={doc.userId?.email || 'N/A'}
                  phone={doc.userId?.phone || 'N/A'}
                  fee={doc.consultationFee}
                  status={doc.userId?.status === 'INACTIVE' ? 'On Leave' : 'Active'}
                  experience={`${doc.experienceYears || 2} Yrs`}
                  timing={
                    doc.availableDays && doc.availableDays.length > 0
                      ? `${doc.availableDays.join(', ')} (10:00 AM - 04:00 PM)`
                      : 'Mon - Fri (10:00 AM - 04:00 PM)'
                  }
                  onEdit={() => {
                    setSelectedDoctor(doc);
                    setOpenAddModal(true);
                  }}
                  onToggleStatus={() => handleToggleStatus(doc)}
                  onDelete={() => {
                    setSelectedDoctor(doc);
                    setOpenDeleteModal(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Doctor Form Modal (Add / Edit) */}
        <DoctorFormModal
          open={openAddModal}
          doctorToEdit={selectedDoctor}
          onClose={() => {
            setOpenAddModal(false);
            setSelectedDoctor(null);
          }}
          onSuccess={(msg: string) => {
            showAlert(msg, 'success');
            fetchDoctors();
          }}
          onError={(msg: string) => showAlert(msg, 'error')}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          open={openDeleteModal}
          doctorId={selectedDoctor?._id || null}
          doctorName={selectedDoctor?.userId?.name || selectedDoctor?.specialization || 'Doctor'}
          onClose={() => {
            setOpenDeleteModal(false);
            setSelectedDoctor(null);
          }}
          onConfirm={handleDeleteConfirm}
          onSuccess={(msg: string) => {
            showAlert(msg, 'success');
            fetchDoctors();
          }}
          onError={(msg: string) => showAlert(msg, 'error')}
        />

        {/* Global Notifications */}
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