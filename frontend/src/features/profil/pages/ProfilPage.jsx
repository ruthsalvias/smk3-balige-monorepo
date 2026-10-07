import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ProfilLayout from "../layouts/ProfilLayout";
import {
  asyncLoadAllProfilData,
} from "../states/action";
import Icon from "../../../components/Icon";
import Reveal from "../../../components/Reveal";
import { mediaUrl } from "../../admin/components/AdminComponents";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { useHeroSlider } from "../hooks/useHeroSlider";

// Backend menyimpan path relatif (mis. "fasilitas/xxx.png") dan menyajikannya
// lewat gateway di /api/profile/uploads/*.
function toImgUrl(path) {
  return mediaUrl(path);
}

export default function ProfilPage() {
  const dispatch = useDispatch();
  const { hash } = useLocation();
  const { pengaturan } = useSiteSettings();

  const sejarahIdentitas = useSelector((s) => s.sejarahIdentitas);
  const visiMisi = useSelector((s) => s.visiMisi);
  const strukturOrganisasi = useSelector((s) => s.strukturOrganisasi);
  const fasilitas = useSelector((s) => s.fasilitas);
  const prestasi = useSelector((s) => s.prestasi);
  const programKeahlian = useSelector((s) => s.programKeahlian);
  const mitraKerjasama = useSelector((s) => s.mitraKerjasama);
  const loading = useSelector((s) => s.profilLoading);

  const heroImages = useMemo(() => {
    const list = (pengaturan?.hero_images || []).map((p) => mediaUrl(p)).filter(Boolean);
    return list.length > 0 ? list : ["/hero-fallback.png"];
  }, [pengaturan?.hero_images]);

  const { current, next, prev, goTo } = useHeroSlider(heroImages);

  useEffect(() => {
    dispatch(asyncLoadAllProfilData());
  }, [dispatch]);

  // Konten section dirender bertahap, jadi scroll anchor dijalankan setelah loading selesai.
  useEffect(() => {
    if (loading) return;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const target = document.querySelector(hash);
    if (!target) return;
    const timer = window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [hash, loading]);

  const visiList = visiMisi.filter((item) => item.tipe === "visi");
  const misiList = visiMisi.filter((item) => item.tipe === "misi");
  const sejarah = sejarahIdentitas[0] || null;

  return (
    <ProfilLayout>
      {/* ── HERO ── */}
      <section className="smk-beranda-hero">
        {/* Dynamic blurred & brightened background layer */}
        {heroImages.length > 0 && (
          <div
            className="smk-beranda-hero-bg"
            style={{ backgroundImage: `url(${heroImages[current] || heroImages[0]})` }}
          />
        )}
        <div className="smk-beranda-hero-inner">
          <div className="smk-beranda-hero-text">
            <span className="smk-badge">
              Tahun Ajaran {pengaturan?.tahun_ajaran || "—"}
            </span>
            <h1>
              PROFIL<br />
              <span className="smk-hero-highlight">
                {pengaturan?.nama_sekolah || "SMK Negeri 3 Balige"}
              </span>
            </h1>
            <p>
              {pengaturan?.deskripsi_singkat ||
                "Bergabunglah dengan kami dalam menciptakan masa depan yang cerah melalui pendidikan berkualitas, fasilitas modern, dan pengajaran yang inovatif."}
            </p>
            <div className="smk-beranda-cta">
              <a href="#sejarah" className="smk-btn-primary">
                Sejarah &amp; Identitas
              </a>
              <a href="#visi-misi" className="smk-btn-secondary">
                Visi &amp; Misi
              </a>
            </div>
          </div>

          {heroImages.length > 0 && (
            <div className="smk-beranda-hero-img">
              {/* Carousel Slider */}
              <div className="smk-hero-carousel">
                <div className="smk-hero-carousel-slides">
                  {heroImages.map((src, i) => (
                    <div
                      className={`smk-hero-carousel-slide${i === current ? " active" : ""}`}
                      key={i}
                    >
                      <img
                        src={src}
                        alt={`${pengaturan?.nama_sekolah || "SMK"} ${i + 1}`}
                        onError={(e) => {
                          if (!e.currentTarget.src.includes("hero-fallback.png")) {
                            e.currentTarget.src = "/hero-fallback.png";
                          }
                        }}
                      />
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
          )}
        </div>
      </section>

      {/* ── SEJARAH & IDENTITAS ── */}
      <section className="smk-section" id="sejarah">
        <div className="smk-container">
          <h2 className="smk-section-title">Sejarah &amp; Identitas</h2>
          {loading ? (
            <p className="smk-section-text" style={{ color: "#aaa" }}>Memuat data...</p>
          ) : sejarah ? (
            <p className="smk-section-text">
              {sejarah.tahun_berdiri && (
                <strong>Berdiri sejak {sejarah.tahun_berdiri}. </strong>
              )}
              {sejarah.deskripsi}
            </p>
          ) : (
            <p className="smk-section-text">
              Berdiri sejak [Tahun], SMK Negeri 3 Balige telah berkembang menjadi
              institusi vokasi unggulan yang fokus pada integrasi teknologi
              informasi dalam setiap aspek pendidikan. Kami berkomitmen untuk
              terus berinovasi dalam mencetak lulusan yang siap menghadapi
              tantangan industri global.
            </p>
          )}
        </div>
      </section>

      {/* ── VISI & MISI ── */}
      <section className="smk-section smk-bg-cream" id="visi-misi">
        <div className="smk-container smk-center">
          <h2 className="smk-section-title smk-title-center">
            Visi &amp; Misi
          </h2>
          <div className="smk-vm-grid">
            <div className="smk-vm-card">
              <div className="smk-vm-icon" style={{ background: "#F4C430" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </div>
              <h3 className="smk-vm-title">Visi</h3>
              {visiList.length > 1 ? (
                <ul className="smk-misi-list">
                  {visiList.map((item) => (
                    <li className="smk-misi-item" key={item.id}>
                      <span className="smk-misi-bullet" aria-hidden="true" />
                      <span className="smk-misi-text">{item.deskripsi}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {visiList[0]
                    ? visiList[0].deskripsi
                    : "Menjadi sekolah vokasi unggulan yang menghasilkan lulusan berakhlak mulia, kompeten, dan berdaya saing di tingkat nasional dan internasional pada tahun 2030."}
                </p>
              )}
            </div>

            <div className="smk-vm-card">
              <div className="smk-vm-icon" style={{ background: "#5A82F2" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
                </svg>
              </div>
              <h3 className="smk-vm-title">Misi</h3>
              {misiList.length > 0 ? (
                <ul className="smk-misi-list">
                  {misiList.map((item) => (
                    <li className="smk-misi-item" key={item.id}>
                      <span className="smk-misi-bullet" aria-hidden="true" />
                      <span className="smk-misi-text">{item.deskripsi}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  Menyelenggarakan pendidikan kejuruan berbasis teknologi,
                  membangun kemitraan industri strategis, mengembangkan karakter
                  dan kompetensi siswa, serta mewujudkan lingkungan belajar yang
                  inovatif dan berbudaya.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── STRUKTUR ORGANISASI ── */}
      <section className="smk-section" id="struktur-organisasi">
        <div className="smk-container smk-center">
          <h2 className="smk-section-title smk-title-center">
            Struktur Organisasi
          </h2>
          {strukturOrganisasi.length > 0 ? (
            <img
              src={toImgUrl(strukturOrganisasi[0].gambar)}
              alt="Struktur Organisasi"
              style={{ maxWidth: "100%", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
            />
          ) : (
            <div className="smk-org-chart">
              <div className="smk-org-row">
                <div className="smk-org-box smk-org-primary">Kepala Sekolah</div>
              </div>
              <div className="smk-org-connector-v" />
              <div className="smk-org-row">
                <div className="smk-org-box smk-org-primary">
                  Wakil Kepala Sekolah
                </div>
              </div>
              <div className="smk-org-connector-v" />
              <div className="smk-org-row smk-org-row-multi">
                <div className="smk-org-box">Waka Kurikulum</div>
                <div className="smk-org-box">Waka Kesiswaan</div>
                <div className="smk-org-box">Waka Sarpras</div>
                <div className="smk-org-box">Waka Humas</div>
              </div>
              <div className="smk-org-connector-v" />
              <div className="smk-org-row smk-org-row-multi">
                <div className="smk-org-box smk-org-small">Kepala Tata Usaha</div>
                <div className="smk-org-box smk-org-small">Dewan Guru</div>
                <div className="smk-org-box smk-org-small">Wali Kelas</div>
              </div>
              <div className="smk-org-connector-v" />
              <div className="smk-org-row">
                <div className="smk-org-box smk-org-student">SISWA</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FASILITAS & SARANA ── */}
      <section className="smk-section smk-bg-cream" id="fasilitas">
        <div className="smk-container smk-center">
          <h2 className="smk-section-title smk-title-center">
            Fasilitas &amp; Sarana Belajar
          </h2>
          <div className="smk-facility-grid">
            {fasilitas.length > 0 ? (
              fasilitas.map((item, idx) => (
                <Reveal
                  variant="zoom"
                  delay={(idx % 3) * 90}
                  className="smk-facility-card"
                  key={item.id}
                >
                  <img
                    src={toImgUrl(item.foto)}
                    alt={item.nama_fasilitas}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span className="smk-facility-label">{item.nama_fasilitas}</span>
                </Reveal>
              ))
            ) : (
              <p className="smk-state-text">Data fasilitas belum tersedia.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── PRESTASI SEKOLAH ── */}
      <section className="smk-section" id="prestasi">
        <div className="smk-container smk-center">
          <span className="smk-badge smk-badge-outline">Prestasi &amp; Penghargaan</span>
          <h2 className="smk-section-title smk-title-center" style={{ marginTop: "16px" }}>
            Prestasi Sekolah
          </h2>
          <p className="smk-section-subtitle">
            Torehan prestasi dan kejuaraan membanggakan yang diraih oleh siswa serta guru SMK Negeri 3 Balige.
          </p>

          {/* Prestasi Cards Grid */}
          <div className="smk-prestasi-grid">
            {prestasi.length > 0 ? (
              prestasi.map((item, idx) => {
                const tingkatKey = (item.tingkat || "").toLowerCase();
                return (
                  <Reveal
                    variant="up"
                    delay={(idx % 3) * 80}
                    className={`smk-prestasi-card smk-prestasi-card-${tingkatKey}`}
                    key={item.id}
                  >
                    <div className="smk-prestasi-top">
                      <span className={`smk-prestasi-badge smk-prestasi-badge-${tingkatKey}`}>
                        <Icon name="trophy" size={13} />
                        Tingkat {item.tingkat ? item.tingkat.charAt(0).toUpperCase() + item.tingkat.slice(1) : "Sekolah"}
                      </span>
                      {item.tahun && (
                        <span className="smk-prestasi-year">
                          <Icon name="calendar" size={13} /> {item.tahun}
                        </span>
                      )}
                    </div>
                    <h4 className="smk-prestasi-title">{item.judul}</h4>
                    {item.keterangan && (
                      <p className="smk-prestasi-desc">{item.keterangan}</p>
                    )}
                  </Reveal>
                );
              })
            ) : (
              <p className="smk-state-text">Data prestasi belum tersedia.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── JURUSAN / PROGRAM KEAHLIAN ── */}
      <section className="smk-section smk-bg-cream" id="program-keahlian">
        <div className="smk-container smk-center">
          <span className="smk-badge smk-badge-outline">Program Keahlian</span>
          <h2 className="smk-section-title smk-title-center" style={{ marginTop: "16px" }}>
            Jurusan Di SMK Negeri 3 Balige
          </h2>
          <p className="smk-section-subtitle">
            Pilihan program keahlian di SMK Negeri 3 Balige.
          </p>
          <div className="smk-jurusan-grid">
            {programKeahlian.length > 0 ? (
              programKeahlian.map((item, idx) => (
                <Reveal
                  variant="up"
                  delay={(idx % 3) * 90}
                  className="smk-jurusan-card"
                  key={item.id}
                >
                  <div className="smk-jurusan-icon">
                    <Icon name={item.icon || "graduation"} size={26} />
                  </div>
                  <h3 className="smk-jurusan-title">{item.nama_jurusan}</h3>
                  <p className="smk-jurusan-desc">{item.deskripsi}</p>
                </Reveal>
              ))
            ) : (
              <p className="smk-state-text">Data program keahlian belum tersedia.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── MITRA KERJASAMA ── */}
      <section className="smk-section" id="mitra">
        <div className="smk-container smk-center">
          <span className="smk-badge smk-badge-outline">Mitra Kerjasama</span>
          <h2 className="smk-section-title smk-title-center" style={{ marginTop: "16px" }}>
            Mitra Kerjasama
          </h2>
          <p className="smk-section-subtitle">
            Sinergi dan kolaborasi strategis bersama dunia usaha &amp; industri.
          </p>
          <div className="smk-mitra-grid">
            {mitraKerjasama.length > 0 ? (
              mitraKerjasama.map((item, idx) => (
                <Reveal
                  variant="zoom"
                  delay={(idx % 4) * 80}
                  className="smk-mitra-card"
                  key={item.id}
                >
                  <div className="smk-mitra-logo-wrap">
                    {item.logo ? (
                      <img
                        src={toImgUrl(item.logo)}
                        alt={item.nama_mitra}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <span className="smk-mitra-logo">
                        <Icon name="handshake" size={24} />
                      </span>
                    )}
                  </div>
                  <span className="smk-mitra-name">{item.nama_mitra}</span>
                </Reveal>
              ))
            ) : (
              <p className="smk-state-text">Data mitra kerjasama belum tersedia.</p>
            )}
          </div>
        </div>
      </section>
    </ProfilLayout>
  );
}
