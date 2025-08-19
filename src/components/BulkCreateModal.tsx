import React, { useState } from "react";
import { X, Upload, FileSpreadsheet, Image } from "lucide-react";

interface BulkCreateModalProps {
  onClose: () => void;
  onExcelSelected: (file: File) => void;
  onSvgSelected: (file: File) => void;
}

const BulkCreateModal: React.FC<BulkCreateModalProps> = ({
  onClose,
  onExcelSelected,
  onSvgSelected,
}) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setExcelFile(file);
    setStatus("");
  };

  const handleSvgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSvgFile(file);
    setStatus("");
  };

  const submitExcel = () => {
    if (!excelFile) {
      setStatus("Please choose an Excel/CSV file.");
      return;
    }
    onExcelSelected(excelFile);
    onClose();
  };

  const submitSvg = () => {
    if (!svgFile) {
      setStatus("Please choose an SVG file.");
      return;
    }
    onSvgSelected(svgFile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-3xl mx-4 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Bulk create</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Upload Excel / CSV</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Accepted: .xlsx, .xls, .csv. First row should contain headers.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={submitExcel}
              className="mt-3 inline-flex items-center justify-center w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!excelFile}
            >
              <Upload className="w-4 h-4 mr-2" /> Use this file
            </button>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Upload SVG background</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Accepted: .svg</p>
            <input
              type="file"
              accept=".svg"
              onChange={handleSvgChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <button
              onClick={submitSvg}
              className="mt-3 inline-flex items-center justify-center w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={!svgFile}
            >
              <Upload className="w-4 h-4 mr-2" /> Use this SVG
            </button>
          </div>
        </div>

        {status && (
          <div className="px-6 pb-6 -mt-2">
            <div className="text-sm text-red-600">{status}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkCreateModal;


