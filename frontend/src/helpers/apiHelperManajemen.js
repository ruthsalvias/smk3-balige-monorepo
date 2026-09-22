import GATEWAY from "../config/gateway";

// Semua request manajemen data lewat API Gateway (Nginx) pada prefix /api/management.
export const GATEWAY_URL = GATEWAY;
export const BASE_URL = `${GATEWAY_URL}/api/management`;

export function getAccessToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

const apiHelper = {
  fetchData: async (url, options = {}) => {
    const token = getAccessToken();

    return fetch(url, {
      ...options,
      mode: "cors",
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },
};

export default apiHelper;
