import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;  // ← add this line
window.axios.defaults.baseURL = 'https://backend-production-1d96.up.railway.app';  // ← add this too