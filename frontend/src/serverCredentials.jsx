// Basic authentication credentials
const flaskUsername = import.meta.env.VITE_FLASKUSERNAME;
const flaskPassword = import.meta.env.VITE_FLASKPASSWORD;
const basicAuth = "Basic " + btoa(flaskUsername + ":" + flaskPassword);
const API_URL = "http://31.24.10.138:8333/api/";
const WEBSOCKET_URL = "http://31.24.10.138:8333";
export { basicAuth, API_URL, WEBSOCKET_URL };
