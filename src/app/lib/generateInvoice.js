import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateInvoice = (session) => {
  const doc = new jsPDF();

  // Add company logo/header
  doc.setFontSize(20);
  doc.text('Game Ground', 20, 20);
  
  // Add invoice details
  doc.setFontSize(12);
  doc.text(`Invoice #: ${session.id}`, 20, 40);
  doc.text(`Date: ${new Date(session.created).toLocaleDateString()}`, 20, 50);
  
  // Add customer details
  doc.text('Customer Details:', 20, 70);
  doc.text(`Name: ${session.expand?.customer_id?.customer_name}`, 30, 80);
  doc.text(`Contact: ${session.expand?.customer_id?.customer_contact}`, 30, 90);
  
  // Add session details
  doc.text('Session Details:', 20, 110);
  doc.autoTable({
    startY: 120,
    head: [['Item', 'Details']],
    body: [
      ['Device', session.expand?.device_id?.name],
      ['Game', session.expand?.game_id?.name],
      ['Players', session.no_of_players],
      ['Duration', `${session.duration_hours} hours`],
      ['Branch', session.expand?.branch_id?.name],
      ['Payment Mode', session.payment_mode],
    ],
  });
  
  // Add total
  const finalY = doc.previousAutoTable.finalY || 120;
  doc.text(`Total Amount: ₹${session.total_amount}`, 20, finalY + 20);
  
  // Save the PDF
  doc.save(`invoice-${session.id}.pdf`);
}; 