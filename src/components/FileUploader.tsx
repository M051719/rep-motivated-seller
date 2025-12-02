import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, FileText, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploaderProps {
  currentFile?: string;
  onFileUploaded: (url: string, fileName: string, fileSize: number) => void;
  onFileRemoved: () => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  label?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  currentFile,
  onFileUploaded,
  onFileRemoved,
  bucket = 'templates-forms',
  folder = 'uploads',
  maxSizeMB = 10,
  acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  label = 'Upload File'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };

  const getFileTypeLabel = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'image/jpeg': 'JPEG Image',
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image'
    };
    return typeMap[type] || 'File';
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      const acceptedExtensions = acceptedTypes.map(type => {
        if (type.includes('pdf')) return 'PDF';
        if (type.includes('word')) return 'DOC/DOCX';
        if (type.includes('excel')) return 'XLS/XLSX';
        if (type.includes('image')) return 'Images';
        return '';
      }).filter(Boolean).join(', ');
      
      toast.error(`Please upload a valid file type: ${acceptedExtensions}`);
      return false;
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Generate unique filename
      const fileExt = getFileExtension(file.name);
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `${folder}/${timestamp}-${randomString}.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setUploadProgress(100);
      
      // Call the callback with file info
      onFileUploaded(publicUrl, file.name, file.size);
      
      toast.success('File uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    if (!currentFile) return;

    try {
      // Extract file path from URL
      const url = new URL(currentFile);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join('/');

      // Delete from storage
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      onFileRemoved();
      toast.success('File removed successfully');
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error('Failed to remove file');
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {currentFile ? (
        // Show current file
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">File uploaded</p>
                <a
                  href={currentFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  View file
                </a>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Upload area
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          } ${uploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            type="file"
            onChange={handleChange}
            accept={acceptedTypes.join(',')}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-gray-900">
                  Uploading... {uploadProgress}%
                </p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-100 p-4 rounded-full">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum file size: {maxSizeMB}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Accepted formats: PDF, Word, Excel, Images
      </p>
    </div>
  );
};

export default FileUploader;
