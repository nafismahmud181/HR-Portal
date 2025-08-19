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
import type { TemplateKey } from "./templates/TemplateRegistry";
import { templates } from "./templates/TemplateRegistry";
import { documentService } from "../services/documentService";
import { useAuth } from "../contexts/AuthContext";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>("high");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [editorColumns, setEditorColumns] = useState<Array<{ key: string; label: string }>>([]);
  const [editorRows, setEditorRows] = useState<Array<Record<string, string>>>([]);
  const [recentUploads, setRecentUploads] = useState<Array<{ id: string; name: string; url: string; type: string }>>([]);
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
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

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
      // Store the file path or handle the upload
      setSelectedBackgroundImage(URL.createObjectURL(file));
    }
  };

  const handleSignatureImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
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

  // --- Bulk CSV upload and generation ---
  const parseCsvToRows = (csv: string): FormData[] => {
    const lines = csv.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows: FormData[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const raw = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const row: Partial<FormData> = {};
      headers.forEach((h, idx) => {
        const key = h as keyof FormData;
        const value = raw[idx] ?? "";
        (row as Record<string, string | undefined>)[key] = value;
      });
      // Merge with defaults to ensure all keys exist
      rows.push({
        employeeName: String(row.employeeName ?? ""),
        joiningDate: String(row.joiningDate ?? ""),
        salary: String(row.salary ?? ""),
        currency: String(row.currency ?? formData.currency),
        position: String(row.position ?? formData.position),
        companyName: String(row.companyName ?? formData.companyName),
        signatoryName: String(row.signatoryName ?? formData.signatoryName),
        signatoryTitle: String(row.signatoryTitle ?? formData.signatoryTitle),
        contactPhone: String(row.contactPhone ?? formData.contactPhone),
        contactEmail: String(row.contactEmail ?? formData.contactEmail),
        website: String(row.website ?? formData.website),
        signatureImage: formData.signatureImage,
      });
    }
    return rows;
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

  const parseExcelToRows = async (file: File): Promise<FormData[]> => {
    try {
      const buffer = await file.arrayBuffer();
      // Lazy import to avoid bundling if not used
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Use first row as header (default behavior); ensure stringified values
      const json: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const rows: FormData[] = json.map((obj) => {
        const row = obj as Record<string, unknown>;
        return {
          employeeName: String(row.employeeName ?? ""),
          joiningDate: String(row.joiningDate ?? ""),
          salary: String(row.salary ?? ""),
          currency: String(row.currency ?? formData.currency),
          position: String(row.position ?? formData.position),
          companyName: String(row.companyName ?? formData.companyName),
          signatoryName: String(row.signatoryName ?? formData.signatoryName),
          signatoryTitle: String(row.signatoryTitle ?? formData.signatoryTitle),
          contactPhone: String(row.contactPhone ?? formData.contactPhone),
          contactEmail: String(row.contactEmail ?? formData.contactEmail),
          website: String(row.website ?? formData.website),
          signatureImage: formData.signatureImage,
        };
      });
      return rows;
    } catch {
      setBulkStatus("Failed to parse Excel. Please ensure the headers match the required fields.");
      return [];
    }
  };

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    try {
      // Save raw upload to Firebase Storage for Recent tab
      if (currentUser?.uid) {
        try {
          const upload = await documentService.uploadUserAsset(currentUser.uid, file);
          setRecentUploads((prev) => [{ id: upload.id!, name: upload.fileName, url: upload.downloadUrl, type: upload.fileType }, ...prev]);
        } catch {
          // ignore upload failure for recent list; continue parsing locally
        }
      }
      if (name.endsWith(".csv")) {
        const text = await file.text();
        const rows = parseCsvToRows(text);
        setBulkRows(rows);
        setBulkStatus(`Loaded ${rows.length} rows from ${file.name}.`);
      } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const rows = await parseExcelToRows(file);
        setBulkRows(rows);
        setBulkStatus(`Loaded ${rows.length} rows from ${file.name}.`);
      } else {
        setBulkStatus("Unsupported file type. Please upload .csv, .xlsx, or .xls");
        setBulkRows([]);
      }
    } catch {
      setBulkStatus("Failed to read the file.");
      setBulkRows([]);
    }
  };

  const bulkGenerateDocuments = async () => {
    if (!selectedBackgroundImage) {
      setBulkStatus("Please upload a background image first.");
      return;
    }
    if (!currentUser || !currentUser.uid) return;
    if (bulkRows.length === 0) return;

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: bulkRows.length });
    setBulkStatus("Starting bulk generation...");
    try {
      for (let i = 0; i < bulkRows.length; i++) {
        const row = bulkRows[i];
        setBulkProgress({ current: i + 1, total: bulkRows.length });
        const result = await generatePDF(
          selectedBackgroundImage,
          row,
          activeTemplate,
          qualityLevel
        );
        const { blob } = result;
        const safeName = row.employeeName?.replace(/[^a-z0-9-_ ]/gi, "_") || "Employee";
        const filename = `${templates[activeTemplate].name}_${safeName}.pdf`;
        await documentService.saveDocumentWithPDF(
          currentUser.uid,
          activeTemplate,
          filename,
          row,
          blob
        );
      }
      setBulkStatus(`Successfully generated ${bulkRows.length} documents.`);
    } catch {
      setBulkStatus("Bulk generation interrupted due to an error. Some documents may still have been saved.");
    } finally {
      setIsBulkGenerating(false);
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
      <div className={`ml-20 ${sidebarCollapsed ? "mr-16" : "mr-60"}`}>
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-gray-900">
                  Document Generator
                </span>
              </div>
            </div>
          </div>
        </nav>

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

              {/* Bulk Generator */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Bulk Letter Generator</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV / Excel</label>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleBulkFileChange}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Required headers (first row): employeeName, joiningDate, salary, currency, position, companyName, signatoryName, signatoryTitle, contactPhone, contactEmail, website
                      </p>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={bulkGenerateDocuments}
                        disabled={isBulkGenerating || bulkRows.length === 0}
                        className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {isBulkGenerating ? "Generating..." : "Generate in Bulk"}
                      </button>
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
              setRecentUploads(uploads.map(u => ({ id: u.id!, name: u.fileName, url: u.downloadUrl, type: u.fileType })));
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
          onConfirm={(rows) => {
            // Keep the raw rows for generation; mapping can be used later to transform into FormData
            setBulkRows(rows as unknown as FormData[]);
            // Optionally persist the mapping to apply during generation in the future
            // For now, just close the editor
            setShowEditor(false);
          }}
        />
      )}
      {/* custom event injection removed; modal now receives props directly */}
    </div>
  );
};

export default HRPortal;
