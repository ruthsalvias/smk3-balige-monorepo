// Alamat API Gateway (Nginx). Saat aplikasi dilayani oleh Nginx (port 8080 atau
// lewat tunnel HTTPS), API diproksikan pada origin yang sama.
// Hanya dev server Vite (5173) yang perlu menunjuk langsung ke port gateway.
const PORT_GATEWAY = "6766";
const PORT_DEV = "5173";

function tentukanGateway() {
  const dariEnv = import.meta.env?.VITE_GATEWAY_URL;
  if (dariEnv) return dariEnv.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.hostname) {
    const { protocol, hostname, port, origin } = window.location;
    if (port === PORT_DEV) return `${protocol}//${hostname}:${PORT_GATEWAY}`;
    return origin;
  }
  return `http://localhost:${PORT_GATEWAY}`;
}

export const GATEWAY_URL = tentukanGateway();

export default GATEWAY_URL;
