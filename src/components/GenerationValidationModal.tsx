import React, { useState } from 'react';
import { X, Upload, Check, AlertTriangle } from 'lucide-react';

interface GenerationValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  backgroundImage: File | null;
  signatureImage: File | null;
  onBackgroundImageChange: (file: File | null) => void;
  onSignatureImageChange: (file: File | null) => void;
  totalDocuments: number;
}

const GenerationValidationModal: React.FC<GenerationValidationModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  backgroundImage,
  signatureImage,
  onBackgroundImageChange,
  onSignatureImageChange,
  totalDocuments,
}) => {
  const [backgroundImageInput, setBackgroundImageInput] = useState<HTMLInputElement | null>(null);
  const [signatureImageInput, setSignatureImageInput] = useState<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleBackgroundImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onBackgroundImageChange(file);
    }
  };

  const handleSignatureImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSignatureImageChange(file);
    }
  };

  const canProceed = backgroundImage && signatureImage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Validate Generation Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Ready to generate <strong>{totalDocuments}</strong> documents. 
              Please ensure both images are selected before proceeding.
            </p>
          </div>

          {/* Background Image Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Background Image *
            </label>
            {backgroundImage ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="text-green-600" size={16} />
                  <span className="text-sm text-green-800 font-medium">
                    {backgroundImage.name}
                  </span>
                </div>
                <button
                  onClick={() => backgroundImageInput?.click()}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-red-600" size={16} />
                  <span className="text-sm text-red-800">
                    No background image selected
                  </span>
                </div>
                <button
                  onClick={() => backgroundImageInput?.click()}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Upload size={14} />
                  <span>Select</span>
                </button>
              </div>
            )}
            <input
              ref={setBackgroundImageInput}
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageSelect}
              className="hidden"
            />
          </div>

          {/* Signature Image Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Signature Image *
            </label>
            {signatureImage ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="text-green-600" size={16} />
                  <span className="text-sm text-green-800 font-medium">
                    {signatureImage.name}
                  </span>
                </div>
                <button
                  onClick={() => signatureImageInput?.click()}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-red-600" size={16} />
                  <span className="text-sm text-red-800">
                    No signature image selected
                  </span>
                </div>
                <button
                  onClick={() => signatureImageInput?.click()}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Upload size={14} />
                  <span>Select</span>
                </button>
              </div>
            )}
            <input
              ref={setSignatureImageInput}
              type="file"
              accept="image/*"
              onChange={handleSignatureImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            disabled={!canProceed}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              canProceed
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Generation
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerationValidationModal;
