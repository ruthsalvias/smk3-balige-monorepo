/**
 * Kumpulan ikon SVG profesional (stroke-based, mengikuti currentColor).
 * Dipakai untuk menggantikan emoji di seluruh aplikasi.
 */

const paths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  news: (
    <>
      <path d="M4 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z" />
      <path d="M16 9h3a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2" />
      <path d="M6.5 8.5h6M6.5 12h6M6.5 15.5h4" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l8 4V6l-8 4H4a1 1 0 0 0-1 1Z" />
      <path d="M17.5 9a3.5 3.5 0 0 1 0 6" />
      <path d="M6 14v4a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4Z" />
      <path d="M6 4a2 2 0 0 0-2 2v2h2" />
      <path d="M10 9h6M10 13h6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  sitemap: (
    <>
      <rect x="9" y="3" width="6" height="4.5" rx="1" />
      <rect x="2.5" y="16.5" width="6" height="4.5" rx="1" />
      <rect x="15.5" y="16.5" width="6" height="4.5" rx="1" />
      <path d="M12 7.5v3.5M5.5 16.5V13h13v3.5M12 11h0" />
    </>
  ),
  graduation: (
    <>
      <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z" />
      <path d="M6.5 10.8V15c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-4.2" />
      <path d="M21.5 8.5v5" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V6a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15" />
      <path d="M14 21V10h4a1 1 0 0 1 1 1v10" />
      <path d="M8 9h3M8 13h3M8 17h3" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5.5H5.5a.5.5 0 0 0-.5.5c0 2 1.2 3.5 3 3.9M16 5.5h2.5a.5.5 0 0 1 .5.5c0 2-1.2 3.5-3 3.9" />
      <path d="M12 13v4M9 20h6M10 17h4l.5 3h-5l.5-3Z" />
    </>
  ),
  handshake: (
    <>
      <path d="m11 7 2-1.2a2 2 0 0 1 2 0L21 9v6l-2 1" />
      <path d="M3 9l4-2.2a2 2 0 0 1 2 0L13 9l-2.4 2a1.5 1.5 0 0 1-2 0L7 9.6" />
      <path d="M3 9v6l3 1.6 3.5 2.6a1.5 1.5 0 0 0 2-.2l4.5-4.4" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4.5M12 17.3h.01" />
    </>
  ),
  students: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0" />
      <circle cx="17.5" cy="9.5" r="2.4" />
      <path d="M17 14.2a5 5 0 0 1 4.2 5.3" />
    </>
  ),
  teacher: (
    <>
      <circle cx="12" cy="7" r="3.2" />
      <path d="M5.5 20.5a6.5 6.5 0 0 1 13 0" />
      <path d="M18.5 4.5h3v4h-3z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0" />
      <path d="M16.5 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.2a5 5 0 0 1 3.7 5.3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 15.5V11M12 15.5V7M17 15.5v-3" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  phone: (
    <>
      <path d="M6.2 3.5h2.9l1.5 3.7-2 1.4a12 12 0 0 0 5.8 5.8l1.4-2 3.7 1.5v2.9a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3.5 7 7.4 5.3a2 2 0 0 0 2.2 0L20.5 7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </>
  ),
  externalLink: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4.5" />
    </>
  ),
  power: (
    <>
      <path d="M12 3v9" />
      <path d="M7.2 6.6a8 8 0 1 0 9.6 0" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6 6 18" />
    </>
  ),
  chevronRight: (
    <>
      <path d="m9 5 7 7-7 7" />
    </>
  ),
  chevronLeft: (
    <>
      <path d="m15 5-7 7 7 7" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4.5L19 9.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20Z" />
      <path d="m14.5 7.5 2 2" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7" />
      <path d="M6.5 7 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L17.5 7" />
      <path d="M10.5 11v6M13.5 11v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 17 4.8-4.4a1.6 1.6 0 0 1 2.2 0L16 17M14 15l1.7-1.6a1.6 1.6 0 0 1 2.2 0L20 15.5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4.5M7.5 9 12 4.5 16.5 9" />
      <path d="M4 15v3.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V15" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11.5M7.5 11 12 15.5 16.5 11" />
      <path d="M4 15v3.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V15" />
    </>
  ),
  facebook: (
    <>
      <path d="M14.5 8.5h2.2V5.4h-2.4c-2.3 0-3.7 1.5-3.7 3.8v1.6H8.4v3.1h2.2V21h3.3v-7.1h2.3l.4-3.1h-2.7V9.6c0-.7.3-1.1.6-1.1Z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.5 9.5 5 2.5-5 2.5v-5Z" />
    </>
  ),
  twitter: (
    <>
      <path d="m4 4 7 9.2L4.4 20M19.5 4h-2.9l-11.1 16h2.9" />
      <path d="M13 10.8 20 20h-3.5" />
    </>
  ),
  tiktok: (
    <>
      <path d="M14 4v10.2a3.6 3.6 0 1 1-3.6-3.6" />
      <path d="M14 4c.4 2.6 2 4 4.6 4.2" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5V16M8 7.7v.01M12 16v-3.2a1.9 1.9 0 0 1 3.8 0V16" />
      <path d="M12 10.5V16" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5 4.8 16A8 8 0 1 1 8 19.2l-4.5 1.3Z" />
      <path d="M9 9.2c.2 1.6 1.5 4.2 4.3 5.4.7.3 1.2-.1 1.4-.6l.3-.8-2-1-.7.8c-1-.5-1.7-1.2-2.1-2.2l.8-.6-.8-2-1 .3c-.5.2-.4 1-.2 1.7Z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15a2 2 0 0 1 2-2h3.5a1.5 1.5 0 0 0 1.5-1.5Z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5" />
      <path d="M3 12.5h18" />
    </>
  ),
  star: (
    <>
      <path d="m12 4 2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.8 9.6 9 12 4Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19.5 6v6c0 4.3-3 7.3-7.5 8.5C7.5 19.3 4.5 16.3 4.5 12V6L12 3.5Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  pin: (
    <>
      <path d="M9.5 3.5h5l-.7 5 3.2 3.2H7l3.2-3.2-.7-5Z" />
      <path d="M12 11.7V20.5" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6.5l-2-2H5a2 2 0 0 0-2 2Z" />
    </>
  ),
  folderPlus: (
    <>
      <path d="M12 10v6M9 13h6" />
      <path d="M3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6.5l-2-2H5a2 2 0 0 0-2 2Z" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </>
  ),
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </>
  ),
  moreVertical: (
    <>
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>
  ),
  laptop: (
    <>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z" />
      <path d="M2 18h20a1 1 0 0 1 1 1v1H1v-1a1 1 0 0 1 1-1Z" />
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  cpu: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </>
  ),
  wrench: (
    <>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
    </>
  ),
  tool: (
    <>
      <path d="m15 5 4 4-11 11H4v-4L15 5z" />
      <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
    </>
  ),
  zap: (
    <>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </>
  ),
  car: (
    <>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H6c-.8 0-1.5.4-1.9 1.1L2.6 11.1C2.2 11.7 2 12.3 2 13v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M5 17h10" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  palette: (
    <>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.8-.1 2.6-.4.5-.2.8-.7.8-1.2 0-.8-.7-1.4-1.5-1.4h-1c-.6 0-1-.4-1-1 0-.3.1-.5.3-.7l2.1-2.1c.4-.4.6-.9.6-1.5 0-1.7-1.3-3-3-3s-3 1.3-3 3c0 .6-.4 1-1 1s-1-.4-1-1a7 7 0 0 1 7-7h2.1c3.8 0 6.9 3.1 6.9 6.9 0 3.3-2.3 6.1-5.5 6.8" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </>
  ),
  utensils: (
    <>
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 11v11" />
      <path d="M5 2v4a3 3 0 0 0 3 3v13" />
      <path d="M5 2c0 2 1 3 3 3" />
    </>
  ),
  coffee: (
    <>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </>
  ),
};

export const iconNames = Object.keys(paths);

export default function Icon({ name, size = 20, className = "", strokeWidth = 1.7, ...rest }) {
  const shape = paths[name] || paths.star;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`app-icon ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {shape}
    </svg>
  );
}
