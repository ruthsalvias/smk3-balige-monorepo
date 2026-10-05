import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import ProfilLayout from "../layouts/ProfilLayout";
import foto from "../../../assets/images/foto.png";
import { beritaMediaUrl, mediaUrl } from "../../admin/components/AdminComponents";
import { asyncGetPrestasi, asyncGetProgramKeahlian, asyncGetMitraKerjasama } from "../states/action";
import { asyncLoadAllBeritaData } from "../../berita/states/action";
import { useSiteSettings } from "../context/SiteSettingsContext";
import Icon from "../../../components/Icon";
import Reveal from "../../../components/Reveal";

const jurusanFallback = [
  { id: "f1", nama_jurusan: "Teknik Komputer & Jaringan", deskripsi: "Fokus pada infrastruktur jaringan dan keamanan siber.", icon: "briefcase" },
  { id: "f2", nama_jurusan: "Multimedia", deskripsi: "Pengembangan kreatif di bidang desain dan produksi media.", icon: "image" },
  { id: "f3", nama_jurusan: "Akuntansi", deskripsi: "Manajemen keuangan dan pelaporan akuntansi modern.", icon: "chart" },
];

const formatTanggal = (value) =>
  value
    ? new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

const kategoriColors = {
  Berita: "#1b4f9b",
  Pengumuman: "#b1740f",
};

const ringkas = (text, max = 150) => {
  const bersih = String(text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!bersih) return "Belum ada ringkasan untuk informasi ini.";
  return bersih.length > max ? `${bersih.slice(0, max)}...` : bersih;
};

/* ── Hero Carousel Hook ─────────────────────────────────── */
function useHeroSlider(images, interval = 5000) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const len = images.length;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (len > 1) {
      timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % len), interval);
    }
  }, [len, interval]);

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [resetTimer]);

  const next = useCallback(() => { setCurrent((p) => (p + 1) % len); resetTimer(); }, [len, resetTimer]);
  const prev = useCallback(() => { setCurrent((p) => (p - 1 + len) % len); resetTimer(); }, [len, resetTimer]);
  const goTo = useCallback((i) => { setCurrent(i); resetTimer(); }, [resetTimer]);

  return { current, next, prev, goTo };
}

