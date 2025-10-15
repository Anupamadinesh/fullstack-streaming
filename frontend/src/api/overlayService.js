import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api/overlays/';
const STREAM_START_URL = 'http://127.0.0.1:5000/api/stream/start';

const DUMMY_RTSP_URL = "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_1156k.mp4";

export const fetchOverlays = async (streamSlug) => {
    const response = await axios.get(API_BASE_URL, { params: { stream_slug: streamSlug } });
    return response.data;
};

export const createOverlay = async (data) => {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
};

// Update is omitted for simplicity of the MVP, focus on Create/Delete
// export const updateOverlay = async (id, data) => { ... }

export const deleteOverlay = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
};

export const reconfigureStream = async (streamSlug) => {
    try {
        const response = await axios.post(STREAM_START_URL, { 
            stream_url: DUMMY_RTSP_URL,
            slug: streamSlug
        });
        return response.data;
    } catch (error) {
        console.error("Error reconfiguring stream:", error);
        throw error;
    }
};