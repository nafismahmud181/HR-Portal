import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { TemplateKey } from './templates/TemplateRegistry';

export interface TemplateData {
  employeeName: string;
  joiningDate: string;
  salary: string;
  currency: string;
  position: string;
  companyName: string;
  signatoryName: string;
  signatoryTitle: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  signatureImage?: string; // Optional signature image data URL
}

export type QualityLevel = 'standard' | 'high' | 'ultra';

export class PDFGenerator {
  private backgroundImage: HTMLImageElement | null = null;

  async loadBackgroundImage(imagePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.backgroundImage = img;
        resolve();
      };
      img.onerror = () => {
        reject(new Error('Failed to load background image'));
      };
      img.src = imagePath;
    });
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  }

  private generateLOE(data: TemplateData): string {
    return `To Whom It May Concern:

Dear Sir/Madam,

This is to certify that ${data.employeeName ? `Mr./Ms. ${data.employeeName}` : '[Employee Name]'} is an employee at ${data.companyName}, and ${data.employeeName ? 'he/she' : 'they'} has been working as a ${data.position} since ${data.joiningDate ? this.formatDate(data.joiningDate) : '[Joining Date]'}. ${data.employeeName ? 'His/Her' : 'Their'} current salary is ${data.currency} ${data.salary || '[Salary Amount]'}, paid bi-weekly.

If you have any questions regarding ${data.employeeName ? `${data.employeeName}'s` : 'the employee\'s'} employment, please contact our office at ${data.contactPhone} or ${data.contactEmail}.

Signature Image

${data.signatoryName || '[Signatory Name]'}

${data.signatoryTitle}

${data.contactEmail}

${data.website}`;
  }

  private generateExperienceCert(data: TemplateData): string {
    return `TO WHOM IT MAY CONCERN

This is to certify that ${data.employeeName ? `Mr./Ms. ${data.employeeName}` : '[Employee Name]'} has been working with ${data.companyName} as ${data.position} since ${data.joiningDate ? this.formatDate(data.joiningDate) : '[Joining Date]'}.

During ${data.employeeName ? 'his/her' : 'their'} tenure, ${data.employeeName ? 'he/she' : 'they'} has shown dedication, professionalism, and excellent work performance.

We wish ${data.employeeName ? 'him/her' : 'them'} all the best for future endeavors.

Signature Image

${data.signatoryName || '[Signatory Name]'}

${data.signatoryTitle}

${data.companyName}`;
  }

  private generateSalaryCert(data: TemplateData): string {
    return `SALARY CERTIFICATE

This is to certify that ${data.employeeName ? `Mr./Ms. ${data.employeeName}` : '[Employee Name]'} is currently employed with ${data.companyName} as ${data.position}.

${data.employeeName ? 'His/Her' : 'Their'} current monthly salary is ${data.currency} ${data.salary || '[Salary Amount]'}.

This certificate is being issued upon ${data.employeeName ? 'his/her' : 'their'} request.

${data.signatoryName || '[Signatory Name]'}

${data.signatoryTitle}

${data.companyName}

