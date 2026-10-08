export type PaymentReceiptData = {
  id: string
  appointmentId?: string
  doctorName: string
  specialization?: string
  specialty?: string
  patientName: string
  age?: string
  contact?: string
  amount: number
  paymentMethod: string
  status: string
  paidAt: string
  date?: string
  time?: string
  failureReason?: string
}

export function printPaymentReceipt(data: PaymentReceiptData) {
  const printWindow = window.open('', '_blank', 'width=800,height=900')
  if (!printWindow) return

  const formattedDate = data.paidAt ? new Date(data.paidAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }) : new Date().toLocaleString()

  const isSuccess = data.status === 'Paid' || data.status === 'Confirmed' || data.status === 'SUCCESS'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment_Receipt_${data.id}</title>
      <style>
        @page { size: A4; margin: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20mm; color: #1e293b; background: #fff; line-height: 1.6; }
        .receipt-card { border: 2px solid ${isSuccess ? '#0284c7' : '#ef4444'}; border-radius: 16px; padding: 30px; max-width: 700px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
        .logo { font-size: 24px; font-weight: 800; color: #0284c7; letter-spacing: 0.5px; }
        .hosp-info { text-align: right; font-size: 13px; color: #64748b; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 14px; text-transform: uppercase; background: ${isSuccess ? '#f0fdf4' : '#fef2f2'}; color: ${isSuccess ? '#16a34a' : '#dc2626'}; border: 1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'}; margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; }
        .meta-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
        .meta-val { font-size: 15px; font-weight: 600; color: #0f172a; }
        .txn-id { font-family: monospace; color: #0284c7; font-size: 16px; }
        .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .fee-table th { background: #f1f5f9; color: #475569; text-align: left; padding: 12px; font-size: 13px; text-transform: uppercase; }
        .fee-table td { padding: 14px 12px; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
        .fee-table tr.total-row td { font-weight: 800; font-size: 18px; color: ${isSuccess ? '#16a34a' : '#0f172a'}; border-top: 2px solid #0f172a; border-bottom: none; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; pt-20; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #94a3b8; padding-top: 20px; }
        .stamp { display: inline-block; border: 2px dashed ${isSuccess ? '#16a34a' : '#dc2626'}; color: ${isSuccess ? '#16a34a' : '#dc2626'}; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; }
        @media print {
          body { padding: 0; background: #fff; }
          .receipt-card { border: none; box-shadow: none; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <div>
            <div class="logo">🏥 YASH HOSPITAL</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Official Payment & Consultation Receipt</div>
          </div>
          <div class="hosp-info">
            <div>123 Healthcare Blvd, Medical Zone</div>
            <div>Support: +91 1800-200-8888 | billing@yashhospital.com</div>
          </div>
        </div>

        <div style="text-align: center;">
          <div class="status-badge">${isSuccess ? '✓ Payment Successful' : '✕ Payment Failed'}</div>
        </div>

        <div class="summary-grid">
          <div>
            <div class="meta-label">Transaction Reference ID</div>
            <div class="meta-val txn-id">${data.id}</div>
          </div>
          <div>
            <div class="meta-label">Payment Date & Time</div>
            <div class="meta-val">${formattedDate}</div>
          </div>
          <div>
            <div class="meta-label">Attending Doctor</div>
            <div class="meta-val">${data.doctorName} (${data.specialization || data.specialty || 'Specialist'})</div>
          </div>
          <div>
            <div class="meta-label">Patient Name</div>
            <div class="meta-val">${data.patientName} ${data.age ? `(${data.age} Yrs)` : ''}</div>
          </div>
          <div>
            <div class="meta-label">Payment Method</div>
            <div class="meta-val">${data.paymentMethod}</div>
          </div>
          <div>
            <div class="meta-label">Appointment Schedule</div>
            <div class="meta-val">${data.date || 'Scheduled Date'} • ${data.time || 'Scheduled Slot'}</div>
          </div>
        </div>

        <table class="fee-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Doctor Consultation Fee (${data.doctorName})</td>
              <td style="text-align: right; font-weight: 600;">₹${data.amount}</td>
            </tr>
            <tr>
              <td>Hospital Service & Booking Fee</td>
              <td style="text-align: right; color: #16a34a; font-weight: 600;">FREE (₹0)</td>
            </tr>
            <tr>
              <td>Applicable Tax (GST Inclusive)</td>
              <td style="text-align: right; font-weight: 600;">₹0.00</td>
            </tr>
            <tr class="total-row">
              <td>Total Amount ${isSuccess ? 'Paid' : 'Attempted'}</td>
              <td style="text-align: right;">₹${data.amount}</td>
            </tr>
          </tbody>
        </table>

        ${data.failureReason ? `
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; color: #b91c1c; font-size: 14px; margin-bottom: 20px;">
            <strong>Failure Reason:</strong> ${data.failureReason}
          </div>
        ` : ''}

        <div class="footer">
          <div>
            <div>Computer Generated E-Receipt • Yash Hospital Payment Gateway</div>
            <div>Transaction Secured with 256-Bit SSL Encryption</div>
          </div>
          <div style="text-align: right;">
            <div class="stamp">${isSuccess ? 'PAID & VERIFIED' : 'TRANSACTION FAILED'}</div>
          </div>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(2,132,199,0.3);">
            🖨️ Print / Save Receipt as PDF
          </button>
        </div>

      </div>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
