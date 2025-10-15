import os

MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = '1231'  
MYSQL_DB = 'livestreamdb'
RTMP_SERVER_URL = 'rtmp://localhost/live'
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STREAM_FOLDER = os.path.join(BASE_DIR, 'static', 'stream')
os.makedirs(STREAM_FOLDER, exist_ok=True)