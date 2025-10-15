# routes/stream.py

from flask import Blueprint, jsonify, request
from ffmpeg_manager import start_stream, stop_stream

stream_bp = Blueprint('stream_bp', __name__)

# Use the same constant for the fallback local video
TEST_VIDEO_FILE = "test_video.mp4"

@stream_bp.route('/start', methods=['POST'])
def handle_start_stream():
    """
    Starts an FFmpeg stream. Expects a JSON body with 'slug' and optional 'rtsp_url'.
    """
    data = request.json
    stream_slug = data.get('slug')
    # Use the provided rtsp_url, or fall back to the local video file
    rtsp_url = data.get('rtsp_url', TEST_VIDEO_FILE)

    if not stream_slug:
        return jsonify({"error": "Required field 'slug' is missing from JSON body"}), 400

    # The function call is changed from 'restart_stream' to 'start_stream'
    if start_stream(rtsp_url, stream_slug):
        # The URL the frontend player will use to access the stream
        hls_url = f"/static/stream/{stream_slug}/output.m3u8"
        return jsonify({
            "message": "Stream started successfully.",
            "hls_url": hls_url
        })
    
    return jsonify({"error": "Failed to start the FFmpeg stream. Check server logs."}), 500


@stream_bp.route('/stop/<string:stream_slug>', methods=['POST'])
def handle_stop_stream(stream_slug):
    """
    Stops an FFmpeg stream using the slug provided in the URL.
    """
    if stop_stream(stream_slug):
        return jsonify({"message": f"Stream '{stream_slug}' stopped successfully."})
    
    return jsonify({"error": f"Stream '{stream_slug}' not found or already stopped."}), 404