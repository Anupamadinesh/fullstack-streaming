# ffmpeg_manager.py

import subprocess
import os
import threading
import time
from config import STREAM_FOLDER
from models import get_db_connection

ACTIVE_PROCESSES = {}
ACTIVE_STREAM_URLS = {}
TEST_INPUT_FILE = "test_video.mp4"

def build_ffmpeg_cmd(rtsp_url: str, stream_slug: str) -> list:
    
    stream_output_dir = os.path.join(STREAM_FOLDER, stream_slug)
    os.makedirs(stream_output_dir, exist_ok=True)
    output_playlist = os.path.join(stream_output_dir, "output.m3u8")
    input_source = rtsp_url if rtsp_url != TEST_INPUT_FILE else TEST_INPUT_FILE
    cmd = ["ffmpeg", "-y"]
    if input_source == TEST_INPUT_FILE:
        cmd.extend(["-stream_loop", "-1"])
    cmd.extend(["-i", input_source])
    filters = []
    db_conn = None
    try:
        db_conn = get_db_connection()
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM overlays WHERE stream_slug = %s AND is_active = TRUE",
            (stream_slug,)
        )
        overlays = cursor.fetchall()
        for overlay in overlays:
            text = overlay['overlay_text'].replace("'", r"\'").replace(":", r"\:").replace("%", r"\%")
            x = overlay.get('position_x', 10)
            y = overlay.get('position_y', 10)
            filters.append(
                f"drawtext=text='{text}':fontcolor=yellow:fontsize=36:"
                f"x={x}:y={y}:box=1:boxcolor=black@0.7:boxborderw=5"
            )
    except Exception as e:
        print(f"[DB ERROR] Failed to fetch overlays: {e}")
    finally:
        if db_conn:
            db_conn.close()
    if not filters:
        text = f"LIVE: {stream_slug}".replace("'", r"\'").replace(":", r"\:").replace("%", r"\%")
        filters.append(f"drawtext=text='{text}':fontcolor=white:fontsize=24:x=10:y=10")
    if filters:
        cmd.extend(["-vf", ",".join(filters)])
    cmd.extend([
        "-c:v", "libx264", "-preset", "ultrafast", "-tune", "zerolatency",
        "-c:a", "aac", "-f", "hls", "-hls_time", "2",
        "-hls_list_size", "5", "-hls_flags", "delete_segments+omit_endlist",
        output_playlist
    ])
    return cmd

def start_stream(rtsp_url: str, stream_slug: str) -> bool:
    stop_stream(stream_slug)
    cmd_list = build_ffmpeg_cmd(rtsp_url, stream_slug)
    try:
        print(f"Executing Command: {subprocess.list2cmdline(cmd_list)}")
        process = subprocess.Popen(
            cmd_list,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            universal_newlines=True,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
        )
        ACTIVE_STREAM_URLS[stream_slug] = rtsp_url
        ACTIVE_PROCESSES[stream_slug] = process
        print(f"✅ FFmpeg started for '{stream_slug}' (PID {process.pid})")
        return True
    except Exception as e:
        print(f"❌ Error starting FFmpeg: {e}")
        return False

def stop_stream(stream_slug: str) -> bool:
    process = ACTIVE_PROCESSES.pop(stream_slug, None)
    ACTIVE_STREAM_URLS.pop(stream_slug, None)
    if not process:
        return False
    try:
        process.terminate()
        process.wait(timeout=3)
        print(f"🛑 Stream '{stream_slug}' stopped successfully.")
        return True
    except Exception:
        process.kill()
        return True

def restart_stream(stream_slug: str) -> bool:
    rtsp_url = ACTIVE_STREAM_URLS.get(stream_slug, TEST_INPUT_FILE)
    print(f"Restarting stream '{stream_slug}' with URL: {rtsp_url}")
    return start_stream(rtsp_url, stream_slug)