${data.contactEmail}`;
  }

  private getGeneratedContent(data: TemplateData, documentType: TemplateKey): string {
    switch (documentType) {
      case 'loe': return this.generateLOE(data);
      case 'experience': return this.generateExperienceCert(data);
      case 'salary': return this.generateSalaryCert(data);
      default: return this.generateLOE(data);
    }
  }

  private getScaleFactor(quality: QualityLevel): number {
    switch (quality) {
      case 'standard': return 2;
      case 'high': return 4;
      case 'ultra': return 6;
      default: return 4;
    }
  }

  private convertTextToHTML(text: string, data: TemplateData): string {
    // Split text into paragraphs and add proper spacing
    const paragraphs = text.split('\n\n');
    let html = '';
    
    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === '') return;
      
      // Check if this is the position where we want to insert the signature
      if ((paragraph === 'Signature' || paragraph === 'Signature Image') && data.signatureImage) {
        // Insert ONLY the signature image, without the "Signature Image" text
        html += `<div style="margin: 0 0 ${32}px 0; text-align: center;">
          <img src="${data.signatureImage}" alt="Signature" style="max-width: 300px; height: auto; margin-bottom: 16px;" />
        </div>`;
      } else if (paragraph !== 'Signature' && paragraph !== 'Signature Image') {
        // Only add paragraph if it's not the signature placeholder text
        html += `<p style="margin: 0 0 ${16}px 0; line-height: 1.6;">${paragraph.trim()}</p>`;
      }
      // If paragraph is 'Signature' or 'Signature Image' but no signature image is provided,
      // we skip adding anything (neither text nor image)
    });
    
    return html;
  }

  async generatePDF(
    data: TemplateData,
    documentType: TemplateKey,
    quality: QualityLevel = 'high'
  ): Promise<Blob> {
    if (!this.backgroundImage) {
      throw new Error('Background image not loaded');
    }

    // Use higher resolution for better quality
    const scale = this.getScaleFactor(quality);
    const width = 794 * scale; // A4 width in pixels (72 DPI) * scale
    const height = 1123 * scale; // A4 height in pixels (72 DPI) * scale

    // Create a temporary div for rendering
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = `${794 * scale}px`;
    tempDiv.style.height = `${1123 * scale}px`;
    tempDiv.style.backgroundImage = `url(${this.backgroundImage.src})`;
    tempDiv.style.backgroundSize = `${794 * scale}px ${1123 * scale}px`;
    tempDiv.style.backgroundPosition = 'center';
    tempDiv.style.backgroundRepeat = 'no-repeat';
    tempDiv.style.fontFamily = 'Times New Roman, serif';
    tempDiv.style.fontSize = `${14 * scale}px`; // Scale font size
    tempDiv.style.lineHeight = `${1.6 * scale}px`; // Scale line height
    tempDiv.style.color = '#000';
    tempDiv.style.padding = `${150 * scale}px ${80 * scale}px`; // Scale padding (increased top margin)
    tempDiv.style.boxSizing = 'border-box';

    // Add content with proper HTML formatting
    const content = this.getGeneratedContent(data, documentType);
    tempDiv.innerHTML = this.convertTextToHTML(content, data);

    // Add to DOM temporarily
    document.body.appendChild(tempDiv);

    try {
      // Convert to canvas with high quality settings
      const canvas = await html2canvas(tempDiv, {
        width: width,
        height: height,
        scale: 1, // We're already scaling the div, so keep this at 1
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false, // Disable logging for better performance
        imageTimeout: 15000, // Increase timeout for large images
        removeContainer: true, // Automatically remove temporary elements
        foreignObjectRendering: false, // Better compatibility
        // Enhanced quality settings
        onclone: (clonedDoc) => {
          // Ensure the cloned document has the same styling
          const clonedDiv = clonedDoc.querySelector('div') as HTMLElement;
          if (clonedDiv) {
            clonedDiv.style.fontFamily = 'Times New Roman, serif';
            clonedDiv.style.fontSize = `${14 * scale}px`;
            clonedDiv.style.lineHeight = `${1.6 * scale}px`;
            
            // Apply proper spacing to all paragraphs
            const paragraphs = clonedDiv.querySelectorAll('p');
            paragraphs.forEach(p => {
              (p as HTMLElement).style.margin = `0 0 ${16 * scale}px 0`;
              (p as HTMLElement).style.lineHeight = `${1.6 * scale}px`;
              (p as HTMLElement).style.fontSize = `${14 * scale}px`;
            });
            
            // Scale signature image if present
            const signatureImg = clonedDiv.querySelector('img') as HTMLImageElement;
            if (signatureImg) {
              signatureImg.style.maxWidth = `${300 * scale}px`;
              signatureImg.style.marginBottom = `${16 * scale}px`;
            }
          }
        }
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Convert canvas to high-quality image
      const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
      
      // Create PDF with high quality settings
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add image to PDF (A4 dimensions: 210mm x 297mm)
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST');
      
      // Get the PDF as a blob
      const pdfBlob = pdf.output('blob');
      
      // Note: Removed automatic pdf.save() to prevent individual downloads during bulk generation
      // Individual downloads should be handled by the calling code when needed
      
      return pdfBlob;
    } catch (error) {
      // Clean up on error
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
      throw error;
    }
  }

  async generateFromTemplate(
    imagePath: string,
    data: TemplateData,
    documentType: TemplateKey,
    quality: QualityLevel = 'high'
  ): Promise<{ blob: Blob; filename: string }> {
    console.log('generateFromTemplate called with:', { imagePath, documentType, quality });
    
    try {
      console.log('Loading background image...');
      await this.loadBackgroundImage(imagePath);
      console.log('Background image loaded successfully');
      
      let filename: string;
      switch (documentType) {
        case 'loe':
          filename = `Letter_of_Employment_${data.employeeName || 'Employee'}.pdf`;
          break;
        case 'experience':
          filename = `Experience_Certificate_${data.employeeName || 'Employee'}.pdf`;
          break;
        case 'salary':
          filename = `Salary_Certificate_${data.employeeName || 'Employee'}.pdf`;
          break;
        default:
          filename = `Document_${data.employeeName || 'Employee'}.pdf`;
      }
      
      console.log('Generated filename:', filename);
      console.log('Calling generatePDF...');
      
      const blob = await this.generatePDF(data, documentType, quality);
      console.log('generatePDF completed, blob size:', blob.size);
      
      return { blob, filename };
    } catch (error) {
      console.error('Error in generateFromTemplate:', error);
      throw error;
    }
  }
}

// Helper function to generate different document types
export const generatePDF = async (
  imagePath: string,
  data: TemplateData,
  documentType: TemplateKey,
  quality: QualityLevel = 'high'
): Promise<{ blob: Blob; filename: string }> => {
  const generator = new PDFGenerator();
  return await generator.generateFromTemplate(imagePath, data, documentType, quality);
};