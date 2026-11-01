import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProfilLayout from "../../../profil/layouts/ProfilLayout";
import { useSiteSettings } from "../../../profil/context/SiteSettingsContext";
import Icon from "../../../../components/Icon";
import "./BeritaPage.css";
import {
  asyncGetBerita,
  asyncGetAgenda,
  asyncGetPengumuman,
} from "../../states/action";
import { asyncGetPrestasi } from "../../../profil/states/action";
import GATEWAY_URL from "../../../../config/gateway";

// ── BASE URL ──────────────────────────────────────────────────────────────────
const BASE_URL = GATEWAY_URL;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTgl(str) {
  if (!str) return "";
  try {
    return new Date(str).toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return str; }
}

function formatAgenda(str) {
  if (!str) return { tgl: "--", bln: "---" };
  const d = new Date(str);
  return {
    tgl: String(d.getDate()).padStart(2, "0"),
    bln: d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase(),
  };
}

/**
 * Menghasilkan daftar kandidat URL gambar yang akan dicoba satu per satu.
 * Urutan: dari yang paling mungkin benar → fallback lainnya.
 */
function buildImgCandidates(item) {
  if (!item) return [];

  // Kumpulkan semua field yang mungkin berisi path gambar
  const raw = item.imageUrl || item.gambar || item.image || item.foto || item.photo || null;
  if (!raw) return [];

  // Sudah URL lengkap → langsung pakai, tidak perlu kandidat lain
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return [raw];
  }

  const clean = raw.startsWith("/") ? raw : `/${raw}`;
  // Ekstrak hanya nama file (bagian paling akhir)
  const filename = clean.split("/").filter(Boolean).pop() || "";

  // Kembalikan semua kemungkinan path yang lazim dipakai Express/backend Node
  return [
    `${BASE_URL}${clean}`,                          // path apa adanya
    `${BASE_URL}/uploads/${filename}`,              // /uploads/namafile
    `${BASE_URL}/api/berita/uploads/${filename}`,   // /api/berita/uploads/namafile
    `${BASE_URL}/api/uploads/${filename}`,          // /api/uploads/namafile
    `${BASE_URL}/berita/${filename}`,               // /berita/namafile
    `${BASE_URL}/public/${filename}`,               // /public/namafile
    `${BASE_URL}/images/${filename}`,               // /images/namafile
  ].filter((u, i, arr) => arr.indexOf(u) === i);   // hapus duplikat
}

// ── Intersection Observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.15, once = true) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); if (once) observer.unobserve(el); }
        else if (!once) setIsVisible(false);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);
  return [ref, isVisible];
}

function Animate({ children, animation = "fade-up", delay = 0, threshold = 0.15, style = {}, className = "" }) {
  const [ref, isVisible] = useInView(threshold);
  const hiddenStyles = {
    "fade-up":    { opacity: 0, transform: "translateY(40px)" },
    "fade-left":  { opacity: 0, transform: "translateX(-40px)" },
    "fade-right": { opacity: 0, transform: "translateX(40px)" },
    "fade-in":    { opacity: 0, transform: "none" },
    "zoom-in":    { opacity: 0, transform: "scale(0.92)" },
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        willChange: "opacity, transform",
        ...(isVisible ? { opacity: 1, transform: "translateY(0) translateX(0) scale(1)" } : hiddenStyles[animation] ?? hiddenStyles["fade-up"]),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const TINGKAT_COLOR = {
  internasional: "#f59e0b",
  nasional:      "#3b82f6",
  provinsi:      "#10b981",
  kabupaten:     "#8b5cf6",
};

// ── Komponen Gambar dengan Multi-Candidate Fallback ──────────────────────────
/**
 * Mencoba load gambar dari daftar kandidat URL satu per satu.
 * Jika semua gagal → tampilkan placeholder.
 */
function BeritaImage({ item, alt, className, style }) {
  const candidates = buildImgCandidates(item);
  const [idx, setIdx]       = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  // Reset setiap kali item berubah
  useEffect(() => {
    setIdx(0);
    setAllFailed(false);
  }, [item]);

  const currentSrc = candidates[idx] ?? null;

  // Log kandidat yang dicoba (bantu debug — bisa dihapus setelah gambar tampil)
  useEffect(() => {
    if (currentSrc) {
      console.log(`[BeritaImage] Mencoba kandidat [${idx + 1}/${candidates.length}]:`, currentSrc);
    }
  }, [currentSrc]);

  const handleError = () => {
    console.warn(`[BeritaImage] Gagal [${idx + 1}/${candidates.length}]:`, currentSrc);
    if (idx + 1 < candidates.length) {
      setIdx(idx + 1); // coba kandidat berikutnya
    } else {
      console.error("[BeritaImage] Semua kandidat gagal. Data item:", item);
      setAllFailed(true);
    }
  };

  if (!currentSrc || allFailed) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: "linear-gradient(135deg, #e0e7ef 0%, #c7d2e6 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 13,
          gap: 6,
          minHeight: 160,
        }}
      >
        <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span>Gambar tidak tersedia</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
    />
  );
}

