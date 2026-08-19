'use client';
import React, { useState } from 'react';
import { Container, Box, Typography, TextField, InputAdornment, Stack, MenuItem, Paper } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';

import HeroBanner from './components/HeroBanner';
import AboutSection from './components/AboutSection';
import FeaturedDoctors from './components/FeaturedDoctors';
import ContactSection from './components/ContactSection';
import DoctorCard, { Doctor } from './components/DoctorCard';
import BookingModal from './components/BookingModal';
import DepartmentSection from './components/DepartmentSection';
import HowItWorks from './components/HowItWorks';

export default function SearchDoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const doctors: Doctor[] = [
    {
      id: 'DOC-1',
      name: 'Dr. A. K. Roy',
      specialty: 'Cardiology',
      clinic: 'City Health Clinic',
      experience: '12 Yrs',
      fee: '₹500',
      rating: 4.8,
      availableSlot: '10:30 AM',
    },
    {
      id: 'DOC-2',
      name: 'Dr. Sneha Das',
      specialty: 'Dermatology',
      clinic: 'Newtown Medicare',
      experience: '8 Yrs',
      fee: '₹600',
      rating: 4.9,
      availableSlot: '11:00 AM',
    },
    {
      id: 'DOC-3',
      name: 'Dr. R. N. Mukherjee',
      specialty: 'Orthopedics',
      clinic: 'Apex Care Clinic',
      experience: '15 Yrs',
      fee: '₹700',
      rating: 4.7,
      availableSlot: '02:00 PM',
    },
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: 0 }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        {/* Hospa Bento Grid Hero */}
        <HeroBanner />

        {/* About Section */}
        <AboutSection />

        <DepartmentSection/>

        {/* Featured Doctors */}
        <FeaturedDoctors
          onSelectDoctor={(doc) => {
            setSelectedDoctor(doc);
            setOpenModal(true);
          }}
        />

      

        {/* Contact Support Section */}
        <ContactSection />

        <HowItWorks/>

        {/* Booking Checkout Modal */}
        <BookingModal
          open={openModal}
          doctor={selectedDoctor}
          onClose={() => setOpenModal(false)}
          onConfirmBooking={() => {}}
        />
      </Container>
    </Box>
  );
}