import React, { useState } from "react";
import axios from "axios";
import VideoPlayer from "./components/VideoPlayer.jsx";
import OverlayEditor from "./components/OverlayEditor/OverlayEditor.jsx";

const API_BASE_URL = "http://127.0.0.1:5000";
const TEST_RTSP_URL = "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_1156k.mp4";

function App() {
    const [streamSlug] = useState("test-cam");
    const [rtspUrl, setRtspUrl] = useState(TEST_RTSP_URL);
    const [streamUrl, setStreamUrl] = useState("");
    const [overlays, setOverlays] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const startStream = async () => {
        setIsLoading(true);
        setError("");
        setStreamUrl(""); // Clear previous stream URL

        try {
            // --- CRITICAL FIX: The key must be 'rtsp_url' to match the backend ---
            const response = await axios.post(`${API_BASE_URL}/api/stream/start`, {
                rtsp_url: rtspUrl, // Changed from 'stream_url' to 'rtsp_url'
                slug: streamSlug
            });

            const hlsPath = response.data.hls_url;
            // Set the full URL for the video player
            setStreamUrl(API_BASE_URL + hlsPath);

        } catch (err) {
            const errorMessage = err.response ? err.response.data.error : err.message;
            console.error("Error starting stream:", errorMessage);
            setError(`Failed to start stream: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const stopStream = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/stream/stop/${streamSlug}`);
            setStreamUrl(""); // Clear the video player
            setError("");
        } catch (err) {
            const errorMessage = err.response ? err.response.data.error : err.message;
            console.error("Error stopping stream:", errorMessage);
            setError(`Failed to stop stream: ${errorMessage}`);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1>Full Stack Live Stream Task</h1>

            {/* Input and Control Buttons */}
            <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    placeholder="Enter RTSP URL"
                    value={rtspUrl}
                    onChange={(e) => setRtspUrl(e.target.value)}
                    style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    disabled={isLoading}
                />
                <button onClick={startStream} style={{ padding: '10px 20px', cursor: 'pointer', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }} disabled={isLoading}>
                    {isLoading ? 'Starting...' : 'Start Stream'}
                </button>
                <button onClick={stopStream} style={{ padding: '10px 20px', cursor: 'pointer', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Stop Stream
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                {/* Left Side: Video Player */}
                <div style={{ flex: '2' }}>
                    <h2>Live Stream</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {streamUrl ? (
                        <VideoPlayer url={streamUrl} overlays={overlays} />
                    ) : (
                        <div style={{ border: '1px dashed #ccc', padding: '20px', color: '#aaa', textAlign: 'center' }}>
                            <p>{isLoading ? "Transcoding is starting, please wait..." : "Stream is stopped. Enter a URL and click Start."}</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Overlay Editor */}
                <div style={{ flex: '1' }}>
                    <h2>Overlay Manager</h2>
                    <OverlayEditor
                        streamSlug={streamSlug}
                        onUpdate={setOverlays}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;