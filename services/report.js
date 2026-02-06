const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generatePDF(stats) {
  const file = '/tmp/report.pdf';
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(file));
  doc.fontSize(18).text('Analitica Report\n\n');
  doc.fontSize(12)
    .text(`Revenue: ${stats.revenue}`)
    .text(`Orders: ${stats.orders}`)
    .text(`Ads: ${stats.ads}`)
    .text(`Date: ${new Date().toLocaleString()}`);
  doc.end();

  return file;
}

module.exports = { generatePDF };
