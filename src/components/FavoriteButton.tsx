import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

interface FavoriteButtonProps {
  templateId: string;
  initialFavorited?: boolean;
  className?: string;
  showCount?: boolean;
  count?: number;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  templateId,
  initialFavorited = false,
  className = "",
  showCount = false,
  count = 0,
}) => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(count);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFavorite();
  }, [templateId]);

  const checkAuthAndFavorite = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        // Check if user has favorited this template
        const { data, error } = await supabase
          .from("user_template_favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("template_id", templateId)
          .single();

        if (!error && data) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      // Not favorited or error
      setIsFavorited(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to favorite templates");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc("toggle_template_favorite", {
        template_uuid: templateId,
      });

      if (error) throw error;

      setIsFavorited(data);
      setFavoriteCount((prev) => (data ? prev + 1 : Math.max(0, prev - 1)));

      toast.success(data ? "Added to favorites!" : "Removed from favorites");
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`group relative inline-flex items-center gap-2 transition-all ${className} ${
        isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
      }`}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          isFavorited
            ? "fill-red-500 text-red-500"
            : "text-gray-400 group-hover:text-red-500"
        }`}
      />
      {showCount && favoriteCount > 0 && (
        <span className="text-sm font-medium text-gray-600">
          {favoriteCount}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
