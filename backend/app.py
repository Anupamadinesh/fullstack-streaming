from flask import Flask, send_from_directory
from flask_cors import CORS
from models import init_db
from routes.stream import stream_bp
from routes.overlays import overlays_bp
from config import STREAM_FOLDER

app = Flask(__name__)
CORS(app)

# Initialize DB (safe to call each startup; tables use IF NOT EXISTS)
init_db()

# Register blueprints
app.register_blueprint(stream_bp, url_prefix='/api/stream')
app.register_blueprint(overlays_bp, url_prefix='/api/overlays')

# Serve HLS files from stream folder
@app.route('/static/stream/<path:filename>')
def serve_stream_files(filename):
    response = send_from_directory(STREAM_FOLDER, filename)
    # Add headers to allow cross-origin requests
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/')
def index():
    return "LiveStream Backend Running. Use /api/stream/start to begin."

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