export default function BerandaPage() {
  const dispatch = useDispatch();
  const { pengaturan, statistik } = useSiteSettings();
  const programKeahlian = useSelector((s) => s.programKeahlian);
  const berita = useSelector((s) => s.berita || []);
  const agenda = useSelector((s) => s.agenda || []);
  const pengumuman = useSelector((s) => s.pengumuman || []);

  // Build hero images array: use DB images if available, fallback to static
  const heroImages = useMemo(() => {
    const dbImages = (pengaturan.hero_images || []).map((p) => mediaUrl(p)).filter(Boolean);
    return dbImages.length > 0 ? dbImages : [foto];
  }, [pengaturan.hero_images]);

  const { current, next, prev, goTo } = useHeroSlider(heroImages);

  useEffect(() => {
    dispatch(asyncGetPrestasi());
    dispatch(asyncGetProgramKeahlian());
    dispatch(asyncGetMitraKerjasama());
    dispatch(asyncLoadAllBeritaData());
  }, [dispatch]);

  const jurusanPreview = programKeahlian.length ? programKeahlian.slice(0, 3) : jurusanFallback;

  const kabarTerbaru = useMemo(() => {
    const merged = [
      ...berita.map((b) => ({
        id: `b-${b.id}`,
        href: `/berita/berita/${b.id}`,
        tag: "Berita",
        title: b.title,
        date: b.createdAt,
        desc: b.description || b.excerpt || b.content || "",
        img: beritaMediaUrl(b.imageUrl),
        pinned: !!b.isPinned,
      })),
      ...pengumuman.map((p) => ({
        id: `p-${p.id}`,
        href: `/berita/pengumuman/${p.id}`,
        tag: "Pengumuman",
        title: p.title,
        date: p.createdAt,
        desc: p.description || p.content || "",
        img: beritaMediaUrl(p.imageUrl),
        pinned: !!p.isPinned,
      })),
    ];
    return merged
      .sort(
        (a, b) =>
          Number(!!b.pinned) - Number(!!a.pinned) ||
          new Date(b.date || 0) - new Date(a.date || 0)
      )
      .slice(0, 4);
  }, [berita, pengumuman]);

  const kabarUtama = kabarTerbaru[0] || null;
  const kabarLainnya = kabarTerbaru.slice(1);

  const agendaTerdekat = useMemo(
    () =>
      [...agenda]
        .filter((a) => a.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4),
    [agenda]
  );

  return (
    <ProfilLayout>
      {/* HERO */}
      <section className="smk-beranda-hero">
        {/* Blurred background layer */}
        <div
          className="smk-beranda-hero-bg"
          style={{ backgroundImage: `url(${heroImages[current]})` }}
        />
        <div className="smk-beranda-hero-inner">
          <div className="smk-beranda-hero-text">
            <span className="smk-badge">
              Tahun Ajaran {pengaturan.tahun_ajaran || "—"}
            </span>
            <h1>
              WEBSITE RESMI<br />
              <span className="smk-hero-highlight">{pengaturan.nama_sekolah}</span>
            </h1>
            <p>
              {pengaturan.deskripsi_singkat ||
                "Mencetak lulusan yang kompeten, berkarakter, dan siap bersaing di dunia industri melalui pembelajaran berbasis praktik."}
            </p>
            <div className="smk-beranda-cta">
              <NavLink to="/profil" className="smk-btn-primary">Profil Sekolah</NavLink>
              <NavLink to="/portofolio" className="smk-btn-secondary">Lihat Portofolio</NavLink>
            </div>
          </div>
          <div className="smk-beranda-hero-img">
            {/* Carousel Slider */}
            <div className="smk-hero-carousel">
              <div
                className="smk-hero-carousel-track"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {heroImages.map((src, i) => (
                  <div className="smk-hero-carousel-slide" key={i}>
                    <img src={src} alt={`${pengaturan.nama_sekolah} ${i + 1}`} />
                  </div>
                ))}
              </div>

              {heroImages.length > 1 && (
                <>
                  <button
                    className="smk-hero-carousel-arrow smk-hero-carousel-prev"
                    onClick={prev}
                    aria-label="Gambar sebelumnya"
                    type="button"
                  >
                    <Icon name="chevron-left" size={22} />
                  </button>
                  <button
                    className="smk-hero-carousel-arrow smk-hero-carousel-next"
                    onClick={next}
                    aria-label="Gambar berikutnya"
                    type="button"
                  >
                    <Icon name="chevron-right" size={22} />
                  </button>

                  <div className="smk-hero-carousel-dots">
                    {heroImages.map((_, i) => (
                      <button
                        key={i}
                        className={`smk-hero-carousel-dot${i === current ? " active" : ""}`}
                        onClick={() => goTo(i)}
                        aria-label={`Gambar ${i + 1}`}
                        type="button"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      {statistik.length > 0 && (
        <section className="smk-beranda-stats">
          <div className="smk-container">
            <div className="smk-stats-grid">
              {statistik.map((item, idx) => (
                <Reveal
                  variant="zoom"
                  delay={idx * 90}
                  className="smk-stat-card"
                  key={item.id}
                >
                  <span className="smk-stat-icon">
                    <Icon name={item.ikon} size={24} />
                  </span>
                  <strong className="smk-stat-number">{item.nilai}</strong>
                  <span className="smk-stat-label">{item.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KABAR TERBARU + AGENDA */}
      <section className="smk-section smk-bg-cream">
        <div className="smk-container">
          <div className="smk-section-head">
            <div>
              <span className="smk-eyebrow">Informasi</span>
              <h2 className="smk-section-title">Kabar &amp; Agenda Terbaru</h2>
            </div>
            <NavLink to="/berita" className="smk-link-more">
              Lihat semua <Icon name="arrowRight" size={15} />
            </NavLink>
          </div>

          {!kabarUtama && agendaTerdekat.length === 0 ? (
            <p className="smk-state-text">Belum ada kabar terbaru.</p>
          ) : (
            <>
              <div className="smk-berita-layout">
                {kabarUtama && (
                  <Reveal variant="left" className="smk-berita-featured-col">
                    <h2 className="smk-block-title">
                      <Icon name="star" size={18} /> Sorotan Utama
                    </h2>

                    <article className="smk-featured-card">
                      <div className="smk-featured-img">
                        {kabarUtama.img ? (
                          <img src={kabarUtama.img} alt={kabarUtama.title} />
                        ) : (
                          <div className="smk-berita-img-placeholder">
                            {pengaturan.nama_singkat}
                          </div>
                        )}
                        <span
                          className="smk-berita-tag"
                          style={{ background: kategoriColors[kabarUtama.tag] }}
                        >
                          {kabarUtama.tag}
                        </span>
                      </div>
                      <div className="smk-featured-body">
                        <div className="smk-berita-meta">
                          <span>
                            <Icon name="calendar" size={14} /> {formatTanggal(kabarUtama.date)}
                          </span>
                        </div>
                        <h3 className="smk-featured-title">{kabarUtama.title}</h3>
                        <p className="smk-featured-desc">{ringkas(kabarUtama.desc, 300)}</p>
                        <NavLink to={kabarUtama.href} className="smk-btn-gold">
                          Baca Selengkapnya <Icon name="arrowRight" size={16} />
                        </NavLink>
                      </div>
                    </article>
                  </Reveal>
                )}

                <Reveal as="aside" variant="right" delay={120} className="smk-agenda-side">
                  <h2 className="smk-block-title">
                    <Icon name="calendar" size={18} /> Agenda Sekolah
                  </h2>
                  {agendaTerdekat.length === 0 ? (
                    <p className="smk-state-text">Belum ada agenda terjadwal.</p>
                  ) : (
                    <div className="smk-agenda-list">
                      {agendaTerdekat.map((a) => (
                        <NavLink
                          to={`/berita/agenda/${a.id}`}
                          className="smk-agenda-item"
                          key={a.id}
                        >
                          <span className="smk-agenda-chip">
                            <strong>{new Date(a.date).getDate()}</strong>
                            <span>
                              {new Date(a.date).toLocaleDateString("id-ID", { month: "short" })}
                            </span>
                          </span>
                          <span className="smk-agenda-info">
                            <strong>{a.title}</strong>
                            <span>
                              <Icon name="mapPin" size={13} /> {a.location || "Lokasi menyusul"}
                            </span>
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </Reveal>
              </div>

              {kabarLainnya.length > 0 && (
                <div className="smk-berita-latest">
                  <h2 className="smk-block-title">
                    <Icon name="news" size={18} /> Kabar Lainnya
                    <span className="smk-block-count">{kabarLainnya.length} item</span>
                  </h2>
                  <div className="smk-berita-grid">
                    {kabarLainnya.map((item, idx) => (
                      <Reveal
                        as={NavLink}
                        variant="up"
                        delay={(idx % 3) * 90}
                        to={item.href}
                        className="smk-berita-card"
                        key={item.id}
                      >
                        <div className="smk-berita-img">
                          {item.img ? (
                            <img src={item.img} alt={item.title} />
                          ) : (
                            <div className="smk-berita-img-placeholder">
                              {pengaturan.nama_singkat}
                            </div>
                          )}
                          <span
                            className="smk-berita-tag"
                            style={{ background: kategoriColors[item.tag] }}
                          >
                            {item.tag}
                          </span>
                        </div>
                        <div className="smk-berita-body">
                          <div className="smk-berita-meta">
                            <span>
                              <Icon name="calendar" size={14} /> {formatTanggal(item.date)}
                            </span>
                          </div>
                          <h3 className="smk-berita-title">{item.title}</h3>
                          <p className="smk-berita-desc">{ringkas(item.desc)}</p>
                          <span className="smk-berita-more">
                            Baca Selengkapnya <Icon name="arrowRight" size={15} />
                          </span>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* PROGRAM KEAHLIAN */}
      <section className="smk-section">
        <div className="smk-container">
          <div className="smk-section-head">
            <div>
              <span className="smk-eyebrow">Jurusan</span>
              <h2 className="smk-section-title">Program Keahlian Unggulan</h2>
            </div>
            <NavLink to="/profil" className="smk-link-more">
              Selengkapnya <Icon name="arrowRight" size={15} />
            </NavLink>
          </div>
          <div className="smk-jurusan-grid">
            {jurusanPreview.map((item, idx) => (
              <Reveal
                variant="up"
                delay={(idx % 3) * 100}
                className="smk-jurusan-card"
                key={item.id}
              >
                <div className="smk-jurusan-icon">
                  <Icon name={item.icon || "graduation"} size={24} />
                </div>
                <h3 className="smk-jurusan-title">{item.nama_jurusan}</h3>
                <p className="smk-jurusan-desc">{item.deskripsi}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </ProfilLayout>
  );
}
