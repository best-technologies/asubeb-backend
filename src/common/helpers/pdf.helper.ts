import PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';

export interface StudentAssessmentItem {
  subjectName: string;
  score: number;
  maxScore: number;
  percentage: number;
  type: string;
}

export interface StudentResultPayload {
  studentName: string;
  studentId: string;
  gender?: string | null;
  schoolName?: string | null;
  className?: string | null;
  sessionName: string;
  termName: string;
  assessments: StudentAssessmentItem[];
  studentData?: {
    student: any;
    performanceSummary: any;
    lastUpdated: string;
  };
}

export async function generateStudentResultPdf(payload: StudentResultPayload): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => buffers.push(chunk));

  // Professional header with school branding and QR code
  const headerY = doc.y;
  doc.save();
  doc.rect(40, headerY, 515, 80).fill('#1e40af');
  
  // QR Code in header (right side)
  const verifyUrl = `https://subeb.besttechnologiesltd.com/verify-result/${encodeURIComponent(payload.studentData?.student?.id || payload.studentId)}`;
  const qrPng = await QRCode.toBuffer(verifyUrl, { width: 50, margin: 1 });
  doc.image(qrPng, 480, headerY + 15, { width: 50, height: 50 });
  
  // Header text (left side, with proper padding)
  doc.fill('#ffffff').fontSize(22).font('Helvetica-Bold').text('ASUBEB STUDENT RESULT', 60, headerY + 20);
  doc.fontSize(11).font('Helvetica').text('Abia State Universal Basic Education Board', 60, headerY + 45);
  
  // Small verification text below QR code
  doc.fontSize(8).text('Scan to Verify', 480, headerY + 68);
  doc.restore();

  doc.moveDown(3);

  // Student Information Card
  const infoY = doc.y;
  doc.save();
  doc.roundedRect(40, infoY, 515, 100, 8).fill('#f8fafc').stroke('#e2e8f0');
  doc.restore();

  const leftX = 60;
  const rightX = 320;
  const centerX = 190;

  const drawField = (label: string, value: string | null | undefined, x: number, y: number, isBold = false) => {
    doc.fill('#64748b').fontSize(10).font('Helvetica').text(label.toUpperCase(), x, y);
    doc.fill('#1e293b').fontSize(12).font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(String(value ?? 'N/A'), x, y + 12);
  };

  // Student info layout
  let y = infoY + 20;
  drawField('Student Name', payload.studentName, leftX, y, true);
  drawField('Student ID', payload.studentId, rightX, y, true);
  y += 35;
  drawField('School', payload.schoolName ?? 'N/A', leftX, y);
  drawField('Class', payload.className ?? 'N/A', rightX, y);
  y += 35;
  drawField('Session', payload.sessionName, leftX, y);
  drawField('Term', payload.termName, rightX, y);

  doc.moveDown(3);

  // Performance Summary (compact)
  const summaryY = doc.y;
  doc.save();
  doc.roundedRect(40, summaryY, 515, 50, 6).fill('#eff6ff').stroke('#3b82f6');
  doc.fill('#1e40af').fontSize(16).font('Helvetica-Bold').text('PERFORMANCE SUMMARY', 40, summaryY + 15, { width: 515, align: 'center' });
  doc.restore();

  // Calculate totals
  let totalScore = 0;
  let totalMax = 0;
  payload.assessments.forEach(item => {
    totalScore += item.score;
    totalMax += item.maxScore;
  });

  const overallPercentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
  const averageScore = payload.assessments.length > 0 ? totalScore / payload.assessments.length : 0;

  const summaryInfoY = summaryY + 35;
  doc.fill('#1e293b').fontSize(12).font('Helvetica');
  doc.text(`Total Score: ${totalScore}/${totalMax}`, 60, summaryInfoY);
  doc.text(`Average: ${Math.round(averageScore * 100) / 100}`, 250, summaryInfoY);
  doc.text(`Percentage: ${Math.round(overallPercentage * 100) / 100}%`, 400, summaryInfoY);

  doc.moveDown(2);

  // Detailed Assessments Table (Compact)
  doc.fill('#1e293b').fontSize(16).font('Helvetica-Bold').text('ASSESSMENT DETAILS', 40, doc.y);
  doc.moveDown(1);

  // Table header
  const headerTableY = doc.y;
  doc.rect(40, headerTableY, 515, 25).fill('#f1f5f9').stroke('#cbd5e1');
  doc.fill('#1e293b').fontSize(11).font('Helvetica-Bold');
  doc.text('S/N', 50, headerTableY + 7);
  doc.text('Subject', 80, headerTableY + 7);
  doc.text('Assessment Type', 280, headerTableY + 7);
  doc.text('Score', 420, headerTableY + 7);
  doc.text('Max Score', 480, headerTableY + 7);

  // Table rows (compact)
  let rowY = headerTableY + 25;
  payload.assessments.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.rect(40, rowY, 515, 20).fill('#fafbfc');
    }
    
    doc.fill('#1e293b').fontSize(10).font('Helvetica');
    doc.text(String(index + 1), 50, rowY + 5);
    doc.text(item.subjectName, 80, rowY + 5);
    doc.text(item.type, 280, rowY + 5);
    doc.text(String(item.score), 420, rowY + 5);
    doc.text(String(item.maxScore), 480, rowY + 5);
    
    rowY += 20;
  });

  // Add border to complete the table
  doc.rect(40, headerTableY, 515, rowY - headerTableY).stroke('#cbd5e1');

  doc.moveDown(2);

  // Footer with signature line and additional info
  const footerY = Math.max(doc.y, 650); // Ensure minimum footer position
  
  // Additional info on the left
  doc.fill('#64748b').fontSize(9).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, 40, footerY + 20);
  doc.fill('#64748b').fontSize(9).font('Helvetica').text(`Student ID: ${payload.studentId}`, 40, footerY + 35);
  
  // Official signature line on the right
  doc.fill('#1e293b').fontSize(10).font('Helvetica-Bold').text('Authorized Signature', 450, footerY + 20);
  doc.moveTo(450, footerY + 35).lineTo(550, footerY + 35).stroke('#1e293b');

  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => {
      const out = Buffer.concat(buffers);
      resolve(out);
    });
    doc.end();
  });
}


