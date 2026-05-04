// English Comment: Centralized configuration file to manage API URLs and constants
// This ensures we don't hardcode URLs in components and can easily switch between Dev/Prod environments.

// FIX 1: Default port changed to 8000 to match your main.py
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  // English Comment: Endpoint to chat with the AI
  CHAT: `${API_BASE_URL}/chat`,
  // English Comment: Endpoint to fetch list of videos
  GET_VIDEOS: `${API_BASE_URL}/videos`,
  // English Comment: Endpoint to upload/ingest new video
  INGEST_VIDEO: `${API_BASE_URL}/ingest-video`,
};

// FIX 2: Added DOCS_URL because Documentation.jsx needs it
// English Comment: Dynamic link for Swagger Documentation based on the API URL
export const DOCS_URL = API_BASE_URL.replace('/api/v1', '/docs'); 

export { BACKEND_URL };
export default API_BASE_URL;