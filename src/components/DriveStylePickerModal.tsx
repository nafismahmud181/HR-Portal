import React, { useRef, useState } from "react";
import { FileSpreadsheet, Search, Settings, X } from "lucide-react";

type TabId = "Recent" | "My Drive" | "Shared with me" | "Starred" | "Computers" | "Upload";

interface DriveStylePickerModalProps {
  onClose: () => void;
  onExcelSelected: (file: File) => void;
  onSvgSelected: (file: File) => void;
  recent: Array<{ id: string; name: string; url: string; type: string }>;
  loadingRecent: boolean;
}

const DriveStylePickerModal: React.FC<DriveStylePickerModalProps> = ({
  onClose,
  onExcelSelected,
  onSvgSelected,
  recent,
  loadingRecent,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("Recent");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string>("");

  const routeFile = (file: File | null | undefined) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
      onExcelSelected(file);
      onClose();
      return;
    }
    if (name.endsWith(".svg")) {
      onSvgSelected(file);
      onClose();
      return;
    }
    setError("Unsupported file type. Please upload .csv, .xlsx, .xls, or .svg");
  };

  const handleBrowseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    routeFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError("");
    const file = e.dataTransfer.files?.[0];
    routeFile(file);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[1200px] max-w-[98vw] h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <span className="text-gray-900 font-medium">Open a file</span>
          </div>
          <div className="flex-1 flex items-center ml-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search in Drive or paste URL"
              />
              <Settings className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-gray-200">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            {(["Recent", "My Drive", "Shared with me", "Starred", "Computers", "Upload"] as TabId[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "hover:text-gray-800"}`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 bg-gray-50 flex-1 overflow-auto">
          {activeTab !== "Upload" && (
            <>
              <div className="text-sm text-gray-700 mb-3">Recent</div>
              {loadingRecent ? (
                <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
              ) : recent.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No results found</div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {recent.map((file: { id: string; name: string; url: string }) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-sm"
                    >
                      <div className="h-28 bg-gray-100 rounded mb-3" />
                      <div className="text-sm text-gray-800 truncate">{file.name}</div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "Upload" && (
            <div
              className="h-full min-h-[50vh] flex flex-col items-center justify-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {/* Cloud illustration */}
              <div className="relative mb-6" aria-hidden="true">
                <svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M230 136H104c-22 0-40-18-40-40s18-40 40-40c4 0 8 .6 12 1.8C126 38 145 24 168 24c28 0 52 22 54 49 2-.3 4-.4 6-.4 22 0 40 18 40 40s-18 40-38 40z" fill="#E5E7EB"/>
                  <path d="M150 156H88c-15 0-28-13-28-28s13-28 28-28c2.8 0 5.6.4 8.2 1.3 4.4-13 16.8-22.3 31.8-22.3 18 0 32.8 14 33.8 31.6 1.4-.2 2.8-.3 4.2-.3 15.5 0 28 12.5 28 28s-12.5 28-27.8 28z" fill="#F3F4F6"/>
                </svg>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.svg"
                onChange={handleBrowseChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Browse
              </button>
              <p className="mt-2 text-sm text-gray-500">or drag a file here</p>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveStylePickerModal;


