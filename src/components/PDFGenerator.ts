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

  private generateLOEHTML(data: TemplateData, scale: number = 1): string {
    return `
      <div style="text-align: left; font-family: 'Times New Roman', serif; color: #000;">
        <div style="margin-bottom: ${24 * scale}px;">
          <h1 style="font-size: ${24 * scale}px; font-weight: bold; margin: 0 0 ${8 * scale}px 0;">To Whom It May Concern:</h1>
        </div>
        
        <div style="margin-bottom: ${16 * scale}px;">
          <p style="margin: 0 0 ${16 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">Dear Sir/Madam,</p>
          
          <p style="margin: 0 0 ${16 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">
            This is to certify that ${data.employeeName ? `Mr./Ms. ${data.employeeName}` : '[Employee Name]'} is an employee at ${data.companyName}, and ${data.employeeName ? 'he/she' : 'they'} has been working as a ${data.position} since ${data.joiningDate ? this.formatDate(data.joiningDate) : '[Joining Date]'}. ${data.employeeName ? 'His/Her' : 'Their'} current salary is ${data.currency} ${data.salary || '[Salary Amount]'}, paid bi-weekly.
          </p>
          
          <p style="margin: 0 0 ${16 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">
            If you have any questions regarding ${data.employeeName ? `${data.employeeName}'s` : 'the employee\'s'} employment, please contact our office at ${data.contactPhone} or ${data.contactEmail}.
          </p>
        </div>
        
        <div style="margin-top: ${32 * scale}px; text-align: left;">
          ${data.signatureImage ? `
            <div style="margin-bottom: ${16 * scale}px;">
              <img src="${data.signatureImage}" alt="Signature" style="max-width: ${128 * scale}px; height: auto;" />
            </div>
          ` : ''}
          <p style="margin: 0 0 ${4 * scale}px 0; font-weight: 600; line-height: 1.6; font-size: ${14 * scale}px;">${data.signatoryName || '[Signatory Name]'}</p>
          <p style="margin: 0 0 ${4 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">${data.signatoryTitle}</p>
          <p style="margin: 0 0 ${4 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">${data.contactEmail}</p>
          <p style="margin: 0; line-height: 1.6; font-size: ${14 * scale}px;">${data.website}</p>
        </div>
      </div>
    `;
  }

  private generateExperienceHTML(data: TemplateData, scale: number = 1): string {
    return `
      <div style="text-align: left; font-family: 'Times New Roman', serif; color: #000;">
        <div style="margin-bottom: ${24 * scale}px;">
          <h1 style="font-size: ${24 * scale}px; font-weight: bold; margin: 0 0 ${8 * scale}px 0;">TO WHOM IT MAY CONCERN</h1>
        </div>
        
        <div style="margin-bottom: ${16 * scale}px;">
          <p style="margin: 0 0 ${16 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">
            This is to certify that ${data.employeeName ? `Mr./Ms. ${data.employeeName}` : '[Employee Name]'} has been working with ${data.companyName} as ${data.position} since ${data.joiningDate ? this.formatDate(data.joiningDate) : '[Joining Date]'}.
          </p>
          
          <p style="margin: 0 0 ${16 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">
            During ${data.employeeName ? 'his/her' : 'their'} tenure, ${data.employeeName ? 'he/she' : 'they'} has shown dedication, professionalism, and excellent work performance.
          </p>
          
          <p style="margin: 0 0 ${16 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">
            We wish ${data.employeeName ? 'him/her' : 'them'} all the best for future endeavors.
          </p>
        </div>
        
        <div style="margin-top: ${32 * scale}px; text-align: left;">
          ${data.signatureImage ? `
            <div style="margin-bottom: ${16 * scale}px;">
              <img src="${data.signatureImage}" alt="Signature" style="max-width: ${128 * scale}px; height: auto;" />
            </div>
          ` : ''}
          <p style="margin: 0 0 ${4 * scale}px 0; font-weight: 600; line-height: 1.6; font-size: ${14 * scale}px;">${data.signatoryName || '[Signatory Name]'}</p>
          <p style="margin: 0 0 ${4 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">${data.signatoryTitle}</p>
          <p style="margin: 0; line-height: 1.6; font-size: ${14 * scale}px;">${data.companyName}</p>
        </div>
      </div>
    `;
  }

  private generateSalaryHTML(data: TemplateData, scale: number = 1): string {
    return `
      <div style="text-align: left; font-family: 'Times New Roman', serif; color: #000;">
        <div style="margin-bottom: ${24 * scale}px;">
          <h1 style="font-size: ${24 * scale}px; font-weight: bold; margin: 0 0 ${8 * scale}px 0;">SALARY CERTIFICATE</h1>
        </div>
        
        <div style="margin-bottom: ${16 * scale}px;">
          <p style="margin: 0 0 ${16 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">
            This is to certify that ${data.employeeName ? `Mr./Ms. ${data.employeeName}` : '[Employee Name]'} is currently employed with ${data.companyName} as ${data.position}.
          </p>
          
          <p style="margin: 0 0 ${16 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">
            ${data.employeeName ? 'His/Her' : 'Their'} current monthly salary is ${data.currency} ${data.salary || '[Salary Amount]'}.
          </p>
          
          <p style="margin: 0 0 ${16 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">
            This certificate is being issued upon ${data.employeeName ? 'his/her' : 'their'} request.
          </p>
        </div>
        
        <div style="margin-top: ${32 * scale}px; text-align: left;">
          ${data.signatureImage ? `
            <div style="margin-bottom: ${16 * scale}px;">
              <img src="${data.signatureImage}" alt="Signature" style="max-width: ${128 * scale}px; height: auto;" />
            </div>
          ` : ''}
          <p style="margin: 0 0 ${4 * scale}px 0; font-weight: 600; line-height: 1.6; font-size: ${14 * scale}px;">${data.signatoryName || '[Signatory Name]'}</p>
          <p style="margin: 0 0 ${4 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">${data.signatoryTitle}</p>
          <p style="margin: 0 0 ${4 * scale}px 0; line-height: 1.6; font-size: ${14 * scale}px;">${data.companyName}</p>
          <p style="margin: 0; line-height: 1.6; font-size: ${14 * scale}px;">${data.contactEmail}</p>
        </div>
      </div>
    `;
  }

  private getTemplateHTML(data: TemplateData, documentType: TemplateKey, scale: number = 1): string {
    switch (documentType) {
      case 'loe': return this.generateLOEHTML(data, scale);
      case 'experience': return this.generateExperienceHTML(data, scale);
      case 'salary': return this.generateSalaryHTML(data, scale);
      default: return this.generateLOEHTML(data, scale);
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

    // Generate the HTML template with proper scaling
    const templateHTML = this.getTemplateHTML(data, documentType, scale);
    tempDiv.innerHTML = templateHTML;

    // Add to DOM temporarily
    document.body.appendChild(tempDiv);

    try {
      // Convert to canvas with MINIMAL interference
      const canvas = await html2canvas(tempDiv, {
        width: width,
        height: height,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false,
        // REMOVE ALL ONCLONE INTERFERENCE - let styles work naturally
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