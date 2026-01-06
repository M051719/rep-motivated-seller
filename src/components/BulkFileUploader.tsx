import React, { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  Upload,
  X,
  FileText,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface FileUploaderProps {
  currentFile?: string;
  onFileUploaded: (url: string, fileName: string, fileSize: number) => void;
  onFileRemoved: () => void;
  onBulkFilesUploaded?: (
    files: Array<{ url: string; fileName: string; fileSize: number }>,
  ) => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  label?: string;
  allowMultiple?: boolean;
}

interface UploadStatus {
  fileName: string;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
  url?: string;
  size?: number;
}

const BulkFileUploader: React.FC<FileUploaderProps> = ({
  currentFile,
  onFileUploaded,
  onFileRemoved,
  onBulkFilesUploaded,
  bucket = "templates-forms",
  folder = "uploads",
  maxSizeMB = 10,
  acceptedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/gif",
  ],
  label = "Upload File",
  allowMultiple = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      const acceptedExtensions = acceptedTypes
        .map((type) => {
          if (type.includes("pdf")) return "PDF";
          if (type.includes("word")) return "DOC/DOCX";
          if (type.includes("excel")) return "XLS/XLSX";
          if (type.includes("image")) return "Images";
          return "";
        })
        .filter(Boolean)
        .join(", ");

      toast.error(
        `${file.name}: Invalid file type. Accepted: ${acceptedExtensions}`,
      );
      return false;
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`${file.name}: File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const uploadSingleFile = async (
    file: File,
    index: number,
  ): Promise<{ url: string; fileName: string; fileSize: number } | null> => {
    if (!validateFile(file)) {
      setUploadStatuses((prev) =>
        prev.map((status, i) =>
          i === index
            ? {
                ...status,
                status: "error" as const,
                error: "Validation failed",
              }
            : status,
        ),
      );
      return null;
    }

    try {
      // Update status to uploading
      setUploadStatuses((prev) =>
        prev.map((status, i) =>
          i === index
            ? { ...status, status: "uploading" as const, progress: 0 }
            : status,
        ),
      );

      // Generate unique filename
      const fileExt = getFileExtension(file.name);
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `${folder}/${timestamp}-${randomString}.${fileExt}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadStatuses((prev) =>
          prev.map((status, i) => {
            if (i === index && status.progress < 90) {
              return {
                ...status,
                progress: Math.min(status.progress + 10, 90),
              };
            }
            return status;
          }),
        );
      }, 200);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      // Update status to success
      setUploadStatuses((prev) =>
        prev.map((status, i) =>
          i === index
            ? {
                ...status,
                status: "success" as const,
                progress: 100,
                url: publicUrl,
                size: file.size,
              }
            : status,
        ),
      );

      return { url: publicUrl, fileName: file.name, fileSize: file.size };
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatuses((prev) =>
        prev.map((status, i) =>
          i === index
            ? { ...status, status: "error" as const, error: error.message }
            : status,
        ),
      );
      return null;
    }
  };

  const uploadFiles = async (files: FileList) => {
    setUploading(true);

    // Initialize upload statuses
    const initialStatuses: UploadStatus[] = Array.from(files).map((file) => ({
      fileName: file.name,
      status: "uploading" as const,
      progress: 0,
    }));
    setUploadStatuses(initialStatuses);

    if (allowMultiple && files.length > 1) {
      // Bulk upload
      const uploadPromises = Array.from(files).map((file, index) =>
        uploadSingleFile(file, index),
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(
        (r): r is { url: string; fileName: string; fileSize: number } =>
          r !== null,
      );

      if (successfulUploads.length > 0 && onBulkFilesUploaded) {
        onBulkFilesUploaded(successfulUploads);
        toast.success(
          `Successfully uploaded ${successfulUploads.length} of ${files.length} files!`,
        );
      }

      if (successfulUploads.length < files.length) {
        const failedCount = files.length - successfulUploads.length;
        toast.error(`${failedCount} file(s) failed to upload`);
      }
    } else {
      // Single file upload
      const result = await uploadSingleFile(files[0], 0);
      if (result) {
        onFileUploaded(result.url, result.fileName, result.fileSize);
        toast.success("File uploaded successfully!");
      }
    }

    setTimeout(() => {
      setUploading(false);
      if (!allowMultiple || files.length === 1) {
        setUploadStatuses([]);
      }
    }, 2000);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [allowMultiple],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleRemove = async () => {
    if (!currentFile) return;

    try {
      const url = new URL(currentFile);
      const pathParts = url.pathname.split("/");
      const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join("/");

      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) throw error;

      onFileRemoved();
      toast.success("File removed successfully");
    } catch (error: any) {
      console.error("Remove error:", error);
      toast.error("Failed to remove file");
    }
  };

  const clearUploadStatuses = () => {
    setUploadStatuses([]);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {allowMultiple && "(Multiple files supported)"}
      </label>

      {currentFile && !allowMultiple ? (
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  File uploaded
                </p>
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
        <>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
            } ${uploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <input
              type="file"
              onChange={handleChange}
              accept={acceptedTypes.join(",")}
              disabled={uploading}
              multiple={allowMultiple}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="bg-blue-100 p-4 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Drop {allowMultiple ? "files" : "file"} here, or click to
                  browse
                </p>
                <p className="text-xs text-gray-500">
                  Maximum file size: {maxSizeMB}MB{" "}
                  {allowMultiple && "• Multiple files allowed"}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadStatuses.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Upload Progress (
                  {uploadStatuses.filter((s) => s.status === "success").length}/
                  {uploadStatuses.length})
                </p>
                {!uploading && (
                  <button
                    onClick={clearUploadStatuses}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              {uploadStatuses.map((status, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {status.status === "uploading" && (
                        <Loader className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                      )}
                      {status.status === "success" && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                      {status.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                      <p className="text-sm text-gray-900 truncate flex-1">
                        {status.fileName}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {status.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        status.status === "success"
                          ? "bg-green-600"
                          : status.status === "error"
                            ? "bg-red-600"
                            : "bg-blue-600"
                      }`}
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                  {status.error && (
                    <p className="text-xs text-red-600 mt-1">{status.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Accepted formats: PDF, Word, Excel, Images
      </p>
    </div>
  );
};

export default BulkFileUploader;
