import React, { useRef, useEffect } from "react";
import Hls from "hls.js";
import OverlayItem from "./OverlayEditor/OverlayItem.jsx";

const VideoPlayer = ({ url, overlays }) => {
  const videoRef = useRef();
  
  // HLS Playback Logic
  useEffect(() => {
    if (!url) return;

    const video = videoRef.current;
    let hls; 

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }

    return () => {
      if (hls) hls.destroy();
      if (video) video.pause();
    };
  }, [url]);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', border: '2px solid #333' }}>
      
      {/* 1. The Video Element */}
      <video 
        ref={videoRef} 
        controls 
        autoPlay 
        muted 
        style={{ width: '100%', height: '100%', display: 'block' }} 
      />
      
      {/* NOTE: Client-Side overlays are currently handled by FFmpeg, but we render 
         them here for visual consistency and future dragging capability.
         In a true solution, we would check if a config is 'client-side' or 'server-side'. */}
      
      {overlays.map(overlay => (
        <OverlayItem 
          key={overlay.id} 
          overlay={overlay} 
        />
      ))}
      
    </div>
  );
};

export default VideoPlayer;