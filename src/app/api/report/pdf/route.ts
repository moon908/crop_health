import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    // Load standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Draw Title
    page.drawText('Crop Health Diagnostic Report', {
      x: 50,
      y: height - 80,
      size: 24,
      font: fontBold,
      color: rgb(0.1, 0.26, 0.2) // Primary color
    });

    page.drawText(`Report ID: ${data.reportId || 'N/A'}`, {
      x: 50,
      y: height - 110,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Content Block
    let yPos = height - 160;

    const drawSectionTitle = (title: string) => {
      page.drawText(title, {
        x: 50,
        y: yPos,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.26, 0.2)
      });
      yPos -= 20;
    };

    const drawTextLine = (label: string, value: string) => {
      page.drawText(`${label}: `, {
        x: 50,
        y: yPos,
        size: 10,
        font: fontBold,
      });
      page.drawText(value, {
        x: 150,
        y: yPos,
        size: 10,
        font,
      });
      yPos -= 15;
    };

    drawSectionTitle('Analysis Summary');
    drawTextLine('Crop Detected', data.analysis?.crop || 'Tomato');
    drawTextLine('Health Status', data.analysis?.healthStatus || 'Diseased');
    drawTextLine('Primary Disease', data.analysis?.disease || 'Early Blight');
    drawTextLine('Scientific Name', data.analysis?.scientificName || 'Alternaria solani');
    drawTextLine('Confidence', `${data.analysis?.confidence || 96.4}%`);
    drawTextLine('Severity', data.analysis?.severity || 'Moderate');
    drawTextLine('Health Score', `${data.analysis?.healthScore || 72}%`);
    drawTextLine('Affected Area', `${data.analysis?.affectedArea || 18.3}%`);

    yPos -= 20;

    drawSectionTitle('AI Scientific Explanation');
    const explanation = data.explanation?.scientificExplanation || '';
    const explanationLines = splitTextIntoLines(explanation, 90);
    explanationLines.forEach((line) => {
      page.drawText(line, {
        x: 50,
        y: yPos,
        size: 10,
        font,
      });
      yPos -= 12;
    });

    yPos -= 20;

    drawSectionTitle('Recommendations & Action Plan');
    drawTextLine('Immediate Actions', data.recommendations?.immediateActions || 'N/A');
    drawTextLine('Watering Plan', data.recommendations?.waterRecommendation || 'N/A');
    drawTextLine('Fertilization', data.recommendations?.fertilizerRecommendation || 'N/A');
    drawTextLine('Organic Treatment', data.recommendations?.organicTreatment || 'N/A');
    drawTextLine('Chemical Treatment', data.recommendations?.chemicalTreatment || 'N/A');

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Report_${data.reportId || 'crop'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    if ((currentLine + word).length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines;
}
