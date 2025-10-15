// src/components/OverlayEditor/OverlayEditor.jsx

import React, { useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:5000";

function OverlayEditor({ streamSlug, onUpdate }) {
    const [text, setText] = useState('');
    const [posX, setPosX] = useState(10);
    const [posY, setPosY] = useState(10);
    const [editingId, setEditingId] = useState(null);
    const [activeOverlays, setActiveOverlays] = useState([]);

    // 2. Wrap fetchOverlays in useCallback
    const fetchOverlays = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/overlays/${streamSlug}`);
            setActiveOverlays(response.data);
            onUpdate(response.data);
        } catch (error) {
            console.error("Failed to fetch overlays:", error);
        }
    }, [streamSlug, onUpdate]); // Dependencies for useCallback

    // Fetch overlays when the component mounts or when fetchOverlays changes
    useEffect(() => {
        fetchOverlays();
    }, [fetchOverlays]); // 3. Add fetchOverlays to the dependency array

    const handleEditClick = (overlay) => {
        setEditingId(overlay.id);
        setText(overlay.overlay_text);
        setPosX(overlay.position_x);
        setPosY(overlay.position_y);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setText('');
        setPosX(10);
        setPosY(10);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            stream_slug: streamSlug,
            overlay_text: text,
            position_x: posX,
            position_y: posY,
        };

        try {
            if (editingId) {
                await axios.put(`${API_BASE_URL}/api/overlays/${editingId}`, payload);
            } else {
                await axios.post(`${API_BASE_URL}/api/overlays/`, payload);
            }
            handleCancelEdit();
            fetchOverlays();
        } catch (error) {
            console.error("Failed to save overlay:", error);
            alert("Error saving overlay. Check console for details.");
        }
    };

    const handleDelete = async (overlayId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/overlays/${overlayId}`, {
                data: { stream_slug: streamSlug }
            });
            fetchOverlays();
        } catch (error) {
            console.error("Failed to delete overlay:", error);
        }
    };

    // The rest of your JSX return statement remains exactly the same...
    return (
        <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Update Overlay' : 'Create Overlay'}</h3>
            <form onSubmit={handleSubmit}>
                {/* ... all your input fields ... */}
                <input
                    type="text"
                    placeholder="Enter overlay text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                    style={{ width: 'calc(100% - 22px)', padding: '10px', marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="number"
                        placeholder="X Position"
                        value={posX}
                        onChange={(e) => setPosX(e.target.value)}
                        required
                        style={{ width: '50%', padding: '10px' }}
                    />
                    <input
                        type="number"
                        placeholder="Y Position"
                        value={posY}
                        onChange={(e) => setPosY(e.target.value)}
                        required
                        style={{ width: '50%', padding: '10px' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', background: editingId ? '#007BFF' : '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
                    {editingId ? 'Update Overlay' : 'Add & Apply Overlay'}
                </button>
                {editingId && (
                    <button type="button" onClick={handleCancelEdit} style={{ width: '100%', padding: '10px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', marginTop: '5px' }}>
                        Cancel Edit
                    </button>
                )}
            </form>

            <h3 style={{ marginTop: '30px' }}>Active Overlays ({activeOverlays.length})</h3>
            <div>
                {activeOverlays.map(overlay => (
                    <div key={overlay.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd', marginBottom: '5px' }}>
                        <span>"{overlay.overlay_text}" at ({overlay.position_x}, {overlay.position_y})</span>
                        <div>
                            <button onClick={() => handleEditClick(overlay)} style={{ marginRight: '5px', background: '#ffc107', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDelete(overlay.id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OverlayEditor;