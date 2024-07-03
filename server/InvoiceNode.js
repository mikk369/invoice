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
    doc.fontSize(14)
        .font('Helvetica-Bold') 
        .text('Arve saaja:', 50, 85)
        .text('Arve esitaja:', 50, 140)
        .font('Helvetica') 
        .fontSize(12)
        .text(`${data.receiverAddress}`, 50, 100, {width: 300})
        .text('WebCodes OÜ', 50, 157)
        .text('Aadress,', 50, 170)
        .text('Linn', 50, 185)
        .text('www.webcodes.ee', 50, 200)
        .text('info@webcodes.ee', 50, 215)
        .text(`Reg. nr. :  ${data.regNumber}`, 200, 155)

        if(data.vatNumber) {
            doc.text('KMKR: EE123456789', 200, 170)
        }

        doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('Swedpank: ', 50, 245)
        .font('Helvetica')
        .fontSize(12)
        .text('IBAN: EE742200221087412500 SWIFT/BIC: HABAEE2X', 120, 245)
        .moveTo(50, 270)
        .lineTo(540, 270) 
        .strokeColor('green') 
        .stroke()

        
    // Add invoice title and metadata
    doc.fontSize(14)
        .font('Helvetica-Bold') 
        .text('Arve nr', 390, 85)
        .text(`${data.invoiceNumber}`, 490, 85)
        .fontSize(12)
        .font('Helvetica')
        .moveTo(390, 100)
        .lineTo(540, 100) 
        .strokeColor('green') 
        .stroke()
        .text(`Arve kuupäev: ${data.invoiceDate}`, 390, 110)
        .text(`Viitenumber: ${data.referenceNumber}`, 390, 125)
        .moveTo(390, 145)
        .lineTo(540, 145) 
        .strokeColor('green') 
        .stroke()

    // Add services table header
    doc.font('Helvetica-Bold')
        .text('Nr.', 50, 285)
        .text('Toode/teenus', 75, 285)
        .text('Ühiku hind €', 290, 285)
        .text('Kogus', 390, 285 )
        .text('KM %', 440, 285)
        .text('Kokku', 480, 285 )
        .font('Helvetica')

            let startY = 310; // Initial Y-coordinate for the first row
            const rowHeight = 20; // Height between rows
        
            data.items.forEach((item, index) => {
                const y = startY + (index * rowHeight);

                if(index % 2 === 0) {
                    doc.fillColor(25, 255, 255)
                } else {
                    doc.fillColor(211, 211, 211);
                }


                doc.text(`${index + 1}`, 50, y)
                    .text(`${item.description}`, 75, y)
                    .text(`${item.unitPrice} €`, 290, y)
                    .text(`${item.quantity}`, 405, y)
                    .text(`${item.vat}`, 445, y)
                    .text(`${item.unitPrice * item.quantity} €`, 480, y)
            });

            const finalY = startY + (data.items.length * rowHeight) + 5; // Adjust Y-coordinate slightly
                doc.moveTo(50, finalY)
                .lineTo(540, finalY)
                .strokeColor('green')
                .stroke();
               
            // Add totals dynamically below the grey line
            const totalsStartY = finalY + 15; // Adding some space between the line and the totals    

    // Add totals
    doc.font('Helvetica-Bold')
        .text(`Summa km-ta € ${data.totalExclVat}`, 400, totalsStartY)
        .text(`KM kokku € ${data.totalVat}`, 400, totalsStartY + 15)
        .text(`Arve summa € ${data.totalInclVat}`, 400, totalsStartY + 30)
        .font('Helvetica')
        
        const paymentNoteY = totalsStartY + 80;
    // Add payment note
    doc.text(`Tasumisel palume maksekorraldusele kindlasti märkida viitenumber`, 50, paymentNoteY);

    doc.end();


    stream.on('finish', () => {
        res.status(200).json({ filePath: `/invoices/invoice-${invoiceNumber}.pdf` });
    });
});

app.listen(3003, () => {
    console.log('Server is running on port 3003');
});
