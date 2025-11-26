import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FacebookService, { FacebookPost, FacebookPage, FacebookEvent } from '../../services/social/FacebookService'

const FacebookFeed: React.FC = () => {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [pageInfo, setPageInfo] = useState<FacebookPage | null>(null)
  const [events, setEvents] = useState<FacebookEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts')

  useEffect(() => {
    loadFacebookData()
  }, [])

  const loadFacebookData = async () => {
    try {
      const [pageData, postsData, eventsData] = await Promise.all([
        FacebookService.getPageInfo(),
        FacebookService.getPagePosts(12),
        FacebookService.getPageEvents(6)
      ])

      setPageInfo(pageData)
      setPosts(postsData)
      setEvents(eventsData)
    } catch (error) {
      console.error('Error loading Facebook data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPostContent = (post: FacebookPost) => {
    const content = post.message || post.story || ''
    if (content.length > 200) {
      return content.substring(0, 200) + '...'
    }
    return content
  }

  const getEngagementCount = (post: FacebookPost) => {
    const likes = post.likes?.summary?.total_count || 0
    const comments = post.comments?.summary?.total_count || 0
    const shares = post.shares?.count || 0
    return likes + comments + shares
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      {pageInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative mb-8">
            {pageInfo.cover && (
              <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                <img
                  src={pageInfo.cover.source}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="bg-white p-2 rounded-full shadow-lg">
                <img
                  src={pageInfo.picture.data.url}
                  alt={pageInfo.name}
                  className="w-24 h-24 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📘 {pageInfo.name}
            </h1>
            
            {pageInfo.about && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                {pageInfo.about}
              </p>
            )}

            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {pageInfo.fan_count?.toLocaleString() || '0'}
                </div>
                <div className="text-gray-500">Followers</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {posts.length}
                </div>
                <div className="text-gray-500">Recent Posts</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={FacebookService.getPageUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                👍 Like Our Page
              </a>
              
              <button
                onClick={() => {
                  const shareUrl = FacebookService.generateShareUrl(window.location.href, 'Check out RepMotivatedSeller for foreclosure help!')
                  window.open(shareUrl, '_blank', 'width=600,height=400')
                }}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                🔗 Share Page
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-md p-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            📝 Posts ({posts.length})
          </button>
          
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            📅 Events ({events.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'posts' && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Post Image */}
                  {post.full_picture && (
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={post.full_picture}
                        alt="Post"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                      <span>{FacebookService.formatDate(post.created_time)}</span>
                      <div className="flex items-center space-x-3">
                        {post.likes && (
                          <span className="flex items-center space-x-1">
                            <span>👍</span>
                            <span>{post.likes.summary.total_count}</span>
                          </span>
                        )}
                        {post.comments && (
                          <span className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>{post.comments.summary.total_count}</span>
                          </span>
                        )}
                        {post.shares && (
                          <span className="flex items-center space-x-1">
                            <span>🔄</span>
                            <span>{post.shares.count}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4">
                      {formatPostContent(post)}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {getEngagementCount(post)} interactions
                      </div>
                      
                      <a
                        href={post.permalink_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View on Facebook →
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No posts available
                </h3>
                <p className="text-gray-600">
                  Check back later for new content from our Facebook page.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Events Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Event Cover */}
                  {event.cover && (
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={event.cover.source}
                        alt={event.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-blue-100 rounded-lg p-3 text-center min-w-[60px]">
                        <div className="text-xs text-blue-600 font-medium">
                          {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </div>
                        <div className="text-lg font-bold text-blue-800">
                          {new Date(event.start_time).getDate()}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {event.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {new Date(event.start_time).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {event.place && (
                      <div className="flex items-center space-x-2 text-gray-600 mb-3">
                        <span>📍</span>
                        <span className="text-sm">
                          {event.place.name}, {event.place.location.city}, {event.place.location.state}
                        </span>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        {event.description.length > 150 
                          ? event.description.substring(0, 150) + '...'
                          : event.description
                        }
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <span>✅</span>
                          <span>{event.attending_count} going</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span>{event.interested_count} interested</span>
                        </span>
                      </div>

                      <a
                        href={`https://www.facebook.com/events/${event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Event
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {events.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No upcoming events
                </h3>
                <p className="text-gray-600">
                  Follow our Facebook page to stay updated on future events.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🤝 Join Our Community
        </h2>
        <p className="text-gray-600 mb-6">
          Stay connected with us on Facebook for the latest updates, tips, and community support.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <a
            href={FacebookService.getPageUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            👍 Follow Our Page
          </a>
          <a
            href="/contact"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            📞 Get Help Now
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export default FacebookFeed