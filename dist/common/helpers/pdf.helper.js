"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStudentResultPdf = generateStudentResultPdf;
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
async function generateStudentResultPdf(payload) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    const student = payload.studentData?.student;
    const performanceSummary = payload.studentData?.performanceSummary;
    const useComprehensiveData = !!(student && performanceSummary);
    const startY = doc.y;
    doc.save();
    doc.rect(50, startY, 495, 60).fill('#0ea5e9');
    doc.fill('#ffffff').fontSize(20).text('ASUBEB — Student Result', 60, startY + 15, { align: 'left' });
    doc.restore();
    doc.moveDown(2.5);
    const infoTop = doc.y;
    const cardHeight = useComprehensiveData ? 140 : 110;
    doc.save();
    doc.roundedRect(50, infoTop, 495, cardHeight, 10).fill('#f8fafc').stroke('#e5e7eb');
    doc.restore();
    const leftX = 66;
    const rightX = 325;
    const drawField = (label, value, x, y) => {
        doc.fill('#6b7280').fontSize(9).text(label.toUpperCase(), x, y);
        doc.fill('#111827').fontSize(12).text(String(value ?? 'N/A'), x, y + 12);
    };
    let y = infoTop + 12;
    drawField('Student', `${payload.studentName} (${payload.studentId})`, leftX, y);
    y += 32;
    drawField('School', payload.schoolName ?? 'N/A', leftX, y);
    y += 32;
    drawField('Session', payload.sessionName, leftX, y);
    if (useComprehensiveData) {
        y += 32;
        drawField('LGA', student.school?.lga?.name ?? 'N/A', leftX, y);
    }
    y = infoTop + 12;
    drawField('Gender', payload.gender ?? 'N/A', rightX, y);
    y += 32;
    drawField('Class', payload.className ?? 'N/A', rightX, y);
    y += 32;
    drawField('Term', payload.termName, rightX, y);
    if (useComprehensiveData) {
        y += 32;
        drawField('Grade', performanceSummary.grade ?? 'N/A', rightX, y);
    }
    doc.moveDown(7);
    if (useComprehensiveData) {
        const summaryTop = doc.y;
        doc.roundedRect(50, summaryTop, 495, 60, 8).fill('#f0f9ff').stroke('#0ea5e9');
        doc.fill('#0c4a6e').fontSize(14).text('PERFORMANCE SUMMARY', 60, summaryTop + 15, { align: 'center' });
        const summaryY = summaryTop + 35;
        doc.fill('#111827').fontSize(11);
        doc.text(`Total Assessments: ${performanceSummary.totalAssessments}`, 70, summaryY);
        doc.text(`Total Score: ${performanceSummary.totalScore}/${performanceSummary.totalMaxScore}`, 250, summaryY);
        doc.text(`Average Score: ${performanceSummary.averageScore}`, 70, summaryY + 15);
        doc.text(`Overall Percentage: ${performanceSummary.overallPercentage}%`, 250, summaryY + 15);
        doc.text(`Grade: ${performanceSummary.grade}`, 70, summaryY + 30);
        doc.moveDown(4);
    }
    if (useComprehensiveData && performanceSummary.subjectBreakdown?.length > 0) {
        doc.fill('#111827').fontSize(14).text('SUBJECT-WISE PERFORMANCE', 50, doc.y);
        doc.moveDown(1);
        performanceSummary.subjectBreakdown.forEach((subject, index) => {
            const subjectY = doc.y;
            doc.roundedRect(50, subjectY, 495, 40, 6).fill('#f9fafb').stroke('#e5e7eb');
            doc.fill('#111827').fontSize(12).text(subject.subject.name, 60, subjectY + 8);
            doc.fill('#6b7280').fontSize(10).text(`Score: ${subject.totalScore}/${subject.totalMaxScore}`, 60, subjectY + 22);
            doc.fill('#6b7280').fontSize(10).text(`Average: ${subject.averageScore}`, 200, subjectY + 22);
            doc.fill('#6b7280').fontSize(10).text(`Percentage: ${subject.percentage}%`, 350, subjectY + 22);
            doc.moveDown(2.2);
        });
        doc.moveDown(1);
    }
    doc.fill('#111827').fontSize(14).text('DETAILED ASSESSMENTS', 50, doc.y);
    doc.moveDown(1);
    const headerY = doc.y;
    doc.rect(50, headerY, 495, 24).fill('#f3f4f6');
    doc.fill('#111827').fontSize(11);
    doc.text('SN', 60, headerY + 6);
    doc.text('Subject', 95, headerY + 6);
    doc.text('Type', 300, headerY + 6);
    doc.text('Score', 380, headerY + 6);
    doc.text('Max', 440, headerY + 6);
    doc.moveDown(2);
    let totalScore = 0;
    let totalMax = 0;
    payload.assessments.forEach((item, index) => {
        totalScore += item.score;
        totalMax += item.maxScore;
        const rowY = doc.y;
        if (index % 2 === 0) {
            doc.rect(50, rowY - 2, 495, 20).fill('#fafafa');
            doc.fill('#111827');
        }
        doc.fontSize(11)
            .text(String(index + 1), 60, rowY)
            .text(item.subjectName, 95, rowY)
            .text(item.type, 300, rowY)
            .text(String(item.score), 380, rowY)
            .text(String(item.maxScore), 440, rowY);
        doc.moveDown(1.1);
    });
    doc.moveDown(0.8);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb');
    doc.moveDown(0.8);
    const overallPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    const summaryTop = doc.y;
    doc.roundedRect(325, summaryTop - 6, 220, 42, 6).fill('#f9fafb').stroke('#e5e7eb');
    doc.fill('#111827').fontSize(11)
        .text(`Total Score: ${totalScore}/${totalMax}`, 335, summaryTop)
        .text(`Overall Percentage: ${Math.round(overallPct * 100) / 100}%`, 335, summaryTop + 16);
    doc.moveDown(2);
    const verifyUrl = `https://www.besttechnologiesltd.com/asubeb/verify-result/${encodeURIComponent(payload.studentId)}`;
    const qrPng = await QRCode.toBuffer(verifyUrl, { width: 80, margin: 0 });
    const pageHeight = doc.page.height || 792;
    let footerY = doc.y + 6;
    if (footerY > pageHeight - 120) {
        doc.addPage();
        footerY = 60;
    }
    doc.image(qrPng, 50, footerY, { width: 80, height: 80 });
    doc.fontSize(9).fillColor('#6b7280').text('Scan to verify result', 135, footerY + 8);
    doc.fontSize(9).fillColor('#6b7280').text('Generated by ASUBEB', 400, footerY + 60, { align: 'left' });
    return new Promise((resolve) => {
        doc.on('end', () => {
            const out = Buffer.concat(buffers);
            resolve(out);
        });
        doc.end();
    });
}
//# sourceMappingURL=pdf.helper.js.map