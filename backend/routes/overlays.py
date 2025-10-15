# routes/overlays.py

from flask import Blueprint, jsonify, request
from models import get_db_connection
from ffmpeg_manager import restart_stream

overlays_bp = Blueprint('overlays_bp', __name__)

# --- READ Route (no changes needed) ---
@overlays_bp.route('/<string:stream_slug>', methods=['GET'])
def get_overlays(stream_slug):
    # ... (code is correct, no changes)
    db_conn = get_db_connection()
    cursor = db_conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM overlays WHERE stream_slug = %s", (stream_slug,))
    overlays = cursor.fetchall()
    cursor.close()
    db_conn.close()
    return jsonify(overlays)


# --- CREATE Route ---
@overlays_bp.route('/', methods=['POST'])
def add_overlay():
    data = request.json
    slug = data.get('stream_slug')
    # ... (database insertion logic is correct)
    db_conn = get_db_connection()
    cursor = db_conn.cursor()
    cursor.execute(
        "INSERT INTO overlays (stream_slug, overlay_text, position_x, position_y, is_active) VALUES (%s, %s, %s, %s, TRUE)",
        (slug, data.get('overlay_text'), data.get('position_x'), data.get('position_y'))
    )
    db_conn.commit()
    new_id = cursor.lastrowid
    db_conn.close()

    #  Simplified restart call
    restart_stream(slug)
    return jsonify({"message": "Overlay added successfully", "id": new_id}), 201

#  Route ---
@overlays_bp.route('/<int:overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    data = request.json
    slug = data.get('stream_slug')
    # ... (database update logic is correct)
    db_conn = get_db_connection()
    cursor = db_conn.cursor()
    cursor.execute(
        "UPDATE overlays SET overlay_text = %s, position_x = %s, position_y = %s WHERE id = %s",
        (data.get('overlay_text'), data.get('position_x'), data.get('position_y'), overlay_id)
    )
    db_conn.commit()
    db_conn.close()

    #restart call
    if slug:
        restart_stream(slug)
    return jsonify({"message": f"Overlay {overlay_id} updated successfully"})

# --- DELETE Route ---
@overlays_bp.route('/<int:overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    data = request.json
    slug = data.get('stream_slug')
    # ... (database deletion logic is correct)
    db_conn = get_db_connection()
    cursor = db_conn.cursor()
    cursor.execute("DELETE FROM overlays WHERE id = %s", (overlay_id,))
    db_conn.commit()
    db_conn.close()

    if slug:
        restart_stream(slug)
    return jsonify({"message": f"Overlay {overlay_id} deleted successfully"})