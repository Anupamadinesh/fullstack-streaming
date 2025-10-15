import mysql.connector
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB

def get_db_connection():
    """Returns an active MySQL database connection."""
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB   # ✅ use the variable imported from config.py
    )

def init_db():
    """Initializes the database connection and creates tables."""
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        # streams table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS streams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                rtsp_url VARCHAR(1024) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        """)

        # overlays table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS overlays (
                id INT AUTO_INCREMENT PRIMARY KEY,
                stream_slug VARCHAR(100) NOT NULL,
                overlay_text VARCHAR(255),
                position_x INT DEFAULT 50,
                position_y INT DEFAULT 50,
                image_path VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        """)
        db.commit()
        cursor.close()
        db.close()
        print("✅ Database initialized successfully.")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")

if __name__ == '__main__':
    init_db()
