import GATEWAY from "../config/gateway";

// Semua request lewat API Gateway (Nginx); resource profil berada di prefix /api/profile.
export const GATEWAY_URL = GATEWAY;
export const BASE_URL = `${GATEWAY_URL}/api/profile`;

const apiHelper = (() => {
  async function fetchData(url, options = {}) {
    const urlQuery = url.includes("?") ? url.split("?")[1] : "";
    const urlWithoutQuery = url.replace(`?${urlQuery}`, "");
    const fixUrl = urlWithoutQuery.endsWith("/")
      ? urlWithoutQuery.slice(0, -1)
      : urlWithoutQuery;
    const fullUrl = fixUrl + (urlQuery ? `?${urlQuery}` : "");

    const token = getAccessToken();

    return fetch(fullUrl, {
      ...options,
      mode: "cors",
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  function putAccessToken(token) {
    localStorage.setItem("accessToken", token);
  }

  function getAccessToken() {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  }

  return { fetchData, putAccessToken, getAccessToken };
})();

export default apiHelper;
