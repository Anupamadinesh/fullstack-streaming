# Full Stack Live Stream Application

This project is a full-stack web application that transcodes a given RTSP stream into an HLS format for live playback in a web browser. It features a Flask backend for stream processing with FFmpeg and a React frontend for user interaction and overlay management.

This project was completed as a technical assignment.

## Features

* **Real-time Transcoding**: Ingests any RTSP stream and transcodes it to HLS format on the fly.
* **Dynamic Overlays**: Full CRUD (Create, Read, Update, Delete) functionality for adding text overlays to the video stream.
* **Web-based Interface**: A React UI to start/stop streams, input custom RTSP URLs, and manage overlays without restarting the server.
* **Live Updates**: Changes to overlays are applied to the live stream in real-time by automatically restarting the FFmpeg process with the updated settings.

## Tech Stack

* **Backend**: Python, Flask, FFmpeg
* **Frontend**: React, JavaScript, Axios, Hls.js
* **Database**: MySQL

---

## Setup and Installation

### Prerequisites

* Python 3.8+
* Node.js and npm
* FFmpeg installed and accessible in your system's PATH.
* A running MySQL server.

### Backend Setup

1.  **Navigate to the `backend` folder**: `cd backend`
2.  **Create and activate a virtual environment**:
    ```bash
    # On Windows
    python -m venv venv
    venv\Scripts\activate

    # On macOS/Linux
    source venv/bin/activate
    ```
3.  **Install dependencies**: `pip install -r requirements.txt`
4.  **Configure Database**:
    * Create a MySQL database.
    * Update the database credentials in `config.py`.
5.  **Run the application**: `python app.py`
    * The server will start on `http://127.0.0.1:5000`.

### Frontend Setup

1.  **Navigate to the `frontend` folder**: `cd frontend`
2.  **Install dependencies**: `npm install`
3.  **Run the application**: `npm start`
    * The React app will open on `http://localhost:3000`.

---

## API Documentation

The backend provides the following endpoints:

### Stream Control

* **Start Stream**: `POST /api/stream/start`
    * Body: `{ "slug": "stream-name", "rtsp_url": "your-rtsp-url" }`
* **Stop Stream**: `POST /api/stream/stop/<slug>`

### Overlay Management (CRUD)

* **Create Overlay**: `POST /api/overlays/`
    * Body: `{ "stream_slug": "stream-name", "overlay_text": "text", "position_x": 10, "position_y": 10 }`
* **Get Overlays**: `GET /api/overlays/<slug>`
* **Update Overlay**: `PUT /api/overlays/<id>`
    * Body: `{ "stream_slug": "stream-name", "overlay_text": "new text", ... }`
* **Delete Overlay**: `DELETE /api/overlays/<id>`
    * Body: `{ "stream_slug": "stream-name" }`