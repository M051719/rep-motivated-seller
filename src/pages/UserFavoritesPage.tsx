import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Heart, Download, FileText, Trash2 } from "lucide-react";
import { BackButton } from "../components/ui/BackButton";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface Favorite {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  file_url: string;
  download_count: number;
  is_featured: boolean;
  favorited_at: string;
}

const UserFavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_user_favorites");

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuthAndFetchFavorites = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      await fetchFavorites();
    } catch (error) {
      console.error("Error checking auth:", error);
      setLoading(false);
    }
  }, [fetchFavorites]);

  useEffect(() => {
    checkAuthAndFetchFavorites();
  }, [checkAuthAndFetchFavorites]);

  const handleRemoveFavorite = async (templateId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_template_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("template_id", templateId);

      if (error) throw error;

      setFavorites((prev) => prev.filter((f) => f.id !== templateId));
      toast.success("Removed from favorites");
    } catch (error: any) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    }
  };

  const handleDownload = async (favorite: Favorite) => {
    try {
      window.open(favorite.file_url, "_blank");

      await supabase.rpc("increment_template_download", {
        template_id: favorite.id,
      });

      // Update local state
      setFavorites((prev) =>
        prev.map((f) =>
          f.id === favorite.id
            ? { ...f, download_count: f.download_count + 1 }
            : f,
        ),
      );

      toast.success("Opening document...");
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <BackButton />
          <div className="mt-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please Sign In
            </h2>
            <p className="text-gray-600 mb-8">
              You need to be signed in to view your favorite templates
            </p>
            <a
              href="/auth"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-xl text-gray-600">
            Your saved templates and forms
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-8">
              Start adding templates to your favorites to see them here
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/canva-templates"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Canva Templates
              </a>
              <a
                href="/contracts"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Contracts
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              {favorites.length} favorite{favorites.length !== 1 ? "s" : ""}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        {favorite.subcategory || favorite.category}
                      </span>
                      {favorite.is_featured && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="mb-4">
                      <FileText className="w-12 h-12 text-blue-600" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {favorite.name}
                    </h3>

                    {/* Description */}
                    {favorite.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {favorite.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span>{favorite.download_count} downloads</span>
                      <span>
                        Saved{" "}
                        {new Date(favorite.favorited_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(favorite)}
                        className="flex-1 inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserFavoritesPage;