// ── Modal Detail ──────────────────────────────────────────────────────────────
function DetailModal({ selected, onClose }) {
  if (!selected) return null;
  const { type, data } = selected;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16,
          maxWidth: 680, width: "100%", maxHeight: "88vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#0f1f4b", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name={type === "berita" ? "news" : type === "pengumuman" ? "megaphone" : type === "agenda" ? "calendar" : "trophy"} size={17} />
            {type === "berita"     ? "Detail Berita"      :
             type === "pengumuman" ? "Detail Pengumuman"  :
             type === "agenda"     ? "Detail Agenda"      :
                                    "Detail Prestasi"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", lineHeight: 1, display: "flex" }}>
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>

          {/* ── Berita ── */}
          {type === "berita" && (
            <>
              <BeritaImage
                item={data}
                alt={data.title}
                style={{ width: "100%", borderRadius: 10, marginBottom: 20, maxHeight: 320, objectFit: "cover", display: "block" }}
              />
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="calendar" size={13} /> {formatTgl(data.createdAt || data.created_at)}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f1f4b", marginBottom: 12, lineHeight: 1.4 }}>
                {data.title}
              </h2>
              {(data.excerpt || data.description) && (
                <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16, fontStyle: "italic", borderLeft: "3px solid #e5e7eb", paddingLeft: 12 }}>
                  {data.excerpt || data.description}
                </p>
              )}
              <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {data.content || data.body || data.excerpt || data.description}
              </p>
            </>
          )}

          {/* ── Pengumuman ── */}
          {type === "pengumuman" && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f1f4b", marginBottom: 16 }}>
                {data.title}
              </h2>
              <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {data.content || data.description}
              </p>
            </>
          )}

          {/* ── Agenda ── */}
          {type === "agenda" && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f1f4b", marginBottom: 16 }}>
                {data.title}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 15, color: "#374151", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="calendar" size={15} /> <strong>Tanggal:</strong> {formatTgl(data.date)}
                </div>
                {data.location && (
                  <div style={{ fontSize: 15, color: "#374151", display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="mapPin" size={15} /> <strong>Lokasi:</strong> {data.location}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Prestasi ── */}
          {type === "prestasi" && (
            <>
              <div style={{ marginBottom: 12, color: "#c8a24a" }}><Icon name="trophy" size={40} /></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f1f4b", marginBottom: 12 }}>
                {data.judul}
              </h2>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <span style={{ padding: "4px 14px", background: "#fef3c7", color: "#b45309", borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: "capitalize", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon name="globe" size={13} /> {data.tingkat}
                </span>
                <span style={{ padding: "4px 14px", background: "#e0f2fe", color: "#0369a1", borderRadius: 20, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon name="calendar" size={13} /> {data.tahun}
                </span>
              </div>
              {data.keterangan && (
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8 }}>
                  {data.keterangan}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BeritaPage() {
  const dispatch       = useDispatch();
  const { pengaturan } = useSiteSettings();
  const beritaList     = useSelector((s) => s.berita      || []);
  const agendaList     = useSelector((s) => s.agenda      || []);
  const pengumumanList = useSelector((s) => s.pengumuman  || []);
  const prestasiList   = useSelector((s) => s.prestasi    || []);

  const [activeFilter, setActiveFilter] = useState("Semua");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState(null);

  useEffect(() => {
    dispatch(asyncGetBerita());
    dispatch(asyncGetAgenda());
    dispatch(asyncGetPengumuman());
    dispatch(asyncGetPrestasi());
  }, [dispatch]);

  const filters = ["Semua", "Berita", "Pengumuman", "Prestasi"];

  const q = search.toLowerCase();

  const beritaUtama   = beritaList[0] ?? null;
  const beritaTerbaru = beritaList.slice(1).filter((b) => {
    const matchSearch = (b.title || "").toLowerCase().includes(q) ||
                        (b.excerpt || b.description || "").toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (activeFilter === "Semua" || activeFilter === "Berita") return true;
    return false;
  });

  const filteredPengumuman = pengumumanList.filter((p) =>
    (p.title || "").toLowerCase().includes(q) ||
    (p.content || "").toLowerCase().includes(q)
  );

  const filteredPrestasi = prestasiList.filter((p) =>
    (p.judul || "").toLowerCase().includes(q) ||
    (p.keterangan || "").toLowerCase().includes(q)
  );

  const showBerita     = activeFilter === "Semua" || activeFilter === "Berita";
  const showPengumuman = activeFilter === "Semua" || activeFilter === "Pengumuman";
  const showPrestasi   = activeFilter === "Semua" || activeFilter === "Prestasi";

  return (
    <ProfilLayout>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bp-hero">
        <div className="bp-hero-content">
          <Animate animation="fade-up" delay={0} threshold={0.05}>
            <span className="bp-badge-tahun">Tahun Ajaran {pengaturan?.tahun_ajaran || "—"}</span>
          </Animate>
          <Animate animation="fade-up" delay={100} threshold={0.05}>
            <h1 className="bp-hero-title">BERITA &amp; INFORMASI<br />SEKOLAH</h1>
          </Animate>
          <Animate animation="fade-up" delay={180} threshold={0.05}>
            <p className="bp-hero-desc">
              Temukan informasi terkini seputar kegiatan, prestasi,<br />
              dan pengumuman resmi dari SMK Negeri 3 Balige.
            </p>
          </Animate>
          <Animate animation="fade-up" delay={260} threshold={0.05}>
            <div className="bp-search-row">
              <div className="bp-search-wrap">
                <span className="bp-search-icon">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  className="bp-search-input"
                  placeholder="Cari berita atau pengumuman..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {filters.map((f) => (
                <button
                  key={f}
                  className={`bp-filter-btn${activeFilter === f ? " bp-filter-active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </Animate>
        </div>
      </section>

      {/* ── BERITA UTAMA + AGENDA ─────────────────────────────────────────── */}
      {showBerita && beritaUtama && (
        <section className="bp-section bp-main-section">
          <div className="bp-container bp-main-grid">
            <div className="bp-main-left">
              <Animate animation="fade-up" delay={0}>
                <h2 className="bp-section-title"><span className="bp-title-bar" />Berita Utama</h2>
              </Animate>
              <Animate animation="fade-left" delay={120}>
                <div className="bp-utama-card">
                  {/* Ganti <img> biasa dengan <BeritaImage> */}
                  <div className="bp-utama-img-wrap">
                    <BeritaImage
                      item={beritaUtama}
                      alt="berita utama"
                      className="bp-utama-img"
                    />
                  </div>
                  <div className="bp-utama-body">
                    <span className="bp-utama-date"><Icon name="calendar" size={13} /> {formatTgl(beritaUtama.createdAt)}</span>
                    <h3 className="bp-utama-judul">{beritaUtama.title}</h3>
                    <p className="bp-utama-ring">{beritaUtama.excerpt || beritaUtama.description || ""}</p>
                    <button
                      className="bp-btn-baca"
                      onClick={() => setSelected({ type: "berita", data: beritaUtama })}
                    >
                      Baca Selengkapnya
                    </button>
                  </div>
                </div>
              </Animate>
            </div>

            <div className="bp-main-right">
              <Animate animation="fade-up" delay={0}>
                <h2 className="bp-section-title"><span className="bp-title-bar" />Agenda Sekolah</h2>
              </Animate>
              <div className="bp-agenda-list">
                {agendaList.length === 0 ? (
                  <div style={{ color: "#9ca3af", fontSize: 13 }}>Belum ada agenda.</div>
                ) : (
                  agendaList.slice(0, 4).map((a, i) => {
                    const { tgl, bln } = formatAgenda(a.date);
                    return (
                      <Animate key={a.id} animation="fade-right" delay={i * 90}>
                        <div
                          className="bp-agenda-item"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelected({ type: "agenda", data: a })}
                        >
                          <div className="bp-agenda-date">
                            <span className="bp-agenda-day">{tgl}</span>
                            <span className="bp-agenda-mon">{bln}</span>
                          </div>
                          <div className="bp-agenda-info">
                            <div className="bp-agenda-judul">{a.title}</div>
                            <div className="bp-agenda-lokasi">{a.location || ""}</div>
                          </div>
                        </div>
                      </Animate>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── BERITA TERBARU ───────────────────────────────────────────────── */}
      {showBerita && (
        <section className="bp-section bp-berita-section">
          <div className="bp-container">
            <Animate animation="fade-up" delay={0}>
              <h2 className="bp-section-title"><span className="bp-title-bar" />Berita Terbaru</h2>
            </Animate>
            <div className="bp-berita-grid">
              {beritaTerbaru.length === 0 ? (
                <Animate animation="fade-in" delay={0}>
                  <div className="bp-empty">Tidak ada berita yang ditemukan.</div>
                </Animate>
              ) : (
                beritaTerbaru.map((b, idx) => (
                  <Animate key={b.id} animation="fade-up" delay={idx * 110}>
                    <div
                      className="bp-berita-card"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected({ type: "berita", data: b })}
                    >
                      {/* Ganti <img> biasa dengan <BeritaImage> */}
                      <div className="bp-berita-img-wrap">
                        <BeritaImage
                          item={b}
                          alt={b.title}
                          className="bp-berita-img"
                        />
                      </div>
                      <div className="bp-berita-body">
                        <div className="bp-berita-meta">
                          <span className="bp-berita-date"><Icon name="calendar" size={12} /> {formatTgl(b.createdAt)}</span>
                        </div>
                        <h3 className="bp-berita-judul">{b.title}</h3>
                        <p className="bp-berita-ring">{b.excerpt || b.description || ""}</p>
                        <button
                          className="bp-btn-baca"
                          style={{ marginTop: 12, fontSize: 12 }}
                          onClick={(e) => { e.stopPropagation(); setSelected({ type: "berita", data: b }); }}
                        >
                          Baca Selengkapnya
                        </button>
                      </div>
                    </div>
                  </Animate>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── PENGUMUMAN ───────────────────────────────────────────────────── */}
      {showPengumuman && (
        <section className="bp-section bp-pengumuman-section">
          <div className="bp-container">
            <Animate animation="fade-up" delay={0}>
              <h2 className="bp-section-title"><span className="bp-title-bar" />Pengumuman</h2>
            </Animate>
            <div className="bp-peng-grid">
              {filteredPengumuman.length === 0 ? (
                <Animate animation="fade-in" delay={0}>
                  <div className="bp-empty">Belum ada pengumuman.</div>
                </Animate>
              ) : (
                filteredPengumuman.map((p, idx) => (
                  <Animate key={p.id} animation="fade-up" delay={idx * 100}>
                    <div className="bp-peng-card" style={{ cursor: "pointer" }}
                      onClick={() => setSelected({ type: "pengumuman", data: p })}>
                      <div className="bp-peng-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                        </svg>
                      </div>
                      <h3 className="bp-peng-judul">{p.title}</h3>
                      <p className="bp-peng-isi">{(p.content || p.description || "").slice(0, 100)}{(p.content || "").length > 100 ? "..." : ""}</p>
                      <button
                        className="bp-btn-lihat"
                        onClick={(e) => { e.stopPropagation(); setSelected({ type: "pengumuman", data: p }); }}
                      >
                        Lihat Selengkapnya
                      </button>
                    </div>
                  </Animate>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── PRESTASI ─────────────────────────────────────────────────────── */}
      {showPrestasi && (
        <section className="bp-section bp-berita-section">
          <div className="bp-container">
            <Animate animation="fade-up" delay={0}>
              <h2 className="bp-section-title"><span className="bp-title-bar" />Prestasi Sekolah</h2>
            </Animate>
            <div className="bp-berita-grid">
              {filteredPrestasi.length === 0 ? (
                <Animate animation="fade-in" delay={0}>
                  <div className="bp-empty">Belum ada data prestasi.</div>
                </Animate>
              ) : (
                filteredPrestasi.map((p, idx) => {
                  const color = TINGKAT_COLOR[p.tingkat?.toLowerCase()] || "#6b7280";
                  return (
                    <Animate key={p.id} animation="fade-up" delay={idx * 110}>
                      <div
                        className="bp-berita-card"
                        style={{ cursor: "pointer", borderTop: `4px solid ${color}` }}
                        onClick={() => setSelected({ type: "prestasi", data: p })}
                      >
                        <div className="bp-berita-body">
                          <div className="bp-berita-meta">
                            <span style={{ color, fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                              {p.tingkat}
                            </span>
                            <span className="bp-berita-date"><Icon name="calendar" size={12} /> {p.tahun}</span>
                          </div>
                          <div style={{ margin: "8px 0", color: "#c8a24a" }}><Icon name="trophy" size={24} /></div>
                          <h3 className="bp-berita-judul">{p.judul}</h3>
                          <p className="bp-berita-ring">{(p.keterangan || "").slice(0, 80)}{(p.keterangan || "").length > 80 ? "..." : ""}</p>
                          <button
                            className="bp-btn-baca"
                            style={{ marginTop: 12, fontSize: 12 }}
                            onClick={(e) => { e.stopPropagation(); setSelected({ type: "prestasi", data: p }); }}
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </Animate>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── MODAL DETAIL ─────────────────────────────────────────────────── */}
      <DetailModal selected={selected} onClose={() => setSelected(null)} />

    </ProfilLayout>
  );
}
