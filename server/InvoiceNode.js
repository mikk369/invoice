const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

const invoiceDir = path.join(__dirname, 'invoices');
const counterFile = path.join(invoiceDir, 'counter.txt');
const invoiceInfoFile = path.join(__dirname, 'invoices-info.txt');

if(!fs.existsSync(invoiceDir)){
    fs.mkdirSync(invoiceDir);
}

const getCounter = () => {
    if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir);
    }
    if (!fs.existsSync(counterFile)) {
        fs.writeFileSync(counterFile, '0');
    }
    const counter = fs.readFileSync(counterFile, 'utf8');
    return parseInt(counter, 10);
}

const incrementCounter = () => {
    let counter = getCounter();
    counter += 1;
    fs.writeFileSync(counterFile, counter.toString());
    return counter;
}


app.post('/create-pdf', (req, res) => {

    const invoiceNumber = `${incrementCounter().toString().padStart(6, '0')}`;
    const data = {...req.body, invoiceNumber};
    const currentDate = data.invoiceDate;
    data.referenceNumber = invoiceNumber
    
    const doc = new PDFDocument();
    const filePath = path.join(invoiceDir, `invoice-${invoiceNumber}.pdf`);
    const stream = fs.createWriteStream(filePath);

    
    const invoiceInfo = `invoice Number: ${invoiceNumber}\nDate Created: ${currentDate}\n\n`;
    fs.appendFileSync(invoiceInfoFile, invoiceInfo)

    doc.pipe(stream);
    
    // Add header
    doc.fontSize(12)
        .font('Helvetica-Bold') 
        .text('Arve saaja:', 50, 100)
        .font('Helvetica') 
        .text(`${data.receiverAddress}`, 50, 115)
        .text('Arve esitaja:', 300, 100)
        .text('WebCodes OÜ', 300, 115)
        .text('Address,', 300, 130)
        .text('City', 300, 145)
        .text('www.webcodes.ee', 300, 160)
        .text('info@webcodes.ee', 300, 175)
        .text(`Reg. nr. :  ${data.regNumber}`, 300, 190)

        if(data.vatNumber) {
            doc.text('KMKR: EE123456789', 300, 205)
        }

        const yCordinatesSwed = data.vatNumber ? 220 : 205;
        doc.text('Swedpank: IBAN: EE742200221087412500 SWIFT/BIC: HABAEE2X', 300, yCordinatesSwed);

    // Add invoice title and metadata
    doc.fontSize(14)
        .font('Helvetica-Bold') 
        .text('Arve', 50, 260)
        .fontSize(12)
        .font('Helvetica') 
        .text(`Arve number: ${data.invoiceNumber}`, 50, 280)
        .text(`Viitenumber: ${data.referenceNumber}`, 50, 295)
        .text(`Arve kuupäev: ${data.invoiceDate}`, 50, 310)

        if(data.deliveryMethod) {
            doc.text(`Kättetoimetamise viis: ${data.deliveryMethod}`, 50, 325)
        }

        const yCodinatesDeliveryMethod = data.deliveryMethod ? 50 : 325;
        doc.text(`Tasuda: ${data.totalInclVat} €`, 50, yCodinatesDeliveryMethod);

    // Add services table header
    doc.text('Nr. Toode/teenus   Ühiku hind €  Kogus  KM %  Kokku €', 50, 380);

    // Add service row
    data.items.forEach((item, index) => {
        doc.text(`Nimi ${index + 1}: ${item.description}, Hind: ${item.unitPrice}, Kogus: ${item.quantity}, Käibemaks: ${item.vat + '%'}`);
    });

    // Add totals
    doc.text(`Arve kokku: Summa km-ta € ${data.totalExclVat}`, 50, 440)
        .text(`KM kokku € ${data.totalVat}`, 50, 455)
        .text(`Arve summa € ${data.totalInclVat}`, 50, 470);

    // Add payment note
    doc.text(`Tasumisel palume maksekorraldusele kindlasti märkida viitenumber`, 50, 510);

    doc.end();


    stream.on('finish', () => {
        res.status(200).json({ filePath: `/invoices/invoice-${invoiceNumber}.pdf` });
    });
});

app.listen(3003, () => {
    console.log('Server is running on port 3003');
});
