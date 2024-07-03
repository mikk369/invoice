<?php
require('fpdf.php');

class PDF extends FPDF
{
    // Header
    function Header()
    {
        // Add logo or header details here
    }

    // Footer
    function Footer()
    {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, 'Page ' . $this->PageNo(), 0, 0, 'C');
    }
}

function incrementCounter()
{
    $counterFile = 'counter.txt';
    if (!file_exists($counterFile)) {
        file_put_contents($counterFile, '0');
    }
    $counter = (int)file_get_contents($counterFile);
    $counter++;
    file_put_contents($counterFile, $counter);
    return str_pad($counter, 6, '0', STR_PAD_LEFT);
}

$invoiceNumber = incrementCounter();
$data = json_decode(file_get_contents('php://input'), true);
$data['invoiceNumber'] = $invoiceNumber;
$currentDate = $data['invoiceDate'];
$data['referenceNumber'] = $invoiceNumber;

$pdf = new PDF();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 12);

// Add header
$pdf->Cell(0, 10, 'Arve saaja:', 0, 1);
$pdf->SetFont('Arial', '', 12);
$pdf->Cell(0, 10, $data['receiverAddress'], 0, 1);

// Add other details and items
// ...

// Output the PDF to a file
$invoiceDir = 'invoices';
if (!file_exists($invoiceDir)) {
    mkdir($invoiceDir, 0777, true);
}
$filePath = "$invoiceDir/invoice-$invoiceNumber.pdf";
$pdf->Output($filePath, 'F');

// Send response
$response = ['fileUrl' => $filePath];
header('Content-Type: application/json');
echo json_encode($response);
?>
