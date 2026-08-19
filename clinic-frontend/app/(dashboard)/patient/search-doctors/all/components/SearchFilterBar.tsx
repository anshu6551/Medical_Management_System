'use client';
import React from 'react';
import { Paper, Stack, TextField, InputAdornment, MenuItem, Chip } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';

interface SearchFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (spec: string) => void;
  specialtiesList: string[];
}

export default function SearchFilterBar({
  searchTerm,
  setSearchTerm,
  selectedSpecialty,
  setSelectedSpecialty,
  specialtiesList,
}: SearchFilterBarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        bgcolor: '#FFFFFF',
        borderRadius: '32px',
        border: '1.5px solid #CBD5E1',
        mb: 6,
        boxShadow: '0 15px 35px rgba(30, 27, 75, 0.06)',
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search doctor name, hospital clinic, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: '#4F46E5', fontSize: 24 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8FAFC',
                borderRadius: '50px',
                height: '52px',
                fontSize: '0.98rem',
                '& fieldset': { borderColor: '#CBD5E1' },
                '&:hover fieldset': { borderColor: '#4F46E5' },
              },
            }}
          />

          <TextField
            select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            sx={{
              minWidth: { sm: '230px' },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8FAFC',
                borderRadius: '50px',
                height: '52px',
                fontWeight: 700,
                color: '#1E1B4B',
                '& fieldset': { borderColor: '#CBD5E1' },
              },
            }}
          >
            {specialtiesList.map((spec) => (
              <MenuItem key={spec} value={spec}>
                {spec === 'All' ? 'All Departments' : spec}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Quick Specialty Filter Pills */}
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
          {specialtiesList.map((spec) => {
            const isActive = selectedSpecialty === spec;
            return (
              <Chip
                key={spec}
                label={spec === 'All' ? 'All Specialties' : spec}
                onClick={() => setSelectedSpecialty(spec)}
                sx={{
                  bgcolor: isActive ? '#4F46E5' : '#EEF2FF',
                  color: isActive ? '#FFFFFF' : '#4F46E5',
                  fontWeight: 800,
                  px: 1.8,
                  py: 2,
                  borderRadius: '50px',
                  cursor: 'pointer',
                  transition: '0.2s',
                  border: '1px solid',
                  borderColor: isActive ? '#4F46E5' : '#C7D2FE',
                  '&:hover': {
                    bgcolor: isActive ? '#4338CA' : '#E0E7FF',
                  },
                }}
              />
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}