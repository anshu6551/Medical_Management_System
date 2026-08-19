'use client';
import React from 'react';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        color: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 0, m: 0 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}