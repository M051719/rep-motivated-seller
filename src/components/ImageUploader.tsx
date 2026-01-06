import React, { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Upload, X, Image as ImageIcon, Loader } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploaderProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageUploaded,
  onImageRemoved,
  bucket = "blog-images",
  folder = "featured",
  maxSizeMB = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateImage = (file: File): boolean => {
    // Check file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
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

  const uploadImage = async (file: File) => {
    if (!validateImage(file)) {
      return;
    }

    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      toast.success("Image uploaded successfully!");
      onImageUploaded(publicUrl);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadImage(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadImage(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    if (!currentImage) return;

    try {
      // Extract filename from URL if it's a Supabase URL
      if (currentImage.includes("supabase")) {
        const urlParts = currentImage.split("/");
        const fileName = urlParts.slice(-2).join("/"); // Get folder/filename.ext

        const { error } = await supabase.storage
          .from(bucket)
          .remove([fileName]);

        if (error) throw error;
      }

      onImageRemoved();
      toast.success("Image removed");
    } catch (error: any) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  return (
    <div className="space-y-4">
      {currentImage ? (
        // Image Preview
        <div className="relative group">
          <img
            src={currentImage}
            alt="Featured"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={handleRemove}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              type="button"
            >
              <X className="w-4 h-4" />
              <span>Remove Image</span>
            </button>
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supported: JPEG, PNG, GIF, WebP (max {maxSizeMB}MB)
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                <span>Choose Image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileInput}
                  disabled={uploading}
                />
              </label>
            </>
          )}
        </div>
      )}

      {/* Image URL Input (fallback) */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Or paste image URL:
        </label>
        <input
          type="url"
          value={currentImage || ""}
          onChange={(e) => onImageUploaded(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>
    </div>
  );
};

export default ImageUploader;
