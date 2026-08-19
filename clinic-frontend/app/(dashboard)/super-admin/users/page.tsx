'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { SearchOutlined, BlockOutlined, CheckCircleOutlined } from '@mui/icons-material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface UserItem {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'Clinic Admin' | 'Doctor' | 'Patient' | string;
  associatedClinic: string;
  status: 'Active' | 'Blocked' | string;
  joinedDate: string;
}

export default function GlobalUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Live API Fetching
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = API_ENDPOINTS.SUPER_ADMIN?.GET_USERS || '/super-admin/users';
      const res: any = await api.get(endpoint);
      const payload = res?.data?.data || res?.data || res;

      if (Array.isArray(payload)) {
        const formatted: UserItem[] = payload.map((u: any) => ({
          id: u._id || u.id,
          _id: u._id || u.id,
          name: u.name || '',
          email: u.email || '',
          role: u.role === 'CLINIC_ADMIN' ? 'Clinic Admin' : u.role === 'DOCTOR' ? 'Doctor' : 'Patient',
          associatedClinic: u.clinicId?.name || u.associatedClinic || 'N/A',
          status: u.status === 'BLOCKED' ? 'Blocked' : 'Active',
          joinedDate: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'N/A',
        }));
        setUsers(formatted);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userObj: UserItem) => {
    const userId = userObj._id || userObj.id;
    if (!userId) return;

    const isCurrentlyActive = userObj.status === 'Active' || userObj.status === 'ACTIVE';
    const newStatusBackend = isCurrentlyActive ? 'BLOCKED' : 'ACTIVE';
    const newStatusUI = isCurrentlyActive ? 'Blocked' : 'Active';

    try {
      // Optimistic UI update
      setUsers((prev) =>
        prev.map((u) =>
          (u._id === userId || u.id === userId) ? { ...u, status: newStatusUI } : u
        )
      );

      // Exact API Endpoint URL mapping
      const endpoint = API_ENDPOINTS.SUPER_ADMIN?.UPDATE_USER_STATUS
        ? API_ENDPOINTS.SUPER_ADMIN.UPDATE_USER_STATUS(userId)
        : `/super-admin/users/${userId}/status`;

      await api.patch(endpoint, { 
        status: newStatusBackend // Sending "ACTIVE" or "BLOCKED"
      });

    } catch (err: any) {
      console.error('Failed to update user status:', err?.response?.data || err.message);
      // Revert back on error
      fetchUsers();
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <Box sx={{ color: '#FFFFFF' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
          Global Platform Users
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5, fontWeight: 500 }}>
          Manage all registered Doctors, Patients, and Clinic Administrators across the platform.
        </Typography>
      </Box>

      {/* Dark Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          mb: 3,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search user name or email..."
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
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                borderRadius: '12px',
                height: '44px',
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: '#83C5BE' },
              },
            }}
          />

          <TextField
            select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                borderRadius: '12px',
                height: '44px',
                fontWeight: 700,
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
              },
              '& .MuiSvgIcon-root': { color: '#83C5BE' },
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: { bgcolor: '#1E293B', color: '#FFF', border: '1px solid rgba(255, 255, 255, 0.15)' },
                },
              },
            }}
          >
            <MenuItem value="All">All Roles</MenuItem>
            <MenuItem value="Clinic Admin">Clinic Admins</MenuItem>
            <MenuItem value="Doctor">Doctors</MenuItem>
            <MenuItem value="Patient">Patients</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Dark Users Table */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 800, color: '#94A3B8', borderBottom: '1px solid rgba(255, 255, 255, 0.15)' } }}>
                <TableCell sx={{ color: '#94A3B8' }}>User</TableCell>
                <TableCell sx={{ color: '#94A3B8' }}>Email Address</TableCell>
                <TableCell sx={{ color: '#94A3B8' }}>Role</TableCell>
                <TableCell sx={{ color: '#94A3B8' }}>Associated Tenant</TableCell>
                <TableCell sx={{ color: '#94A3B8' }}>Joined On</TableCell>
                <TableCell sx={{ color: '#94A3B8' }}>Status</TableCell>
                <TableCell align="right" sx={{ color: '#94A3B8' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress sx={{ color: '#83C5BE' }} />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                    No platform users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.08)' } }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: '#006D77', color: '#83C5BE', fontWeight: 900, width: 38, height: 38, fontSize: '0.85rem' }}>
                          {u.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                            {u.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>{u.id}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#CBD5E1' }}>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        sx={{
                          bgcolor: u.role === 'Doctor' ? 'rgba(96, 165, 250, 0.15)' : u.role === 'Clinic Admin' ? 'rgba(131, 197, 190, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: u.role === 'Doctor' ? '#60A5FA' : u.role === 'Clinic Admin' ? '#83C5BE' : '#CBD5E1',
                          fontWeight: 800,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#FFFFFF' }}>{u.associatedClinic}</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#CBD5E1' }}>{u.joinedDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.status}
                        size="small"
                        sx={{
                          bgcolor: u.status === 'Active' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                          color: u.status === 'Active' ? '#34D399' : '#F87171',
                          fontWeight: 800,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        color={u.status === 'Active' ? 'error' : 'success'}
                        onClick={() => toggleUserStatus(u)}
                        startIcon={u.status === 'Active' ? <BlockOutlined /> : <CheckCircleOutlined />}
                        sx={{ fontWeight: 800, textTransform: 'none', borderRadius: '8px' }}
                      >
                        {u.status === 'Active' ? 'Block' : 'Unblock'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}