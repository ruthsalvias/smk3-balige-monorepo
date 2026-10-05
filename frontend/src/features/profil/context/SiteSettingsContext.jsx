import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getPengaturan, getStatistik } from "../api/pengaturanApi";

const DEFAULT_PENGATURAN = {
  nama_sekolah: "SMK NEGERI 3 BALIGE",
  nama_singkat: "SMKN 3 Balige",
  tagline: "Excellence in Education",
  deskripsi_singkat: "",
  tahun_ajaran: "",
  logo_url: null,
  alamat: "",
  telepon: "",
  email: "",
  jam_operasional: "",
  sosial_media: [],
  hero_images: [],
  login_bg_url: null,
};

const SiteSettingsContext = createContext({
  pengaturan: DEFAULT_PENGATURAN,
  statistik: [],
  loading: true,
  refresh: () => {},
});

/** Pecah teks multi-baris menjadi array baris yang sudah dibersihkan. */
export function toLines(value) {
  if (!value) return [];
  return String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function SiteSettingsProvider({ children }) {
  const [pengaturan, setPengaturan] = useState(DEFAULT_PENGATURAN);
  const [statistik, setStatistik] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        getPengaturan().catch(() => null),
        getStatistik().catch(() => []),
      ]);
      if (p) {
        setPengaturan({
          ...DEFAULT_PENGATURAN,
          ...p,
          sosial_media: Array.isArray(p.sosial_media) ? p.sosial_media : [],
          hero_images: Array.isArray(p.hero_images) ? p.hero_images : [],
          login_bg_url: p.login_bg_url || null,
        });
      }
      setStatistik(Array.isArray(s) ? s : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ pengaturan, statistik, loading, refresh }),
    [pengaturan, statistik, loading, refresh]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export { DEFAULT_PENGATURAN };
