import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  fetchChannelVideos,
  getEmbedUrl,
  formatViews,
  type YouTubeVideo,
} from "../lib/youtube";
import { Play, X, Clock, Eye, Calendar } from "lucide-react";
import { BackButton } from "../components/ui/BackButton";

const VideosPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: "all", label: "All Videos", icon: "🎬" },
    { value: "basics", label: "Foreclosure Basics", icon: "📚" },
    { value: "howto", label: "How-To Guides", icon: "🎓" },
    { value: "success", label: "Success Stories", icon: "🏆" },
    { value: "expert", label: "Expert Interviews", icon: "🎤" },
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedVideo) {
        setSelectedVideo(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedVideo]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const fetchedVideos = await fetchChannelVideos();
      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Categorize videos based on title keywords
  const categorizeVideo = (video: YouTubeVideo): string => {
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();

    if (
      title.includes("success") ||
      title.includes("story") ||
      description.includes("success")
    ) {
      return "success";
    }
    if (
      title.includes("how to") ||
      title.includes("guide") ||
      title.includes("tutorial")
    ) {
      return "howto";
    }
    if (
      title.includes("interview") ||
      title.includes("expert") ||
      title.includes("attorney")
    ) {
      return "expert";
    }
    if (
      title.includes("101") ||
      title.includes("basics") ||
      title.includes("introduction")
    ) {
      return "basics";
    }
    return "general";
  };

  const filteredVideos =
    selectedCategory === "all"
      ? videos
      : videos.filter((video) => categorizeVideo(video) === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading videos from YouTube...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          Video Library - Foreclosure Help Videos | RepMotivatedSeller
        </title>
        <meta
          name="description"
          content="Watch expert tutorials, success stories, and how-to guides on foreclosure prevention."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <BackButton />
        </div>
        {/* Hero */}
        <section className="bg-gradient-to-br from-red-900 via-pink-800 to-purple-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">🎬 Video Library</h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Watch expert tutorials, success stories, and step-by-step guides
              from our YouTube channel
            </p>
            {videos.length > 0 && (
              <p className="text-red-200 mt-4">
                {videos.length} videos • Updated regularly
              </p>
            )}
          </div>
        </section>

        {/* YouTube Setup Notice */}
        {videos.length === 0 && !loading && (
          <section className="py-12 bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="text-5xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                YouTube Integration Setup Required
              </h2>
              <div className="text-left bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-bold text-lg mb-3">
                  To display your YouTube videos:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable YouTube Data API v3</li>
                  <li>
                    Create an API key (Credentials → Create Credentials → API
                    Key)
                  </li>
                  <li>
                    Add to your{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">.env</code>{" "}
                    file:
                    <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">
                      {`VITE_YOUTUBE_API_KEY=your_api_key_here
VITE_YOUTUBE_CHANNEL_ID=your_channel_id_here`}
                    </pre>
                  </li>
                  <li>
                    Find your Channel ID in YouTube Studio → Settings → Channel
                    → Advanced settings
                  </li>
                  <li>Restart your development server</li>
                </ol>
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> The YouTube Data API has a daily
                    quota. The free tier typically allows 10,000 units per day,
                    which is sufficient for most applications.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <>
            {/* Categories */}
            <section className="py-8 bg-white shadow-md">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-wrap gap-4 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        selectedCategory === category.value
                          ? "bg-red-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category.icon} {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Video */}
            {selectedCategory === "all" && videos.length > 0 && (
              <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">⭐</span> Most Recent Video
                  </h2>
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl overflow-hidden shadow-lg">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div
                        className="relative aspect-video bg-black cursor-pointer group"
                        onClick={() => setSelectedVideo(videos[0])}
                      >
                        <img
                          src={videos[0].thumbnail}
                          alt={videos[0].title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all">
                          <button className="w-24 h-24 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play
                              className="w-12 h-12 text-red-600 ml-2"
                              fill="currentColor"
                            />
                          </button>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-semibold">
                          {videos[0].duration}
                        </div>
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold w-fit mb-4">
                          Latest Upload
                        </span>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                          {videos[0].title}
                        </h3>
                        <p className="text-gray-700 mb-4 text-lg line-clamp-3">
                          {videos[0].description}
                        </p>
                        <div className="flex items-center space-x-6 text-gray-600">
                          <span className="flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            {videos[0].duration}
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-5 h-5 mr-2" />
                            {formatViews(videos[0].viewCount)} views
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            {formatDate(videos[0].publishedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Videos Grid */}
            <section className="py-12">
              <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  {selectedCategory === "all"
                    ? `All Videos (${filteredVideos.length})`
                    : `${categories.find((c) => c.value === selectedCategory)?.label} (${filteredVideos.length})`}
                </h2>
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      No videos in this category
                    </h3>
                    <p className="text-gray-600">
                      Try selecting a different category or check back soon for
                      new content.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedVideo(video)}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-black group">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                            <button className="w-16 h-16 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-all">
                              <Play
                                className="w-8 h-8 text-red-600 ml-1"
                                fill="currentColor"
                              />
                            </button>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-semibold">
                            {video.duration}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {video.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {formatViews(video.viewCount)}
                            </span>
                            <span className="text-xs">
                              {formatDate(video.publishedAt)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Video Modal with YouTube Embed */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto"
              onClick={() => setSelectedVideo(null)}
            >
              {/* Hint text */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full pointer-events-none">
                Click anywhere outside to close • Press ESC
              </div>

              <motion.div
                className="bg-white rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden relative my-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Large Close Button - Inside Modal */}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center z-20 shadow-lg transition-all hover:scale-110"
                  aria-label="Close video"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="relative">
                  {/* YouTube Embed */}
                  <div className="aspect-video bg-black">
                    <iframe
                      src={`${getEmbedUrl(selectedVideo.videoId)}?autoplay=1&rel=0`}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>

                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 pr-16">
                      {selectedVideo.title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {selectedVideo.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedVideo.duration}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {formatViews(selectedVideo.viewCount)} views
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(selectedVideo.publishedAt)}
                      </span>
                    </div>

                    {/* Back to Library Button */}
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="mt-6 w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all"
                    >
                      ← Back to Video Library
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-red-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-6">Ready to Take Action?</h2>
            <p className="text-xl mb-8">
              These videos provide great information, but personal guidance
              makes all the difference
            </p>
            <Link
              to="/foreclosure"
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Get Personal Help Now
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default VideosPage;
