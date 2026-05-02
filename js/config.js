// SS WebTech Deployment Configuration
// This file bridges your Cloudflare Frontend with your Vercel Backend

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://intenship-certificate-backend.vercel.app'; // REPLACE THIS with your actual Vercel URL after deployment

window.API_URL = API_BASE_URL;

console.log(`🚀 SS WebTech API Bridge: Connected to ${window.API_URL}`);
