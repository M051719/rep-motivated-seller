/**
 * GLBA Document Portal
 * Secure document upload/download with end-to-end encryption
 * All documents are encrypted with AES-256-GCM before storage
 */

import React, { useState, useEffect } from "react";
import {
  Upload,
  Download,
  Trash2,
  Lock,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";
import { GLBAEncryption } from "../../lib/encryption/glba-encryption";
import { GLBAAccessControl } from "../../lib/security/glba-access-control";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "",
);

interface SecureDocument {
  id: string;
  filename: string;
  file_size: number;
  encrypted_data: any;
  uploaded_by: string;
  uploaded_at: string;
  expires_at?: string;
  access_count: number;
  last_accessed_at?: string;
}

export default function GLBADocumentPortal() {
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadUserAndDocuments();
  }, []);

  const loadUserAndDocuments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadDocuments(user.id);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  };

  const loadDocuments = async (uid: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("secure_documents")
        .select("*")
        .eq("uploaded_by", uid)
        .order("uploaded_at", { ascending: false });

      if (fetchError) throw fetchError;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check access permission
      const hasAccess = await GLBAAccessControl.checkNPIAccess({
        userId,
        npiType: "document",
        resourceId: file.name,
        purpose: "Document upload",
      });

      if (!hasAccess) {
        throw new Error(
          "Access denied: You do not have permission to upload documents",
        );
      }

      // Read file content
      const fileContent = await readFileAsBase64(file);

      // Encrypt the file content
      const encryptedData = await GLBAEncryption.encryptNPI(
        fileContent,
        "document",
      );

      // Store encrypted document in database
      const { data, error: uploadError } = await supabase
        .from("secure_documents")
        .insert({
          filename: file.name,
          file_size: file.size,
          encrypted_data: encryptedData,
          uploaded_by: userId,
          uploaded_at: new Date().toISOString(),
          access_count: 0,
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      setSuccess(`Successfully uploaded and encrypted: ${file.name}`);
      await loadDocuments(userId);

      // Clear file input
      event.target.value = "";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload document",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: SecureDocument) => {
    setDownloading(doc.id);
    setError(null);

    try {
      // Check access permission
      const hasAccess = await GLBAAccessControl.checkNPIAccess({
        userId,
        npiType: "document",
        resourceId: doc.id,
        purpose: "Document download",
      });

      if (!hasAccess) {
        throw new Error(
          "Access denied: You do not have permission to download this document",
        );
      }

      // Decrypt the document
      const decryptedContent = await GLBAEncryption.decryptNPI(
        doc.encrypted_data,
      );

      // Convert base64 back to blob and trigger download
      const blob = base64ToBlob(decryptedContent);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update access count
      await supabase
        .from("secure_documents")
        .update({
          access_count: doc.access_count + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq("id", doc.id);

      await loadDocuments(userId);
      setSuccess(`Successfully downloaded: ${doc.filename}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download document",
      );
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (doc: SecureDocument) => {
    if (
      !confirm(
        `Are you sure you want to delete ${doc.filename}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const hasAccess = await GLBAAccessControl.checkNPIAccess({
        userId,
        npiType: "document",
        resourceId: doc.id,
        purpose: "Document deletion",
      });

      if (!hasAccess) {
        throw new Error(
          "Access denied: You do not have permission to delete this document",
        );
      }

      const { error: deleteError } = await supabase
        .from("secure_documents")
        .delete()
        .eq("id", doc.id);

      if (deleteError) throw deleteError;

      setSuccess(`Successfully deleted: ${doc.filename}`);
      await loadDocuments(userId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete document",
      );
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Extract base64 part after comma
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const base64ToBlob = (base64: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Secure Document Portal
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            All documents are encrypted with AES-256-GCM before storage
          </p>
        </div>

        {/* Encryption Status */}
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-green-800">
                <strong>GLBA Compliant:</strong> End-to-end encryption enabled.
                All documents are encrypted before upload and decrypted only
                when you download them.
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Upload className="h-6 w-6 mr-2" />
            Upload Secure Document
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading || !userId}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer ${uploading || !userId ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {uploading
                  ? "Encrypting and uploading..."
                  : "Click to upload a document"}
              </p>
              <p className="text-sm text-gray-600">
                Documents are automatically encrypted with AES-256-GCM
              </p>
            </label>
          </div>

          {!userId && (
            <p className="mt-4 text-sm text-red-600">
              You must be logged in to upload documents
            </p>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Your Encrypted Documents ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No documents uploaded yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Upload your first document to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Lock className="h-6 w-6 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          {doc.filename}
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Encrypted
                          </span>
                        </h3>

                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(doc.uploaded_at)}
                          </span>
                          <span>•</span>
                          <span>
                            Downloaded {doc.access_count} time
                            {doc.access_count !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {doc.last_accessed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last accessed: {formatDate(doc.last_accessed_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={downloading === doc.id}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloading === doc.id ? "Decrypting..." : "Download"}
                      </button>

                      <button
                        onClick={() => handleDelete(doc)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Features
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                All documents encrypted with AES-256-GCM (FIPS 140-2 approved)
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Documents are encrypted before leaving your browser</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Only you can decrypt and access your documents</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                All access attempts are logged for compliance (7-year retention)
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>GLBA compliant with automated audit trails</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
