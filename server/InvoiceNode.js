const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'build')));

app.post('/create-pdf', (req, res) => {
    const data = req.body;

    const doc = new PDFDocument();

    const filePath = path.join(__dirname, 'invoice.pdf');
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add header
    doc.fontSize(12)
        .text('Arve saaja:', 50, 100)
        .text('Paras Pähkel', 50, 115)
        .text('Lossi platsi 1-105', 50, 130)
        .text('10137 Viljandi', 50, 145)

        .text('Arve esitaja:', 300, 100)
        .text('WebCodes OÜ', 300, 115)
        .text('Lossi platsi 1a,', 300, 130)
        .text('10137 Viljandi', 300, 145)
        .text('www.webcodes.ee', 300, 160)
        .text('info@webcodes.ee', 300, 175)
        .text('Reg. nr.: 12345678', 300, 190)
        .text('KMKR: EE123456789', 300, 205)
        .text('Swedpank: EE470000123421423 EEUGH00200XX', 300, 220);

    // Add invoice title and metadata
    doc.fontSize(14)
        .text('Arve', 50, 260)
        .fontSize(12)
        .text(`Arve number: ${data.invoiceNumber}`, 50, 280)
        .text(`Viitenumber: ${data.referenceNumber}`, 50, 295)
        .text(`Arve kuupäev: ${data.invoiceDate}`, 50, 310)
        .text(`Kättetoimetamise viis: ${data.deliveryMethod}`, 50, 325)
        .text(`Tasuda: ${data.totalAmount} €`, 50, 340);

    // Add services table header
    doc.text('Nr. Toode/teenus   Ühiku hind €  Kogus  KM %  Kokku €', 50, 380);

    // Add service row
    doc.text(`1  Programmeerimine   25.00   2  22  61.00`, 50, 400);

    // Add totals
    doc.text(`Arve kokku: Summa km-ta € 50.00`, 50, 440)
        .text(`Käibemaks kokku € 11.00`, 50, 455)
        .text(`Arve summa € 61.00`, 50, 470);

    // Add payment note
    doc.text(`Tasumisel palume maksekorraldusele kindlasti märkida viitenumber`, 50, 510);

    doc.end();

    stream.on('finish', () => {
        res.sendFile(filePath);
    });
});

app.listen(3003, () => {
    console.log('Server is running on port 3003');
});
