import React, { useState, useEffect } from "react";
import { GLBAEncryption } from "../lib/encryption/glba-encryption";
import { GLBAKeyManagement } from "../lib/security/key-management";
import { supabase } from "../lib/supabase";

interface SecureDocument {
  id: string;
  filename: string;
  encrypted_content: string;
  content_type: string;
  uploaded_at: string;
  expires_at?: string;
  access_count: number;
  client_id: string;
  is_active: boolean;
}

const GLBADocumentPortal: React.FC = () => {
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);

  useEffect(() => {
    loadDocuments();
    checkComplianceStatus();
  }, []);

  const checkComplianceStatus = () => {
    const status = GLBAEncryption.validateCompliance();
    setComplianceStatus(status);
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("secure_documents")
        .select("*")
        .eq("is_active", true)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error loading documents:", error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadSecureDocument = async (file: File, expirationDays?: number) => {
    setUploading(true);
    try {
      // Validate file type (only allow specific financial document types)
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("❌ File type not allowed for financial documents");
        return;
      }

      // Read file content
      const fileContent = await file.arrayBuffer();
      const fileBase64 = Buffer.from(fileContent).toString("base64");

      // Get encryption key for document encryption
      const encryptionKey = await GLBAKeyManagement.getActiveKey();
      if (!encryptionKey?.key_data) {
        alert("❌ Encryption key not available - contact administrator");
        return;
      }

      // Encrypt the document content
      const encryptedDocument = await GLBAEncryption.encryptNPI(
        fileBase64,
        encryptionKey.id,
      );

      // Set expiration if specified
      let expiresAt: string | undefined;
      if (expirationDays) {
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + expirationDays);
        expiresAt = expiration.toISOString();
      }

      // Store in database
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("secure_documents").insert({
        filename: file.name,
        encrypted_content: JSON.stringify(encryptedDocument),
        content_type: file.type,
        expires_at: expiresAt,
        client_id: user.user?.id,
        is_active: true,
        access_count: 0,
      });

      if (error) {
        alert(`❌ Upload failed: ${error.message}`);
        return;
      }

      // Audit log
      await supabase.from("document_audit_log").insert({
        action: "upload",
        filename: file.name,
        user_id: user.user?.id,
        timestamp: new Date().toISOString(),
        compliance_status: "glba_encrypted",
      });

      alert("✅ Document uploaded and encrypted successfully!");
      await loadDocuments();
    } catch (error) {
      alert(`❌ Upload error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadSecureDocument = async (doc: SecureDocument) => {
    try {
      // Get decryption key
      const decryptionKey = await GLBAKeyManagement.getActiveKey();
      if (!decryptionKey?.key_data) {
        alert("❌ Decryption key not available");
        return;
      }

      // Decrypt document
      const encryptedData = JSON.parse(doc.encrypted_content);
      const decryptedBase64 = await GLBAEncryption.decryptNPI(encryptedData);
      const decryptedBytes = Uint8Array.from(
        atob(decryptedBase64),
        (c) => c.charCodeAt(0),
      );

      // Create download blob
      const blob = new Blob([decryptedBytes.buffer], {
        type: doc.content_type,
      });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const a = window.document.createElement("a");
      a.href = url;
      a.download = doc.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update access count
      await supabase
        .from("secure_documents")
        .update({ access_count: doc.access_count + 1 })
        .eq("id", doc.id);

      // Audit log
      await supabase.from("document_audit_log").insert({
        action: "download",
        filename: doc.filename,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        timestamp: new Date().toISOString(),
        document_id: doc.id,
      });
    } catch (error) {
      alert(`❌ Download failed: ${error.message}`);
    }
  };

  const revokeDocumentAccess = async (documentId: string) => {
    try {
      await supabase
        .from("secure_documents")
        .update({ is_active: false })
        .eq("id", documentId);

      alert("✅ Document access revoked");
      await loadDocuments();
    } catch (error) {
      alert(`❌ Revocation failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* GLBA Compliance Status */}
      <div
        className={`p-6 rounded-lg border ${complianceStatus?.isCompliant ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {complianceStatus?.isCompliant ? "✅" : "❌"} GLBA Compliance Status
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">FIPS 140-2 Algorithm:</span>
            <span
              className={`ml-2 px-2 py-1 rounded ${complianceStatus?.checks?.fips140_2_algorithm ? "bg-green-100" : "bg-red-100"}`}
            >
              {complianceStatus?.checks?.fips140_2_algorithm
                ? "Compliant"
                : "Non-Compliant"}
            </span>
          </div>
          <div>
            <span className="font-semibold">Key Length:</span>
            <span
              className={`ml-2 px-2 py-1 rounded ${complianceStatus?.checks?.adequate_key_length ? "bg-green-100" : "bg-red-100"}`}
            >
              {complianceStatus?.checks?.adequate_key_length
                ? "AES-256"
                : "Insufficient"}
            </span>
          </div>
          <div>
            <span className="font-semibold">Authentication:</span>
            <span
              className={`ml-2 px-2 py-1 rounded ${complianceStatus?.checks?.authentication_tag ? "bg-green-100" : "bg-red-100"}`}
            >
              {complianceStatus?.checks?.authentication_tag
                ? "GCM Mode"
                : "Missing"}
            </span>
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-4">🔐 Secure Document Upload</h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="secure-upload"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.xlsx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const days = parseInt(
                    prompt("Set expiration days (optional):") || "0",
                  );
                  uploadSecureDocument(file, days || undefined);
                }
              }}
            />
            <label
              htmlFor="secure-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  🔐 Encrypting and uploading...
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">📁</div>
                  <div className="font-semibold">
                    Click to upload secure financial document
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Supported: PDF, Images, Excel, Text (AES-256 encrypted)
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-4">📄 Encrypted Documents</h3>
        {documents.length === 0 ? (
          <p className="text-gray-500">No encrypted documents found</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-semibold">{doc.filename}</div>
                  <div className="text-sm text-gray-500">
                    Uploaded: {new Date(doc.uploaded_at).toLocaleString()} |
                    Access Count: {doc.access_count} |
                    {doc.expires_at &&
                      `Expires: ${new Date(doc.expires_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadSecureDocument(doc)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => revokeDocumentAccess(doc.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    🚫 Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GLBADocumentPortal;
