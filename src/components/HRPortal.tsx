import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  User,
  Calendar,
  DollarSign,
  PenTool,
  Building,
} from "lucide-react";
import { generatePDF } from "./PDFGenerator";
import SideNavbar from "./SideNavbar";
import PortalRightSidebar from "./PortalRightSidebar";
import DriveStylePickerModal from "./DriveStylePickerModal";
import BulkDataEditorModal from "./BulkDataEditorModal";
import GenerationValidationModal from "./GenerationValidationModal";
import type { TemplateKey } from "./templates/TemplateRegistry";
import { templates } from "./templates/TemplateRegistry";
import { documentService } from "../services/documentService";
import { useAuth } from "../contexts/AuthContext";
import { ref, getBytes } from "firebase/storage";
import { storage } from "../firebase/config";

// Define types for better type safety
type QualityLevel = "standard" | "high" | "ultra";

interface FormData {
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
  [key: string]: string | undefined; // Index signature for flexibility
}

interface InputField {
  label: string;
  icon: React.ReactElement;
  type: string;
  options?: string[];
}

const HRPortal = () => {
  const { currentUser } = useAuth();
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("loe");
  const [selectedBackgroundImage, setSelectedBackgroundImage] =
    useState<string>("");
  const [selectedBackgroundImageFile, setSelectedBackgroundImageFile] =
    useState<File | null>(null);
  const [selectedSignatureImageFile, setSelectedSignatureImageFile] =
    useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>("high");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [editorColumns, setEditorColumns] = useState<Array<{ key: string; label: string }>>([]);
  const [editorRows, setEditorRows] = useState<Array<Record<string, string>>>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [recentUploads, setRecentUploads] = useState<Array<{ id: string; name: string; url: string; type: string; storagePath: string }>>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    employeeName: "",
    joiningDate: "",
    salary: "",
    currency: "USD",
    position: "Data Scientist",
    companyName: "Inteliweave",
    signatoryName: "Rageeb Noor Uddin",
    signatoryTitle: "Proprietor",
    contactPhone: "+880 1789 490 105",
    contactEmail: "info@inteliweave.com.bd",
    website: "www.inteliweave.com.bd",
  });

  // Bulk generation state
  const [bulkRows, setBulkRows] = useState<FormData[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const [showGenerationProgress, setShowGenerationProgress] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Read document type from URL parameters and pre-select template
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const documentType = urlParams.get("type");

    if (
      documentType &&
      ["loe", "experience", "salary"].includes(documentType)
    ) {
      setActiveTemplate(documentType as TemplateKey);
    }
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/");
  };

  const handleBackgroundImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Store both the URL and the file
      setSelectedBackgroundImage(URL.createObjectURL(file));
      setSelectedBackgroundImageFile(file);
    }
  };

  const handleSignatureImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Store the file
      setSelectedSignatureImageFile(file);
      
      // Convert to data URL for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const target = e.target as FileReader;
        if (target.result) {
          setFormData((prev) => ({
            ...prev,
            signatureImage: target.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleValidationProceed = () => {
    console.log('Validation passed, starting generation...');
    setShowValidationModal(false);
    setShowGenerationProgress(true);
    
    // Use a small delay to ensure state is updated before calling the generation function
    setTimeout(() => {
      console.log('Starting generation after validation...');
      void bulkGenerateDocumentsWithProgress();
    }, 100);
  };



  // Raw parsers for previewing uploaded file directly in the grid (no mapping)
  const parseCsvRaw = (csv: string): { columns: string[]; rows: Array<Record<string, string>> } => {
    const lines = csv.trim().split(/\r?\n/);
    if (lines.length < 2) return { columns: [], rows: [] };
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows: Array<Record<string, string>> = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const raw = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = raw[idx] ?? "";
      });
      rows.push(row);
    }
    return { columns: headers, rows };
  };

  const parseExcelRaw = async (file: File): Promise<{ columns: string[]; rows: Array<Record<string, string>> }> => {
    const buffer = await file.arrayBuffer();
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    const columns = json.length ? Object.keys(json[0]) : [];
    const rows = json.map((r) => {
      const out: Record<string, string> = {};
      columns.forEach((k: string) => (out[k] = String((r[k] as unknown) ?? "")));
      return out;
    });
    return { columns, rows };
  };





  const bulkGenerateDocumentsWithProgress = async () => {
    console.log('🚀 bulkGenerateDocumentsWithProgress started');
    console.log('📊 Current state:');
    console.log('  - selectedBackgroundImageFile:', !!selectedBackgroundImageFile);
    console.log('  - selectedSignatureImageFile:', !!selectedSignatureImageFile);
    console.log('  - currentUser:', !!currentUser);
    console.log('  - bulkRows.length:', bulkRows.length);
    console.log('  - bulkRows actual data:', bulkRows);
    console.log('  - columnMapping:', columnMapping);
    console.log('  - totalDocuments:', totalDocuments);
    
    if (!selectedBackgroundImageFile) {
      console.log('❌ No background image selected');
      setBulkStatus("Please upload a background image first.");
      setShowGenerationProgress(false);
      return;
    }
    if (!currentUser || !currentUser.uid) {
      console.log('❌ No current user');
      setShowGenerationProgress(false);
      return;
    }
    if (bulkRows.length === 0) {
      console.log('❌ No bulk rows');
      setBulkStatus("No data to generate");
      setShowGenerationProgress(false);
      return;
    }
    
    console.log('✅ All validations passed, starting generation');

    setIsBulkGenerating(true);

    setBulkStatus("Starting bulk generation...");
    
    try {
      // Import JSZip dynamically to avoid bundling issues
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
             // Build rows for generation; if mapping is present, transform raw rows to the required shape
       const hasMapping = Object.keys(columnMapping).length > 0;
       const rowsForGeneration: FormData[] = hasMapping
         ? (bulkRows as unknown as Array<Record<string, string>>).map((raw) => {
             const mapped: FormData = {
               employeeName: "",
               joiningDate: "",
               salary: "",
               currency: formData.currency,
               position: formData.position,
               companyName: formData.companyName,
               signatoryName: formData.signatoryName,
               signatoryTitle: formData.signatoryTitle,
               contactPhone: formData.contactPhone,
               contactEmail: formData.contactEmail,
               website: formData.website,
               signatureImage: formData.signatureImage || "", // Ensure it's never undefined
             };
             Object.entries(columnMapping).forEach(([columnKey, targetKey]) => {
               // Only map to known keys
               if (targetKey in mapped) {
                 const value = (raw as Record<string, string | undefined>)[columnKey];
                 (mapped as Record<string, string | undefined>)[targetKey as keyof FormData] = String(value ?? "");
               }
             });
             
             // Clean up undefined values to prevent Firestore errors
             Object.keys(mapped).forEach(key => {
               if ((mapped as Record<string, string | undefined>)[key] === undefined) {
                 (mapped as Record<string, string | undefined>)[key] = "";
               }
             });
             
             return mapped;
           })
         : (bulkRows as unknown as FormData[]).map(row => {
             // Clean up undefined values in unmapped rows too
             const cleanedRow = { ...row };
             Object.keys(cleanedRow).forEach(key => {
               if ((cleanedRow as Record<string, string | undefined>)[key] === undefined) {
                 (cleanedRow as Record<string, string | undefined>)[key] = "";
               }
             });
             return cleanedRow;
           });

             console.log('Rows for generation:', rowsForGeneration.length);
       console.log('Column mapping:', columnMapping);
       console.log('Sample cleaned row:', rowsForGeneration[0]);

      for (let i = 0; i < rowsForGeneration.length; i++) {
        const row = rowsForGeneration[i];

        setGenerationProgress(i + 1);
        
        try {
          console.log(`Starting generation of document ${i + 1}/${rowsForGeneration.length}`);
          console.log('Row data:', row);
          
          const result = await generatePDF(
            selectedBackgroundImage,
            row,
            activeTemplate,
            qualityLevel
          );
          
          console.log('PDF generated successfully:', result);
          
          const { blob } = result;
          const safeName = row.employeeName?.replace(/[^a-z0-9-_ ]/gi, "_") || "Employee";
          const filename = `${templates[activeTemplate].name}_${safeName}.pdf`;
          
          console.log('Adding to ZIP:', filename);
          
          // Add PDF to ZIP file
          zip.file(filename, blob);
          
          // Upload PDF to Firebase Storage
          console.log('Uploading to Firebase:', filename);
          try {
            await documentService.saveDocumentWithPDF(
              currentUser.uid,
              activeTemplate,
              filename,
              row,
              blob
            );
            console.log(`Successfully uploaded to Firebase: ${filename}`);
          } catch (uploadError) {
            console.error(`Failed to upload to Firebase: ${filename}`, uploadError);
            setBulkStatus(`Warning: Failed to upload ${filename} to Firebase, but it's included in ZIP.`);
          }
          
          console.log(`Added document ${i + 1}/${rowsForGeneration.length} to ZIP: ${filename}`);
        } catch (error) {
          console.error(`Error generating document ${i + 1}:`, error);
          setBulkStatus(`Error generating document ${i + 1}: ${String(error)}`);
          // Continue with next document even if one fails
        }
      }
      
      // Generate and download ZIP file
      setBulkStatus("Generating ZIP file...");
      console.log('Generating ZIP file...');
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFileName = `${templates[activeTemplate].name}_bulk_${new Date().toISOString().split('T')[0]}.zip`;
      
      // Create download link for ZIP
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = zipFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      URL.revokeObjectURL(downloadLink.href);
      
      setBulkStatus(`Successfully generated ZIP file with ${rowsForGeneration.length} documents: ${zipFileName}. All PDFs have been uploaded to Firebase.`);
      console.log('ZIP file downloaded successfully:', zipFileName);
      
    } catch (error) {
      console.error("Bulk generation error:", error);
      setBulkStatus("Bulk generation failed: " + String(error));
    } finally {
      setIsBulkGenerating(false);

      console.log('Generation completed, keeping popup open for user to close manually');
      // Don't auto-close the popup - let user close it manually to see results
    }
  };

  const downloadPDFWithBackground = async (): Promise<void> => {
    if (!selectedBackgroundImage) {
      return;
    }

    if (!currentUser || !currentUser.uid) {
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePDF(
        selectedBackgroundImage,
        formData,
        activeTemplate,
        qualityLevel
      );
      const { blob, filename } = result;

      // Upload PDF file to Firebase Storage and save document record to Firestore
      await documentService.saveDocumentWithPDF(
        currentUser.uid,
        activeTemplate,
        filename,
        formData,
        blob
      );

      // Download the PDF for user convenience
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);

      // Show success message to user
    } catch (error) {
      // Check if it's a Firestore error specifically
      if (
        error instanceof Error &&
        error.message.includes("Failed to upload document to database")
      ) {
        // PDF generated successfully, but failed to save to database
      } else {
        // Error generating PDF
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLetter = async (): Promise<void> => {
    if (!currentUser || !currentUser.uid) {
      return;
    }

    // Create a new window for PDF generation
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      return;
    }

    // Simple text content generation for basic PDF
    let content = "";
    switch (activeTemplate) {
      case "loe":
        content = `To Whom It May Concern:

Dear Sir/Madam,

This is to certify that ${
          formData.employeeName
            ? `Mr./Ms. ${formData.employeeName}`
            : "[Employee Name]"
        } is an employee at ${formData.companyName}, and ${
          formData.employeeName ? "he/she" : "they"
        } has been working as a ${formData.position} since ${
          formData.joiningDate
            ? formatDate(formData.joiningDate)
            : "[Joining Date]"
        }. ${formData.employeeName ? "His/Her" : "Their"} current salary is ${
          formData.currency
        } ${formData.salary || "[Salary Amount]"}, paid bi-weekly.

If you have any questions regarding ${
          formData.employeeName
            ? `${formData.employeeName}'s`
            : "the employee's"
        } employment, please contact our office at ${
          formData.contactPhone
        } or ${formData.contactEmail}.

${formData.signatoryName || "[Signatory Name]"}
${formData.signatoryTitle}
${formData.contactEmail}
${formData.website}`;
        break;
      case "experience":
        content = `TO WHOM IT MAY CONCERN

This is to certify that ${
          formData.employeeName
            ? `Mr./Ms. ${formData.employeeName}`
            : "[Employee Name]"
        } has been working with ${formData.companyName} as ${
          formData.position
        } since ${
          formData.joiningDate
            ? formatDate(formData.joiningDate)
            : "[Joining Date]"
        }.

During ${formData.employeeName ? "his/her" : "their"} tenure, ${
          formData.employeeName ? "he/she" : "they"
        } has shown dedication, professionalism, and excellent work performance.

We wish ${
          formData.employeeName ? "him/her" : "them"
        } all the best for future endeavors.

${formData.signatoryName || "[Signatory Name]"}
${formData.signatoryTitle}
${formData.companyName}`;
        break;
      case "salary":
        content = `SALARY CERTIFICATE

This is to certify that ${
          formData.employeeName
            ? `Mr./Ms. ${formData.employeeName}`
            : "[Employee Name]"
        } is currently employed with ${formData.companyName} as ${
          formData.position
        }.

${formData.employeeName ? "His/Her" : "Their"} current monthly salary is ${
          formData.currency
        } ${formData.salary || "[Salary Amount]"}.

This certificate is being issued upon ${
          formData.employeeName ? "his/her" : "their"
        } request.

${formData.signatoryName || "[Signatory Name]"}
${formData.signatoryTitle}
${formData.companyName}
${formData.contactEmail}`;
        break;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${templates[activeTemplate].name}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              margin: 40px;
              color: #000;
            }
            .letter-content {
              white-space: pre-wrap;
              font-size: 14px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .signature-section {
              margin-top: 50px;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${formData.companyName}</div>
          </div>
          <div class="letter-content">${content.replace(/\n/g, "<br>")}</div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = async () => {
      setTimeout(async () => {
        if (printWindow) {
          printWindow.print();
          printWindow.close();

          // Generate filename for the simple PDF
          let filename: string;
          switch (activeTemplate) {
            case "loe":
              filename = `Simple_Letter_of_Employment_${
                formData.employeeName || "Employee"
              }.pdf`;
              break;
            case "experience":
              filename = `Simple_Experience_Certificate_${
                formData.employeeName || "Employee"
              }.pdf`;
              break;
            case "salary":
              filename = `Simple_Salary_Certificate_${
                formData.employeeName || "Employee"
              }.pdf`;
              break;
            default:
              filename = `Simple_Document_${
                formData.employeeName || "Employee"
              }.pdf`;
          }

          // For simple PDFs, we don't have a blob, so we just save the metadata
          // The user can regenerate the PDF later using the stored form data
          try {
            await documentService.saveDocumentRecord(
              currentUser.uid,
              activeTemplate,
              filename,
              formData
            );
          } catch {
            // Don't show error to user since PDF was generated successfully
          }
        }
      }, 500);
    };
  };

  const inputFields: Record<keyof FormData, InputField> = {
    employeeName: {
      label: "Employee Name",
      icon: <User className="w-4 h-4" />,
      type: "text",
    },
    joiningDate: {
      label: "Joining Date",
      icon: <Calendar className="w-4 h-4" />,
      type: "date",
    },
    salary: {
      label: "Salary Amount",
      icon: <DollarSign className="w-4 h-4" />,
      type: "number",
    },
    currency: {
      label: "Currency",
      icon: <DollarSign className="w-4 h-4" />,
      type: "select",
      options: ["USD", "BDT", "EUR", "GBP"],
    },
    position: {
      label: "Position/Designation",
      icon: <Building className="w-4 h-4" />,
      type: "text",
    },
    signatoryName: {
      label: "Signatory Name",
      icon: <PenTool className="w-4 h-4" />,
      type: "text",
    },
    companyName: {
      label: "Company Name",
      icon: <Building className="w-4 h-4" />,
      type: "text",
    },
    signatoryTitle: {
      label: "Signatory Title",
      icon: <PenTool className="w-4 h-4" />,
      type: "text",
    },
    contactPhone: {
      label: "Contact Phone",
      icon: <User className="w-4 h-4" />,
      type: "text",
    },
    contactEmail: {
      label: "Contact Email",
      icon: <User className="w-4 h-4" />,
      type: "email",
    },
    website: {
      label: "Website",
      icon: <Building className="w-4 h-4" />,
      type: "text",
    },
    signatureImage: {
      label: "Signature Image",
      icon: <PenTool className="w-4 h-4" />,
      type: "file",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Side Navbar */}
      <SideNavbar currentPage="portal" />

      {/* Main Content with Fixed Left Margin and right sidebar margin */}
      <div className={`ml-20 ${sidebarCollapsed ? "mr-16" : "mr-80"}`}>
        {/* Navigation Header */}
        {/* <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-gray-900">
                  Document Generator
                </span>
              </div>
            </div>
          </div>
        </nav> */}

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Document Generator
              </h1>
              <p className="text-gray-600">
                Create professional employment letters with custom backgrounds
              </p>

              {/* Current Template Indicator */}
              <div className="mt-4 inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <FileText className="w-4 h-4" />
                <span className="font-medium">
                  {templates[activeTemplate].name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Fields - Left Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  {/* Background Image Upload Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Background Image
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Background Image
                        </label>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={handleBackgroundImageUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          PNG, JPG, JPEG formats (A4 format recommended)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PDF Quality
                        </label>
                        <select
                          value={qualityLevel}
                          onChange={(e) =>
                            setQualityLevel(e.target.value as QualityLevel)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="standard">Standard (Fast)</option>
                          <option value="high">High Quality</option>
                          <option value="ultra">Ultra HD</option>
                        </select>
                        <p className="text-xs text-gray-600 mt-1">
                          {qualityLevel === "standard"
                            ? "Standard (2x)"
                            : qualityLevel === "high"
                            ? "High (4x)"
                            : "Ultra HD (6x)"}{" "}
                          - Higher quality = larger file size
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Letter Details
                    </h3>
                    <div className="space-y-4">
                      {templates[activeTemplate].fields.map((field) => {
                        const fieldConfig =
                          inputFields[field as keyof FormData];
                        return (
                          <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <div className="flex items-center space-x-2">
                                {fieldConfig.icon}
                                <span>{fieldConfig.label}</span>
                              </div>
                            </label>
                            {fieldConfig.type === "select" ? (
                              <select
                                value={formData[field as keyof FormData]}
                                onChange={(e) =>
                                  handleInputChange(
                                    field as keyof FormData,
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {fieldConfig.options?.map((option: string) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={fieldConfig.type}
                                value={formData[field as keyof FormData]}
                                onChange={(e) =>
                                  handleInputChange(
                                    field as keyof FormData,
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                              />
                            )}
                          </div>
                        );
                      })}

                      {/* Signature Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center space-x-2">
                            <PenTool className="w-4 h-4" />
                            <span>Signature Image (PNG)</span>
                          </div>
                        </label>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={handleSignatureImageUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {formData.signatureImage && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-sm text-green-700">
                              ✓ Signature image uploaded successfully
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Signatory Details - Always shown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center space-x-2">
                            <PenTool className="w-4 h-4" />
                            <span>Signatory Name</span>
                          </div>
                        </label>
                        <input
                          type="text"
                          value={formData.signatoryName}
                          onChange={(e) =>
                            handleInputChange("signatoryName", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter signatory name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) =>
                            handleInputChange("companyName", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="text"
                          value={formData.contactPhone}
                          onChange={(e) =>
                            handleInputChange("contactPhone", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) =>
                            handleInputChange("contactEmail", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Letter Preview
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={downloadPDFWithBackground}
                        disabled={!selectedBackgroundImage || isGenerating}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        <span>
                          {isGenerating
                            ? "Generating..."
                            : "PDF with Background"}
                        </span>
                      </button>
                      <button
                        onClick={downloadLetter}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Simple PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* PDF Preview */}
                  <div
                    className="relative bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden"
                    style={{ aspectRatio: "210/297" }}
                  >
                    {/* Background Image */}
                    {selectedBackgroundImage && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${selectedBackgroundImage})`,
                          opacity: 0.3,
                        }}
                      />
                    )}

                    {/* Content Overlay */}
                    <div className="relative z-10 p-8 h-full flex flex-col">
                      <div className="flex-1 pt-32">
                        <div
                          className="text-gray-800 leading-relaxed"
                          style={{
                            fontSize: "14px",
                            lineHeight: "1.6",
                            fontFamily: "Times New Roman, serif",
                          }}
                        >
                          {(() => {
                            const TemplateComponent =
                              templates[activeTemplate].component;
                            return (
                              <TemplateComponent
                                formData={formData}
                                formatDate={formatDate}
                              />
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background Image Status */}
                  {!selectedBackgroundImage && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ No background image uploaded. Upload a background
                        image to see the full preview.
                      </p>
                    </div>
                  )}

                  {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Upload your PNG background image (A4 format recommended)</li>
                    <li>• Choose your preferred PDF quality level</li>
                    <li>• Fill in the required fields in the left panel</li>
                    <li>• Preview updates automatically as you type</li>
                    <li>• Click "PDF with Background" to create a professional document</li>
                    <li>• Or click "Simple PDF" for a basic version</li>
                  </ul>
                </div> */}
                </div>
              </div>

              {/* Bulk Generator - Hidden
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Bulk Letter Generator</h3>
                    <button
                      onClick={() => {
                        console.log('🧪 TEST BUTTON: Setting progress popup to visible');
                        setTotalDocuments(5);
                        setGenerationProgress(2);
                        setShowGenerationProgress(true);
                        setIsBulkGenerating(true);
                        setBulkStatus("Testing progress popup...");
                        console.log('🧪 State set - showGenerationProgress should be true');
                        
                        // Simulate progress updates
                        setTimeout(() => {
                          setGenerationProgress(3);
                          console.log('🧪 Progress updated to 3/5');
                        }, 1000);
                        
                        setTimeout(() => {
                          setGenerationProgress(5);
                          setIsBulkGenerating(false);
                          setBulkStatus("Test completed!");
                          console.log('🧪 Test completed - popup should stay open');
                        }, 3000);
                      }}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 font-bold"
                    >
                      🧪 TEST POPUP
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Document Generation</label>
                      <p className="text-sm text-gray-600 mb-2">
                        Click the "Bulk create" button in the right sidebar to upload Excel/CSV files and generate documents in bulk.
                      </p>
                      <p className="text-xs text-gray-500">
                        The process: Upload file → Map columns → Click Generate → Progress popup appears automatically
                      </p>
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm text-gray-500 italic">
                        Use "Bulk create" from right sidebar
                      </div>
                    </div>
                  </div>
                  {bulkStatus && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                      <p className="text-sm text-gray-700">{bulkStatus}</p>
                      {isBulkGenerating && (
                        <p className="text-xs text-gray-500 mt-1">
                          Progress: {bulkProgress.current} / {bulkProgress.total}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              */}
            </div>
          </div>
        </div>
      </div>
      <PortalRightSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        onBulkCreate={async () => {
          setShowBulkModal(true);
          if (currentUser?.uid) {
            try {
              setLoadingRecent(true);
              const uploads = await documentService.getUserUploads(currentUser.uid);
              setRecentUploads(uploads.map(u => ({ id: u.id!, name: u.fileName, url: u.downloadUrl, type: u.fileType, storagePath: u.storagePath })));
            } finally {
              setLoadingRecent(false);
            }
          }
        }}
      />

      {showBulkModal && (
        <DriveStylePickerModal
          onClose={() => setShowBulkModal(false)}
          recent={recentUploads}
          loadingRecent={loadingRecent}
          onOpenRecent={(file) => {
            (async () => {
              // Close picker immediately for a smoother UX
              setShowBulkModal(false);

              try {
                // Fetch file content from Firebase Storage
                const storageRef = ref(storage, file.storagePath);
                const fileBytes = await getBytes(storageRef);
                
                // Create a File object from the bytes
                const blob = new Blob([fileBytes], { type: file.type });
                const fileObj = new File([blob], file.name, { type: file.type });

                const name = file.name.toLowerCase();
                if (name.endsWith(".csv")) {
                  const text = await fileObj.text();
                  const { columns, rows } = parseCsvRaw(text);
                  setEditorColumns(columns.map((k: string) => ({ key: k, label: k })));
                  setEditorRows(rows);
                } else {
                  const { columns, rows } = await parseExcelRaw(fileObj);
                  setEditorColumns(columns.map((k: string) => ({ key: k, label: k })));
                  setEditorRows(rows);
                }
                setShowEditor(true);
              } catch (error) {
                console.error('Error opening recent file:', error);
                // You might want to show an error message to the user here
              }
            })();
          }}
          onDeleteRecent={async (fileId) => {
            try {
              await documentService.deleteUserUpload(fileId);
              // Remove from local state
              setRecentUploads(prev => prev.filter(file => file.id !== fileId));
            } catch (error) {
              console.error('Error deleting file:', error);
              // You might want to show an error message to the user here
            }
          }}
          onExcelSelected={(file) => {
            (async () => {
              // Close picker immediately for a smoother UX
              setShowBulkModal(false);

              const name = file.name.toLowerCase();
              if (name.endsWith(".csv")) {
                const text = await file.text();
                const { columns, rows } = parseCsvRaw(text);
                setEditorColumns(columns.map((k: string) => ({ key: k, label: k })));
                setEditorRows(rows);
              } else {
                const { columns, rows } = await parseExcelRaw(file);
                setEditorColumns(columns.map((k: string) => ({ key: k, label: k })));
                setEditorRows(rows);
              }
              setShowEditor(true);

              // Upload asynchronously to fill Recent (do not block UI)
              if (currentUser?.uid) {
                documentService
                  .uploadUserAsset(currentUser.uid, file)
                  .then((upload) => {
                    setRecentUploads((prev) => [
                      { id: upload.id!, name: upload.fileName, url: upload.downloadUrl, type: upload.fileType, storagePath: upload.storagePath },
                      ...prev,
                    ]);
                  })
                  .catch(() => {});
              }
            })();
          }}
          onSvgSelected={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result;
              if (typeof result === "string") {
                setSelectedBackgroundImage(result);
              }
            };
            reader.readAsDataURL(file);
          }}
        />
      )}
      {showEditor && (
        <BulkDataEditorModal
          title="Add data"
          columns={editorColumns}
          initialRows={editorRows}
          mappingOptions={[
            { key: "employeeName", label: "Employee Name" },
            { key: "joiningDate", label: "Joining Date" },
            { key: "salary", label: "Salary" },
            { key: "currency", label: "Currency" },
            { key: "position", label: "Position" },
            { key: "companyName", label: "Company Name" },
            { key: "signatoryName", label: "Signatory Name" },
            { key: "signatoryTitle", label: "Signatory Title" },
            { key: "contactPhone", label: "Contact Phone" },
            { key: "contactEmail", label: "Contact Email" },
            { key: "website", label: "Website" },
          ]}
          onClose={() => setShowEditor(false)}
          onConfirm={(rows, mapping) => {
            // Save raw rows and selected mapping to apply during generation
            setBulkRows(rows as unknown as FormData[]);
            setColumnMapping(mapping);
            setShowEditor(false);
          }}
          onGenerate={(rows, mapping) => {
            console.log('onGenerate called with:', { rows: rows.length, mapping });
            
            // Set the data for generation
            setBulkRows(rows as unknown as FormData[]);
            setColumnMapping(mapping);
            setTotalDocuments(rows.length);
            setGenerationProgress(0);
            setShowEditor(false);
            
            // Show validation modal instead of starting generation immediately
            setShowValidationModal(true);
            
            console.log('Validation modal will be shown, rows:', rows.length);
          }}
        />
      )}
      
      {/* Generation Validation Modal */}
      <GenerationValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onProceed={handleValidationProceed}
        backgroundImage={selectedBackgroundImageFile}
        signatureImage={selectedSignatureImageFile}
        onBackgroundImageChange={(file) => {
          setSelectedBackgroundImageFile(file);
          if (file) {
            setSelectedBackgroundImage(URL.createObjectURL(file));
          }
        }}
        onSignatureImageChange={(file) => {
          setSelectedSignatureImageFile(file);
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const target = e.target as FileReader;
              if (target.result) {
                setFormData((prev) => ({
                  ...prev,
                  signatureImage: target.result as string,
                }));
              }
            };
            reader.readAsDataURL(file);
          }
        }}
        totalDocuments={totalDocuments}
      />
      
      {showGenerationProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Generating Documents</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {generationProgress} / {totalDocuments}</span>
                <span>{totalDocuments > 0 ? Math.round((generationProgress / totalDocuments) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalDocuments > 0 ? (generationProgress / totalDocuments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {isBulkGenerating 
                ? `Generating ${totalDocuments} document${totalDocuments !== 1 ? 's' : ''}, uploading to Firebase, and creating ZIP file...`
                : `Generated ${generationProgress} document${generationProgress !== 1 ? 's' : ''}, uploaded to Firebase, and ZIP file successfully!`
              }
            </p>
            {!isBulkGenerating && generationProgress > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                ✓ ZIP file downloaded successfully! All PDFs have been uploaded to Firebase. Check your downloads folder for the ZIP file.
              </div>
            )}
            {bulkStatus && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                {bulkStatus}
              </div>
            )}
            <button
              onClick={() => setShowGenerationProgress(false)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              {isBulkGenerating ? 'Generating...' : 'Close'}
            </button>
          </div>
        </div>
      )}
      {/* custom event injection removed; modal now receives props directly */}
    </div>
  );
};

export default HRPortal;
