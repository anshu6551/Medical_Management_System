export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },

  // Super Admin
  SUPER_ADMIN: {
    STATS: "/super-admin/dashboard-stats",
    CLINICS: "/super-admin/clinics",
    GET_USERS: "/super-admin/users",
    ONBOARD_CLINIC: "/super-admin/clinics/onboard",
    UPDATE_CLINIC_STATUS: (clinicId) =>
      `/super-admin/clinics/${clinicId}/status`,
    UPDATE_USER_STATUS: (userId) => `/super-admin/users/${userId}/status`,
    REVENUE_REPORTS: "/super-admin/revenue-reports",
    EXPORT_CSV: "/super-admin/export-csv",
    SETTINGS: "/super-admin/settings",
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    GET_ALL: "/subscription",
    CREATE: "/subscription",
    UPDATE: (planId) => `/subscription/${planId}`,
  },

  // Clinic Admin (Complete Routes)
  CLINIC: {
    DASHBOARD: "/clinic/dashboard",
    DOCTORS: "/clinic/doctors",
    APPOINTMENTS: "/clinic/appointments",
    UPDATE_APPOINTMENT_STATUS: (id) => `/clinic/appointments/${id}/status`,
    PATIENTS: "/clinic/patients",
    INVOICES: "/clinic/invoices",
    SETTINGS: "/clinic/settings",
  },

  // Doctor
  DOCTOR: {
    DASHBOARD: "/doctor/dashboard",
    APPOINTMENTS: "/doctor/appointments",
    SLOTS: "/doctor/slots",
    FEEDBACK: "/doctor/feedback",
  },

  // Patient
  PATIENT: {
    DOCTORS: '/patient/doctors',
    CONTACT: '/patient/contact',
    APPOINTMENTS: '/patient/appointments',
    FEEDBACK: (id) => `/patient/appointments/${id}/feedback`,
  },
};
