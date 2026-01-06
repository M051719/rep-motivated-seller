import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';

interface PropertyData {
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: number;
  yearBuilt: number;
  estimatedValue: number;
  loanAmount?: number;
  equity?: number;
  monthlyPayment?: number;
}

interface Comparable {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  soldDate: string;
  distance: number;
  pricePerSqft: number;
}

interface PresentationData {
  property: PropertyData;
  comparables: Comparable[];
  aiContent?: {
    marketingSummary?: string;
    keyFeatures?: string[];
    targetAudience?: string;
    callToAction?: string;
  };
  userNotes?: string;
}

/**
 * Generate PDF from presentation data
 */
export async function generatePDF(data: PresentationData): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'letter');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper: Add text with wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, pageWidth - (margin * 2));
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 3;
  };

  // Helper: Add section header
  const addSectionHeader = (title: string) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.setFillColor(99, 102, 241); // Indigo
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 5, yPosition + 7);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;
  };

  // Page 1: Cover Page
  pdf.setFillColor(99, 102, 241);
  pdf.rect(0, 0, pageWidth, pageHeight / 3, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Property Presentation', pageWidth / 2, 40, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.text(data.property.address, pageWidth / 2, 55, { align: 'center' });
  pdf.text(`${data.property.city}, ${data.property.state} ${data.property.zip}`, pageWidth / 2, 65, { align: 'center' });
  
  pdf.setTextColor(0, 0, 0);
  yPosition = (pageHeight / 3) + 20;

  // Property Overview
  addSectionHeader('Property Overview');
  addText(`Property Type: ${data.property.propertyType}`, 12);
  addText(`Bedrooms: ${data.property.bedrooms} | Bathrooms: ${data.property.bathrooms}`, 12);
  addText(`Square Footage: ${data.property.sqft.toLocaleString()} sqft`, 12);
  addText(`Lot Size: ${data.property.lotSize.toLocaleString()} sqft`, 12);
  addText(`Year Built: ${data.property.yearBuilt}`, 12);
  addText(`Estimated Value: $${data.property.estimatedValue.toLocaleString()}`, 12, true);
  
  if (data.property.loanAmount) {
    addText(`Loan Amount: $${data.property.loanAmount.toLocaleString()}`, 12);
  }
  if (data.property.equity) {
    addText(`Equity: $${data.property.equity.toLocaleString()}`, 12, true);
  }
  if (data.property.monthlyPayment) {
    addText(`Monthly Payment: $${data.property.monthlyPayment.toLocaleString()}`, 12);
  }

  // Page 2: Market Comparables
  pdf.addPage();
  yPosition = margin;
  addSectionHeader('Market Comparables');
  
  if (data.comparables.length > 0) {
    data.comparables.forEach((comp, index) => {
      addText(`${index + 1}. ${comp.address}`, 12, true);
      addText(`   Price: $${comp.price.toLocaleString()} | ${comp.bedrooms}bd/${comp.bathrooms}ba | ${comp.sqft.toLocaleString()} sqft`, 11);
      addText(`   Sold: ${comp.soldDate} | ${comp.distance.toFixed(1)} miles away | $${comp.pricePerSqft}/sqft`, 11);
      yPosition += 2;
    });
    
    // Calculate average
    const avgPrice = data.comparables.reduce((sum, c) => sum + c.price, 0) / data.comparables.length;
    const avgPricePerSqft = data.comparables.reduce((sum, c) => sum + c.pricePerSqft, 0) / data.comparables.length;
    
    yPosition += 5;
    addText('Market Summary:', 12, true);
    addText(`Average Sale Price: $${avgPrice.toLocaleString()}`, 12);
    addText(`Average Price/sqft: $${avgPricePerSqft.toFixed(2)}`, 12);
  } else {
    addText('No comparable properties available at this time.', 12);
  }

  // Page 3: AI-Generated Content (if available)
  if (data.aiContent) {
    pdf.addPage();
    yPosition = margin;
    addSectionHeader('Marketing Overview');
    
    if (data.aiContent.marketingSummary) {
      addText('Marketing Summary:', 12, true);
      addText(data.aiContent.marketingSummary, 11);
      yPosition += 3;
    }
    
    if (data.aiContent.keyFeatures && data.aiContent.keyFeatures.length > 0) {
      addText('Key Features:', 12, true);
      data.aiContent.keyFeatures.forEach(feature => {
        addText(`• ${feature}`, 11);
      });
      yPosition += 3;
    }
    
    if (data.aiContent.targetAudience) {
      addText('Target Audience:', 12, true);
      addText(data.aiContent.targetAudience, 11);
      yPosition += 3;
    }
    
    if (data.aiContent.callToAction) {
      addText('Call to Action:', 12, true);
      addText(data.aiContent.callToAction, 11);
    }
  }

  // Page 4: Notes
  if (data.userNotes) {
    pdf.addPage();
    yPosition = margin;
    addSectionHeader('Additional Notes');
    addText(data.userNotes, 11);
  }

  // Footer on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `RepMotivatedSeller.com | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return pdf.output('blob');
}

/**
 * Generate PowerPoint from presentation data
 */
