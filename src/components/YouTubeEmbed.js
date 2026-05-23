import React, { useState } from 'react';

export const YouTubeEmbed = ({ 
  videoUrl, 
  isLive = false, 
  className = '',
  autoplay = false 
}) => {
  const [chatOpen, setChatOpen] = useState(true);

  // Extract video ID from various YouTube URL formats
  const getVideoId = (url) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className="w-full min-h-[400px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center p-10">
        <div className="text-center">
          <span className="text-5xl block mb-4">⚠️</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 m-0">Invalid YouTube URL</h3>
          <p className="text-sm text-gray-600 m-0">Please check the YouTube link and try again</p>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1&' : ''}enablejsapi=1&origin=${window.location.origin}`;

  return (
    <div className={`w-full bg-gray-900 rounded-xl overflow-hidden shadow-soft-lg ${className}`}>
      <div className={`flex relative ${chatOpen && isLive ? 'h-[600px]' : ''}`}>
        {/* Video Player */}
        <div className="flex-1 relative bg-black">
          {isLive && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-md flex items-center gap-2 z-10 font-semibold text-xs shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>LIVE</span>
            </div>
          )}
          
          <iframe
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className={`w-full h-full ${chatOpen && isLive ? 'min-h-[600px]' : 'min-h-[400px]'}`}
          ></iframe>
        </div>

        {/* Live Chat Sidebar (only for live videos) */}
        {isLive && (
          <div className={`bg-gray-50 border-l border-gray-200 flex flex-col transition-all duration-300 ${chatOpen ? 'w-[360px]' : 'w-[50px]'}`}>
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
              {chatOpen && <h3 className="text-base font-semibold text-gray-900 m-0">Live Chat</h3>}
              <button 
                className="p-1.5 text-lg text-gray-600 rounded transition-colors hover:bg-gray-100"
                onClick={() => setChatOpen(!chatOpen)}
                aria-label="Toggle chat"
              >
                {chatOpen ? '→' : '←'}
              </button>
            </div>
            
            {chatOpen && (
              <iframe
                src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`}
                title="YouTube Live Chat"
                frameBorder="0"
                className="flex-1 w-full border-0"
              ></iframe>
            )}
          </div>
        )}
      </div>

      {/* Video Info Bar */}
      <div className="px-4 py-3 bg-gray-900 border-t border-white/10">
        <div className="flex items-center justify-between gap-4">
          <a 
            href={videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white no-underline rounded-md text-sm font-medium transition-colors hover:bg-white/20"
          >
            Watch on YouTube
          </a>
          {isLive && (
            <span className="flex items-center gap-2 text-white/80 text-sm">
              <span className="text-base">👥</span>
              <span>Live viewers</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeEmbed;
