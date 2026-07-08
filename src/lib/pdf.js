import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (order) => {
  const doc = new jsPDF();
  
  const addr = JSON.parse(order.shippingAddress || '{}');
  const items = JSON.parse(order.items || '[]');

  // Header
  doc.setFontSize(22);
  doc.setTextColor(126, 87, 46); // #7e572e
  doc.text('AZHAGII', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Premium Clothing', 14, 26);
  doc.text('Email: hello@azhagii.me', 14, 31);
  doc.text('Website: azhagii.me', 14, 36);

  // Invoice Title
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('TAX INVOICE', 140, 20);
  
  doc.setFontSize(10);
  doc.text(`Order ID: ${order.$id}`, 140, 28);
  doc.text(`Date: ${new Date(order.$createdAt).toLocaleDateString()}`, 140, 33);
  doc.text(`Status: ${order.status}`, 140, 38);

  // Bill To
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', 14, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${addr.name || 'Customer'}`, 14, 56);
  doc.text(`${addr.email || ''}`, 14, 61);
  doc.text(`${addr.phone || ''}`, 14, 66);
  if (addr.address) {
    doc.text(`${addr.address}`, 14, 71);
    doc.text(`${addr.city || ''}, ${addr.postalCode || ''}`, 14, 76);
  }

  // Items Table
  const tableData = items.map((item, index) => [
    index + 1,
    `${item.name} (Size: ${item.size})`,
    item.quantity,
    `Rs. ${Number(item.price).toFixed(2)}`,
    `Rs. ${(Number(item.price) * item.quantity).toFixed(2)}`
  ]);

  doc.autoTable({
    startY: 85,
    head: [['#', 'Item', 'Qty', 'Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [126, 87, 46] },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { cellWidth: 15, halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });

  // Total
  const finalY = doc.lastAutoTable.finalY || 85;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Grand Total: Rs. ${Number(order.total).toFixed(2)}`, 140, finalY + 10);
  
  // Payment Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${addr.paymentMethod || 'Online'}`, 14, finalY + 10);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Thank you for shopping with Azhagii!', 105, 280, { align: 'center' });

  // Save the PDF
  doc.save(`Azhagii_Invoice_${order.$id}.pdf`);
};
