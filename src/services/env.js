// Helper to centralize backend/frontend host resolution
export const getRawBackend = () => {
  // Prefer explicitly set BACKEND_URL (if present), then REACT_APP_BACKEND_URL,
  // then REACT_APP_API_URL for backward compatibility, finally default.
  return (
    process.env.BACKEND_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000'
  );
};

export const getBackendApiRoot = () => {
  const raw = getRawBackend();
  return raw.replace(/\/$/, '') + '/api';
};

export const getFrontendHost = () => {
  return (
    process.env.FRONTEND_URL ||
    process.env.REACT_APP_FRONTEND_URL ||
    'http://localhost:3000'
  );
};

const Env = {
  getRawBackend,
  getBackendApiRoot,
  getFrontendHost
};

export default Env;
