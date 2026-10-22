import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import ProfilLayout from "../layouts/ProfilLayout";
import { beritaMediaUrl } from "../../admin/components/AdminComponents";
import { asyncLoadAllBeritaData } from "../../berita/states/action";
import { useSiteSettings } from "../context/SiteSettingsContext";
import Icon from "../../../components/Icon";
import Reveal from "../../../components/Reveal";

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "berita", label: "Berita" },
  { key: "pengumuman", label: "Pengumuman" },
  { key: "agenda", label: "Agenda" },
];

const kategoriColors = {
  Berita: "#17406f",
  Pengumuman: "#0a1f3d",
  Agenda: "#b98a00",
};

const formatTanggal = (value) =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

const ringkas = (text, max = 220) => {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
};

export default function BeritaPage() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("semua");
  const [query, setQuery] = useState("");
  const { pengaturan } = useSiteSettings();

  const berita = useSelector((s) => s.berita || []);
  const agenda = useSelector((s) => s.agenda || []);
  const pengumuman = useSelector((s) => s.pengumuman || []);
  const loading = useSelector((s) => s.beritaLoading);

  useEffect(() => {
    dispatch(asyncLoadAllBeritaData());
  }, [dispatch]);

  const items = useMemo(() => {
    const mapped = [
      ...berita.map((b) => ({
        id: `berita-${b.id}`,
        href: `/berita/berita/${b.id}`,
        kategori: "Berita",
        title: b.title,
        date: b.createdAt,
        penulis: b.author || "Admin Sekolah",
        desc: b.description || b.excerpt || b.content || "",
        img: beritaMediaUrl(b.imageUrl),
        pinned: !!b.isPinned,
      })),
      ...pengumuman.map((p) => ({
        id: `pengumuman-${p.id}`,
        href: `/berita/pengumuman/${p.id}`,
        kategori: "Pengumuman",
        title: p.title,
        date: p.createdAt,
        penulis: p.author || "Admin Sekolah",
        desc: p.description || p.content || "",
        img: beritaMediaUrl(p.imageUrl),
        pinned: !!p.isPinned,
      })),
      ...agenda.map((a) => ({
        id: `agenda-${a.id}`,
        href: `/berita/agenda/${a.id}`,
        kategori: "Agenda",
        title: a.title,
        date: a.date,
        penulis: a.location || "Sekolah",
        desc: a.description || "Agenda kegiatan sekolah.",
        img: beritaMediaUrl(a.imageUrl),
      })),
    ];

    const filtered =
      tab === "semua"
        ? mapped
        : mapped.filter((i) => i.kategori.toLowerCase() === tab);

    const keyword = query.trim().toLowerCase();
    const searched = keyword
      ? filtered.filter((i) =>
          [i.title, i.desc, i.penulis, i.kategori]
            .map((v) => String(v || "").toLowerCase())
            .some((v) => v.includes(keyword)),
        )
      : filtered;

    return searched.sort(
      (a, b) =>
        Number(!!b.pinned) - Number(!!a.pinned) ||
        new Date(b.date || 0) - new Date(a.date || 0),
    );
  }, [berita, agenda, pengumuman, tab, query]);

  const utama = items[0] || null;
  const lainnya = items.slice(1);

  const agendaMendatang = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const upcoming = [...agenda]
      .filter((a) => a.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const future = upcoming.filter((a) => new Date(a.date) >= now);
    return (future.length ? future : upcoming).slice(0, 5);
  }, [agenda]);

  return (
    <ProfilLayout>
      {/* HERO */}
      <section className="smk-subpage-hero">
        <div className="smk-container">
          <span className="smk-badge">Informasi Terkini</span>
          <h1 className="smk-subpage-title">Berita &amp; Informasi</h1>
          <p className="smk-subpage-subtitle">
            Ikuti perkembangan terbaru seputar kegiatan, prestasi, dan pengumuman
            penting dari {pengaturan.nama_sekolah}.
          </p>
        </div>
      </section>

      <section className="smk-section">
        <div className="smk-container">
          <div className="smk-search-toolbar">
            <div className="smk-search-box">
              <span className="smk-search-icon">
                <Icon name="search" size={18} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari berita, pengumuman, atau agenda..."
                aria-label="Cari informasi"
              />
              {query && (
                <button
                  type="button"
                  className="smk-search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Bersihkan pencarian"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            {query && (
              <p className="smk-search-result">
                <strong>{items.length}</strong> hasil untuk &ldquo;{query}&rdquo;
              </p>
            )}
          </div>

          <div className="smk-berita-filters">
            {TABS.map((f) => (
              <button
                key={f.key}
                className={`smk-filter-btn${tab === f.key ? " is-active" : ""}`}
                onClick={() => setTab(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="smk-state-text">Memuat informasi…</p>
          ) : items.length === 0 ? (
            <p className="smk-state-text">
              {query
                ? `Tidak ada hasil untuk "${query}".`
                : "Belum ada informasi pada kategori ini."}
            </p>
          ) : (
            <>
              {/* BERITA UTAMA + AGENDA */}
              <div className="smk-berita-layout">
                <Reveal variant="left" className="smk-berita-featured-col">
                  <h2 className="smk-block-title">
                    <Icon name="star" size={18} /> Berita Utama
                  </h2>

                  <article className="smk-featured-card">
                    <div className="smk-featured-img">
                      {utama.img ? (
                        <img
                          src={utama.img}
                          alt={utama.title}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="smk-berita-img-placeholder"
                        style={{ display: utama.img ? "none" : "flex" }}
                      >
                        {pengaturan.nama_singkat || "SMK 3"}
                      </div>
                      <span
                        className="smk-berita-tag"
                        style={{ background: kategoriColors[utama.kategori] }}
                      >
                        {utama.kategori}
                      </span>
                      {utama.pinned && (
                        <span className="smk-berita-pin">
                          <Icon name="pin" size={13} /> Disematkan
                        </span>
                      )}
                    </div>
                    <div className="smk-featured-body">
                      <div className="smk-berita-meta">
                        <span>
                          <Icon name="calendar" size={14} /> {formatTanggal(utama.date)}
                        </span>
                        <span>
                          <Icon name="users" size={14} /> {utama.penulis}
                        </span>
                      </div>
                      <h3 className="smk-featured-title">{utama.title}</h3>
                      <p className="smk-featured-desc">{ringkas(utama.desc, 320)}</p>
                      <NavLink to={utama.href} className="smk-btn-gold">
                        Baca Selengkapnya <Icon name="arrowRight" size={16} />
                      </NavLink>
                    </div>
                  </article>
                </Reveal>

                <Reveal as="aside" variant="right" delay={120} className="smk-agenda-side">
                  <h2 className="smk-block-title">
                    <Icon name="calendar" size={18} /> Agenda Sekolah
                  </h2>
                  {agendaMendatang.length === 0 ? (
                    <p className="smk-state-text">Belum ada agenda terjadwal.</p>
                  ) : (
                    <div className="smk-agenda-list">
                      {agendaMendatang.map((a) => (
                        <NavLink
                          to={`/berita/agenda/${a.id}`}
                          className="smk-agenda-item"
                          key={a.id}
                        >
                          <span className="smk-agenda-chip">
                            <strong>{new Date(a.date).getDate()}</strong>
                            <span>
                              {new Date(a.date).toLocaleDateString("id-ID", {
                                month: "short",
                              })}
                            </span>
                          </span>
                          <span className="smk-agenda-info">
                            <strong>{a.title}</strong>
                            <span>
                              <Icon name="mapPin" size={13} />{" "}
                              {a.location || "Lokasi menyusul"}
                            </span>
                            {a.startTime && (
                              <span>
                                <Icon name="clock" size={13} /> {a.startTime.slice(0, 5)}
                                {a.endTime ? ` - ${a.endTime.slice(0, 5)}` : ""}
                              </span>
                            )}
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </Reveal>
              </div>

              {/* BERITA TERBARU */}
              <div className="smk-berita-latest">
                <h2 className="smk-block-title">
                  <Icon name="news" size={18} /> Berita Terbaru
                  <span className="smk-block-count">{lainnya.length} item</span>
                </h2>

                {lainnya.length === 0 ? (
                  <p className="smk-state-text">
                    Belum ada informasi lain untuk ditampilkan.
                  </p>
                ) : (
                  <div className="smk-berita-grid">
                    {lainnya.map((item, idx) => (
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
                            <img
                              src={item.img}
                              alt={item.title}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="smk-berita-img-placeholder"
                            style={{ display: item.img ? "none" : "flex" }}
                          >
                            {pengaturan.nama_singkat || "SMK 3"}
                          </div>
                          <span
                            className="smk-berita-tag"
                            style={{ background: kategoriColors[item.kategori] }}
                          >
                            {item.kategori}
                          </span>
                          {item.pinned && (
                            <span className="smk-berita-pin">
                              <Icon name="pin" size={13} /> Disematkan
                            </span>
                          )}
                        </div>
                        <div className="smk-berita-body">
                          <div className="smk-berita-meta">
                            <span>
                              <Icon name="calendar" size={14} /> {formatTanggal(item.date)}
                            </span>
                            <span>
                              <Icon name="users" size={14} /> {item.penulis}
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
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </ProfilLayout>
  );
}

