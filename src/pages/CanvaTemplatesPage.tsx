import React, { useState, useEffect } from "react";
import {
  Palette,
  Download,
  Share2,
  Image as ImageIcon,
  FileText,
  Layout,
  Upload,
  Plus,
} from "lucide-react";
import { BackButton } from "../components/ui/BackButton";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import FavoriteButton from "../components/FavoriteButton";
import { toast } from "react-hot-toast";

interface CanvaTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  file_url: string;
  thumbnail_url?: string;
  canva_template_id?: string;
  download_count: number;
  favorite_count?: number;
}

const CanvaTemplatesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [templates, setTemplates] = useState<CanvaTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTemplates();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!error && data?.role === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("templates_forms")
        .select("*")
        .eq("category", "canva-template")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      value: "all",
      label: "All Templates",
      icon: <Layout className="w-5 h-5" />,
    },
    {
      value: "Postcard",
      label: "Postcards",
      icon: <FileText className="w-5 h-5" />,
    },
    { value: "Flyer", label: "Flyers", icon: <FileText className="w-5 h-5" /> },
    {
      value: "Business Card",
      label: "Business Cards",
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      value: "Social Media",
      label: "Social Media",
      icon: <Share2 className="w-5 h-5" />,
    },
    {
      value: "Presentation",
      label: "Presentations",
      icon: <ImageIcon className="w-5 h-5" />,
    },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.subcategory === selectedCategory);

  const handleEditInCanva = (template: CanvaTemplate) => {
    if (!template.canva_template_id) {
      toast.error("Canva template ID not configured");
      return;
    }

    const canvaUrl = `https://www.canva.com/design/${template.canva_template_id}/edit`;
    window.open(canvaUrl, "_blank");
    toast.success("Opening template in Canva...");

    // Increment download count
    incrementDownloadCount(template.id);
  };

  const handleDownloadTemplate = (template: CanvaTemplate) => {
    if (template.file_url) {
      window.open(template.file_url, "_blank");
      incrementDownloadCount(template.id);
      toast.success("Downloading template...");
    } else {
      toast.error("Download not available for this template");
    }
  };

  const handleShareTemplate = (template: CanvaTemplate) => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: template.name,
          text: template.description,
          url: shareUrl,
        })
        .then(() => {
          toast.success("Shared successfully!");
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const incrementDownloadCount = async (templateId: string) => {
    try {
      await supabase.rpc("increment_template_download", {
        template_id: templateId,
      });
    } catch (error) {
      console.error("Error incrementing download count:", error);
    }
  };

  const getEmojiForSubcategory = (subcategory: string): string => {
    const emojiMap: { [key: string]: string } = {
      Postcard: "📬",
      Flyer: "📄",
      "Business Card": "💼",
      "Social Media": "📱",
      Presentation: "📊",
    };
    return emojiMap[subcategory] || "📄";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        <div className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Canva Design Templates
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Professional marketing materials powered by Canva
          </p>
        </div>

        {/* Admin Upload Button */}
        {isAdmin && (
          <div className="mb-8 text-center">
            <Link
              to="/admin/template-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Manage Templates
            </Link>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedCategory === category.value
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canva Info Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Palette className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Powered by Canva
              </h3>
              <p className="text-gray-700 mb-3">
                All templates are professionally designed and fully customizable
                in Canva. Edit text, images, colors, and more to match your
                brand.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  ✓ Professional Designs
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  ✓ Easy Customization
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  ✓ High-Quality Export
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
          </div>
        ) : (
          <>
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex items-center justify-center text-8xl">
                    {template.thumbnail_url ? (
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {getEmojiForSubcategory(template.subcategory)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {template.subcategory?.toUpperCase() || "TEMPLATE"}
                      </span>
                      {template.download_count > 0 && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {template.download_count} downloads
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Actions */}
                    <div className="space-y-2">
                      {template.canva_template_id && (
                        <button
                          onClick={() => handleEditInCanva(template)}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Palette className="w-4 h-4" />
                          Edit in Canva
                        </button>
                      )}
                      <div className="flex gap-2">
                        <FavoriteButton
                          templateId={template.id}
                          initialFavorited={false}
                          showCount={true}
                          count={template.favorite_count || 0}
                          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        />
                        {template.file_url && (
                          <button
                            onClick={() => handleDownloadTemplate(template)}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Download</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleShareTemplate(template)}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600">
                  No templates found in this category
                </p>
                {isAdmin && (
                  <Link
                    to="/admin/template-upload"
                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Templates
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Need Help Getting Started?
          </h3>
          <div className="space-y-2 text-gray-700">
            <p>• Click "Edit in Canva" to customize any template</p>
            <p>• All templates open in your Canva account</p>
            <p>• Download high-resolution files for print or digital use</p>
            <p>• Share templates with team members for collaboration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvaTemplatesPage;