export async function generatePPTX(data: PresentationData): Promise<Blob> {
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.author = 'RepMotivatedSeller.com';
  pptx.company = 'RepMotivatedSeller';
  pptx.title = `Property Presentation - ${data.property.address}`;

  // Slide 1: Title Slide
  const slide1 = pptx.addSlide();
  slide1.background = { color: '6366F1' }; // Indigo
  slide1.addText('Property Presentation', {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center'
  });
  slide1.addText([
    { text: data.property.address, options: { breakLine: true } },
    { text: `${data.property.city}, ${data.property.state} ${data.property.zip}` }
  ], {
    x: 0.5,
    y: 3,
    w: 9,
    h: 1,
    fontSize: 24,
    color: 'FFFFFF',
    align: 'center'
  });

  // Slide 2: Property Overview
  const slide2 = pptx.addSlide();
  slide2.addText('Property Overview', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: '6366F1'
  });
  
  const propertyDetails = [
    ['Property Type:', data.property.propertyType],
    ['Bedrooms:', data.property.bedrooms.toString()],
    ['Bathrooms:', data.property.bathrooms.toString()],
    ['Square Footage:', `${data.property.sqft.toLocaleString()} sqft`],
    ['Lot Size:', `${data.property.lotSize.toLocaleString()} sqft`],
    ['Year Built:', data.property.yearBuilt.toString()],
    ['Estimated Value:', `$${data.property.estimatedValue.toLocaleString()}`]
  ];
  
  if (data.property.equity) {
    propertyDetails.push(['Equity:', `$${data.property.equity.toLocaleString()}`]);
  }
  
  slide2.addTable(propertyDetails as any, {
    x: 1.5,
    y: 1.5,
    w: 7,
    rowH: 0.4,
    fontSize: 16,
    border: { type: 'solid', color: 'CCCCCC', pt: 1 },
    fill: { color: 'F3F4F6' },
    color: '1F2937'
  });

  // Slide 3: Market Comparables
  const slide3 = pptx.addSlide();
  slide3.addText('Market Comparables', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: '6366F1'
  });
  
  if (data.comparables.length > 0) {
    const compTable = [
      ['Address', 'Price', 'Beds/Baths', 'Sqft', 'Distance']
    ];
    
    data.comparables.slice(0, 5).forEach(comp => {
      compTable.push([
        comp.address,
        `$${(comp.price / 1000).toFixed(0)}k`,
        `${comp.bedrooms}/${comp.bathrooms}`,
        comp.sqft.toLocaleString(),
        `${comp.distance.toFixed(1)} mi`
      ]);
    });
    
    slide3.addTable(compTable as any, {
      x: 0.5,
      y: 1.2,
      w: 9,
      rowH: 0.4,
      fontSize: 14,
      border: { type: 'solid', color: 'CCCCCC', pt: 1 },
      fill: { color: 'F3F4F6' },
      color: '1F2937',
      headerRowFill: '6366F1',
      headerRowColor: 'FFFFFF',
      headerRowBold: true
    });
    
    // Market summary
    const avgPrice = data.comparables.reduce((sum, c) => sum + c.price, 0) / data.comparables.length;
    slide3.addText(`Market Average: $${avgPrice.toLocaleString()}`, {
      x: 0.5,
      y: 5,
      w: 9,
      h: 0.5,
      fontSize: 18,
      bold: true,
      color: '6366F1',
      align: 'center'
    });
  }

  // Slide 4: AI Content (if available)
  if (data.aiContent && data.aiContent.marketingSummary) {
    const slide4 = pptx.addSlide();
    slide4.addText('Marketing Overview', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: '6366F1'
    });
    
    slide4.addText(data.aiContent.marketingSummary, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3,
      fontSize: 16,
      color: '1F2937'
    });
    
    if (data.aiContent.keyFeatures && data.aiContent.keyFeatures.length > 0) {
      const features = data.aiContent.keyFeatures.map(f => `• ${f}`).join('\n');
      slide4.addText(features, {
        x: 1,
        y: 4.5,
        w: 8,
        h: 1.5,
        fontSize: 14,
        color: '374151'
      });
    }
  }

  // Final slide: Call to Action
  const slideFinal = pptx.addSlide();
  slideFinal.background = { color: '6366F1' };
  slideFinal.addText(data.aiContent?.callToAction || 'Contact us to learn more about this property!', {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 2,
    fontSize: 28,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle'
  });
  
  slideFinal.addText('RepMotivatedSeller.com', {
    x: 0.5,
    y: 5,
    w: 9,
    h: 0.5,
    fontSize: 18,
    color: 'FFFFFF',
    align: 'center'
  });

  // Generate and return blob
  const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;
  return pptxBlob;
}

/**
 * Capture HTML element as image and add to PDF
 */
export async function captureElementAsPDF(elementId: string, filename: string): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Capture element as canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  // Create PDF from canvas
  const pdf = new jsPDF('p', 'mm', 'letter');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = pageWidth - 20; // 10mm margins
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // If image is taller than page, scale it down
  let finalWidth = imgWidth;
  let finalHeight = imgHeight;
  if (imgHeight > pageHeight - 20) {
    finalHeight = pageHeight - 20;
    finalWidth = (canvas.width * finalHeight) / canvas.height;
  }
  
  pdf.addImage(imgData, 'PNG', 10, 10, finalWidth, finalHeight);
  
  return pdf.output('blob');
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Send presentation via email (requires backend)
 */
export async function sendPresentationEmail(
  recipientEmail: string,
  presentationBlob: Blob,
  format: 'pdf' | 'pptx',
  propertyAddress: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
    });
    reader.readAsDataURL(presentationBlob);
    const base64File = await base64Promise;

    // Call Supabase Edge Function or email API
    const response = await fetch('/api/send-presentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject: `Property Presentation - ${propertyAddress}`,
        attachment: {
          filename: `presentation.${format}`,
          content: base64File,
          contentType: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return {
      success: true,
      message: 'Presentation sent successfully!'
    };
  } catch (error) {
    console.error('Error sending presentation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send presentation'
    };
  }
}
