'use client';
import React from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReceiptOutlined, CheckCircleOutlined, ReceiptLongOutlined } from '@mui/icons-material';

export interface InvoiceItem {
  id: string;
  _id?: string;
  patientName: string;
  doctorName: string;
  amount: string;
  date: string;
  paymentMode: string;
  status: 'Paid' | 'Pending' | string;
}

interface BillingTableProps {
  invoices: InvoiceItem[];
  onToggleStatus: (id: string) => void;
  onPrintInvoice?: (invoice: InvoiceItem) => void;
}

export default function BillingTable({ invoices, onToggleStatus, onPrintInvoice }: BillingTableProps) {
  return (
    <Paper
      sx={{
        bgcolor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '20px',
        p: { xs: 2, sm: 3 },
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  borderColor: '#334155',
                  color: '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                },
              }}
            >
              <TableCell>INVOICE ID</TableCell>
              <TableCell>PATIENT</TableCell>
              <TableCell>DOCTOR</TableCell>
              <TableCell>DATE</TableCell>
              <TableCell>MODE</TableCell>
              <TableCell>AMOUNT</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="right">ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, borderColor: '#334155' }}>
                  <ReceiptLongOutlined sx={{ fontSize: 44, color: '#94A3B8', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    No invoice records found
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Created patient billing receipts will be displayed here.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((row) => {
                const isPaid = row.status?.toLowerCase() === 'paid';
                return (
                  <TableRow
                    key={row._id || row.id}
                    sx={{
                      '& td': { borderColor: '#334155', color: '#FFFFFF', py: 2 },
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#83C5BE' }}>{row.id}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{row.patientName}</TableCell>
                    <TableCell sx={{ color: '#CBD5E1' }}>{row.doctorName}</TableCell>
                    <TableCell sx={{ color: '#CBD5E1' }}>{row.date}</TableCell>
                    <TableCell sx={{ color: '#CBD5E1' }}>{row.paymentMode}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{row.amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={isPaid ? 'Paid' : 'Pending'}
                        size="small"
                        sx={{
                          bgcolor: isPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          color: isPaid ? '#4ADE80' : '#FBBF24',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {!isPaid && (
                        <Tooltip title="Mark as Paid">
                          <IconButton
                            size="small"
                            onClick={() => onToggleStatus(row._id || row.id)}
                            sx={{
                              color: '#4ADE80',
                              border: '1px solid #334155',
                              '&:hover': { bgcolor: 'rgba(74, 222, 128, 0.1)', borderColor: '#4ADE80' },
                            }}
                          >
                            <CheckCircleOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {isPaid && (
                        <Tooltip title="View Receipt">
                          <IconButton
                            size="small"
                            onClick={() => onPrintInvoice && onPrintInvoice(row)}
                            sx={{
                              color: '#83C5BE',
                              border: '1px solid #334155',
                              '&:hover': { bgcolor: 'rgba(131, 197, 190, 0.1)', borderColor: '#83C5BE' },
                            }}
                          >
                            <ReceiptOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}