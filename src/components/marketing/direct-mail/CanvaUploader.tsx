```typescript
// src/components/marketing/direct-mail/CanvaUploader.tsx
import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface CanvaUploaderProps {
  onFileUploaded: (fileUrl: string, fileName: string) => void;
}

const CanvaUploader: React.FC<CanvaUploaderProps> = ({ onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.includes('pdf')) {
      alert('Please upload a PDF file from Canva');
      return;
    }

    setUploading(true);
    
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `mail-template-${timestamp}.pdf`;
      const filePath = `mail-templates/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('marketing-materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('marketing-materials')
        .getPublicUrl(filePath);

      onFileUploaded(publicUrl, fileName);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        🎨 Upload Your Canva Design
      </h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">📋 How to prepare your Canva design:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Open your Canva postcard/flyer design</li>
          <li>Click "Share" → "Download"</li>
          <li>Select "PDF Print" format</li>
          <li>Download to your computer</li>
          <li>Upload the PDF file below</li>
        </ol>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Uploading your design...</p>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag & drop your Canva PDF here
            </p>
            <p className="text-gray-600 mb-4">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Supports PDF files up to 10MB
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CanvaUploader;
```
