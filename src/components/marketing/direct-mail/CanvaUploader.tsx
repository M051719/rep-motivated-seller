// src/components/marketing/direct-mail/CanvaUploader.tsx
import React, { useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";

interface CanvaUploaderProps {
  onFileUploaded: (fileUrl: string, fileName: string) => void;
}

const CanvaUploader: React.FC<CanvaUploaderProps> = ({ onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PNG, JPG, or PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      // For demo: Create a local URL
      // In production, upload to Supabase Storage or your CDN
      const fileUrl = URL.createObjectURL(file);
      setUploadedFile(file.name);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onFileUploaded(fileUrl, file.name);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">🎨 Upload Your Design</h2>

      <div className="space-y-4">
        {/* Canva Integration Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            📐 Design with Canva
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>
              Create your postcard design in Canva (6" x 4.25" recommended)
            </li>
            <li>Download as PNG or PDF (high quality)</li>
            <li>Upload the file below</li>
          </ol>
          <a
            href="https://www.canva.com/create/postcards/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 hover:text-blue-700 underline"
          >
            Open Canva Postcard Templates →
          </a>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            onChange={handleFileUpload}
            disabled={uploading}
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Uploading...</p>
              </>
            ) : uploadedFile ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <p className="text-gray-900 font-medium">{uploadedFile}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Click to upload a different file
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-900 font-medium mb-1">
                  Click to upload
                </p>
                <p className="text-sm text-gray-600">
                  PNG, JPG, or PDF (max 10MB)
                </p>
              </>
            )}
          </label>
        </div>

        {/* File Requirements */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start">
            <FileText className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Recommended Size</p>
              <p className="text-gray-600">6" x 4.25" (standard postcard)</p>
            </div>
          </div>
          <div className="flex items-start">
            <FileText className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Resolution</p>
              <p className="text-gray-600">300 DPI or higher</p>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-3">📄 Quick Start Templates</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-sm">Foreclosure Prevention</p>
              <p className="text-xs text-gray-600">
                Professional, compassionate
              </p>
            </button>
            <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-sm">Cash Offer</p>
              <p className="text-xs text-gray-600">Bold, attention-grabbing</p>
            </button>
            <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-sm">Land Acquisition</p>
              <p className="text-xs text-gray-600">Clean, modern</p>
            </button>
            <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-sm">Loan Modification</p>
              <p className="text-xs text-gray-600">Trustworthy, helpful</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvaUploader;
