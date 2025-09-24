"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateClassResultsPdf = generateClassResultsPdf;
const PDFDocument = require("pdfkit");
function generateClassResultsPdf(payload) {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
    const buffers = [];
    doc.on('data', (c) => buffers.push(c));
    doc.rect(40, 40, 761, 50).fill('#0ea5e9');
    doc.fill('#ffffff').fontSize(18).text('ASUBEB — Class Results', 50, 55);
    doc.fill('#111827');
    const metaTop = 110;
    doc.fontSize(11)
        .text(`School: ${payload.schoolName ?? 'N/A'}`, 50, metaTop)
        .text(`Class: ${payload.className ?? 'N/A'}`, 50, metaTop + 16)
        .text(`Session: ${payload.sessionName}`, 260, metaTop)
        .text(`Term: ${payload.termName}`, 260, metaTop + 16)
        .text(`Total Students: ${payload.rows.length}`, 470, metaTop)
        .text(`Subjects: ${payload.subjects.length}`, 470, metaTop + 16);
    let y = metaTop + 36;
    const tableLeft = 50;
    const tableRight = 801;
    const nameColWidth = 220;
    const remainWidth = tableRight - tableLeft - nameColWidth;
    const colWidth = Math.max(60, Math.floor(remainWidth / Math.max(1, payload.subjects.length)));
    const drawHeader = () => {
        doc.rect(tableLeft, y, nameColWidth + colWidth * payload.subjects.length, 24).fill('#f3f4f6');
        doc.fill('#111827').fontSize(11)
            .text('Student', tableLeft + 8, y + 6, { width: nameColWidth - 10 })
            .text('ID', tableLeft + nameColWidth - 80, y + 6, { width: 70, align: 'right' });
        payload.subjects.forEach((s, idx) => {
            const x = tableLeft + nameColWidth + idx * colWidth + 6;
            doc.text(s, x, y + 6, { width: colWidth - 10 });
        });
        y += 26;
    };
    drawHeader();
    payload.rows.forEach((row, ri) => {
        if (ri % 2 === 0) {
            doc.rect(tableLeft, y - 2, nameColWidth + colWidth * payload.subjects.length, 20).fill('#fafafa');
            doc.fill('#111827');
        }
        doc.fontSize(10)
            .text(row.studentName, tableLeft + 8, y, { width: nameColWidth - 90 })
            .text(row.studentId, tableLeft + nameColWidth - 80, y, { width: 70, align: 'right' });
        payload.subjects.forEach((s, idx) => {
            const cell = row.subjects[s];
            const val = cell ? `${cell.score}/${cell.maxScore}` : '-';
            const x = tableLeft + nameColWidth + idx * colWidth + 6;
            doc.text(val, x, y, { width: colWidth - 10 });
        });
        y += 18;
        if (y > 540) {
            doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
            y = 50;
            drawHeader();
        }
    });
    return new Promise((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.end();
    });
}
//# sourceMappingURL=pdf-class.helper.js.map